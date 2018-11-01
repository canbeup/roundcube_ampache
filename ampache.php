<?php
class ampache extends rcube_plugin
{
  public $task = '.*';
  public $rc;
  public $ui;
  private $env_loaded = false;
  /**
  * Plugin initialization.
  */
  function init()
  {
    $this->rc = rcube::get_instance();
    if($this->rc->task == 'settings')
    {
      $this->add_hook('preferences_sections_list', array($this, 'ampache_preferences_sections_list'));
      $this->add_hook('preferences_list', array($this, 'ampache_preferences_list'));
      $this->add_hook('preferences_save', array($this, 'ampache_preferences_save'));
    }
    elseif($this->rc->task == 'ampache')
    {
      $skin_path = $this->local_skin_path();
      $this->include_stylesheet($skin_path."/ampache.css");
    }
    $this->load_ui();
    $this->register_task('ampache');
    $this->register_action('getTree', array($this, 'getTree'));
    $this->register_action('getFolder', array($this, 'getFolder'));
    $this->register_action('getFeeds', array($this, 'getFeeds'));
    $this->register_action('getSongs', array($this, 'getSongs'));
    $this->register_action('getArtWork', array($this, 'getArtWork'));
    $this->add_hook('startup', array($this, 'startup'));
    $this->register_action('index', array($this, 'action'));
  }
  /**
* Startup the application, adding the Task-button
*/
  function startup()
  {
    $rcmail = rcmail::get_instance();
    if(!$rcmail->output->framed && $this->rc->config->get('ampache_username') !== null)
    {
      // add taskbar button
      $this->add_button(array(
        'command'    => 'ampache',
        'class'      => 'button-ampache',
        'classsel'   => 'button-ampache button-selected',
        'innerclass' => 'button-inner',
        'label'      => 'ampache.ampache',
        'type'       => 'link',
      ), 'taskbar');
      $this->include_stylesheet('ampache.css');
    }
  }
  /**
  * Create the connection to ampache with API
  *
  * @return class of ampacheAPI
  */
  function createAPI()
  {
    require_once __DIR__ . '/AmpacheApi.php';
    $username = $this->rc->config->get('ampache_username');
    if($username!==null)
    {
      $url = $this->rc->config->get('ampache_url');
      $api_secure = false;
      if(substr($url, 0, strlen('http://'))=='http://'){
        $url = substr($url, strlen('http://'));
      }elseif(substr($url, 0, strlen('https://'))=='https://'){
        $url = substr($url, strlen('https://'));
        $api_secure = true;
      }
      $passwd = $this->decrypt($this->rc->config->get('ampache_passwd'));
      $ampache = new AmpacheApi\AmpacheApi(array(
        'server' => $url, // Server address, without http/https prefix
        'username' => $username, // Username
        'password' => $passwd, // Password
        'api_secure' => $api_secure // Set to true to use https
      ));
      if($ampache->state()!='CONNECTED') return false;
      else return $ampache;
    }
    else
      return false;
    exit;
  }
  /**
  * Echo the unreads elements on ampache and exit
  */
  function getAll()
  {
    $ampache = $this->createAPI();
    if($ampache!==false)
    {
      $stats = $ampache->info();
      echo "Songs: " . $stats['songs'] . "<br />\n";
      echo "Albums: " . $stats['albums'] . "<br />\n";
      echo "Artists: " . $stats['artists'] . "<br />\n";
      echo "Playlists: " . $stats['playlists'] . "<br />\n";
      echo "Videos: " . $stats['videos'] . "<br />\n";
    }
    exit;
  }
  /**
  * Echo the tree of folders and exit
  */
  function getTree()
  {
    $ampache = $this->createAPI();
    if($ampache!==false)
    {
?>
<li id="amFLSongs" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=songs" data-type="folder" data-path="music/gloony/" onclick="ampache.load.songs(); return false;">Songs</a>
</li>
<li id="amFLAlbums" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=albums" data-type="folder" data-path="music/gloony/" onclick="ampache.load.folder('albums'); return false;">Albums</a>
</li>
<li id="amFLArtists" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=artists" data-type="folder" data-path="music/gloony/" onclick="ampache.load.folder('artists'); return false;">Artists</a>
</li>
<li id="amFLPlaylists" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=playlists" data-type="folder" data-path="music/gloony/" onclick="ampache.load.folder('playlists'); return false;">Playlists</a>
</li>
<li id="amFLFavourites" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=favourites" data-type="folder" data-path="music/gloony/" onclick="return false;">Favourites</a>
</li>
<li id="amFLTags" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=genre" data-type="folder" data-path="music/gloony/" onclick="ampache.load.folder('tags'); return false;">Genre</a>
</li>
<li id="amFLLast" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=last" data-type="folder" data-path="music/gloony/" onclick="return false;">Last played</a>
</li>
<li id="amFLRecent" class="mailbox" role="treeitem" aria-level="1">
  <a href="./?_task=ampache&amp;list=recent" data-type="folder" data-path="music/gloony/" onclick="return false;">Recently Added</a>
</li>
<?php
    }
    exit;
  }
  /**
  * Echo the tree of folders and exit
  */
  function getFolder()
  {
    $ampache = $this->createAPI();
    if($ampache!==false)
    {
      // if(isset($_GET['folder'])||empty($_GET['folder'])) return $this->getTree();
      $callback = $ampache->send_command($_GET['folder']);
      echo '			<li id="trsCAT" class="'.$class.'" role="treeitem" aria-level="1">
<a data-type="folder" onclick="ampache.load.folder(); return false;">..</a>
</li>';
      $type = substr($_GET['folder'], 0, strlen($_GET['folder']) - 1);
      foreach($callback as $item){
        $item = $item[$type];
        $class = 'mailbox'; $unread = '';
        // if($item['unread']>0){
        // 	$class .= ' unread';
        if(isset($item['tracks'])) $unread = '<span class="unreadcount">'.$item['tracks'].'</span>';
        elseif(isset($item['songs'])) $unread = '<span class="unreadcount">'.$item['songs'].'</span>';
        // 	$view_mode = 'unread';
        // }else{
        // 	$view_mode = 'all_articles';
        // }
        if($unread!==''){
          echo '			<li id="ampCAT'.$item['self']['id'].'" class="'.$class.'" role="treeitem" aria-level="1">
<a data-type="folder" data-path="'.$path.$item['name'].'" onclick="ampache.load.songs(\''.$type.'_songs\', '.$item['self']['id'].'); return false;">'.$item['name'].$unread.'</a>
</li>';
        }
      }
    }
    exit;
  }
  /**
  * Echo the tree of folders and exit
  */
  function getSongs()
  {
    $ampache = $this->createAPI();
    if($ampache!==false)
    {
      echo '<table id="messagelist" class="listing messagelist sortheader fixedheader focus" aria-labelledby="aria-label-messagelist" data-list="message_list" data-label-msg="The list is empty."><thead><tr><th id="rcmsubject" class="subject" style=""><a href="./#sort" class="sortcol" rel="subject" title="Sort by" tabindex="-1">Subject</a></th><th id="rcmfromto" class="fromto" rel="fromto" style=""><a href="./#sort" class="sortcol" rel="fromto" title="Sort by" tabindex="-1">From</a></th><th id="rcmdate" class="date" style=""><a href="./#sort" class="sortcol" rel="date" title="Sort by" tabindex="-1">Date</a></th><th id="rcmflag" class="flag" style=""><span class="flagged">Flagged</span></th><th id="rcmattachment" class="attachment" style=""><span class="attachment">Attachment</span></th></tr></thead><tbody>';
      if(isset($_GET['start'])) $start = $_GET['start'];
      else $start = 0;
      if(isset($_GET['step'])) $step = $_GET['step'];
      else $step = 250;
      if(isset($_GET['filter'])) $filter = $_GET['filter'];
      else $filter = '';
      if(isset($_GET['type'])) $type = $_GET['type'];
      else $type = 'songs';
      $callback = $ampache->send_command($type, array('filter' => $filter, 'offset' => $start, 'limit' => $step));
      $url = ''; // $this->rc->config->get('ampache_url');
      foreach($callback as $item){
        $item = $item['song'];
        $class = ''; $unread = '';
        $seconds = $item['time']; $hours = floor($seconds / 3600); $mins = floor($seconds / 60 % 60); $secs = floor($seconds % 60);
        echo '		<tr id="ampSNG'.$item['self']['id'].'" class="message'.$class.'" data-art="./?_task=ampache&_action=getArtWork&url='.$url.$item['art'].'">
<td class="selection">
<input type="checkbox" tabindex="-1">
</td>
<td class="subject" tabindex="0">
<span class="fromto skip-on-drag">
<span class="adr">
<span id="ampSALB'.$item['self']['id'].'" class="rcmContactAddress">'.$item['album'].'</span>
</span>
</span>
<span id="ampSDT'.$item['self']['id'].'" class="date skip-on-drag">'.sprintf('%02d:%02d:%02d', $hours, $mins, $secs).'</span>
<span class="subject">
<span id="ampSDTL'.$item['self']['id'].'" class="msgicon status" title=""></span>
<a id="ampSLNK'.$item['self']['id'].'" href="'.$url.$item['url'].'" tabindex="-1" onClick="player.load('.$item['self']['id'].'); return false;">
<span id="author">'.$item['artist'].'</span> - <span id="title">'.$item['title'].'</span>
</a>
</span>
</td>
<td class="flags">
<span class="flag"><span id="flagicnrcmrowOTE" class="unflagged" title="Close File" onclick="return false;"></span></span>
<span class="attachment">&nbsp;</span>
</td>
</tr>';
      }
      echo '</tbody></table>';
    }
    exit;
  }
  function getArtWork(){
    header("Content-Type: image/jpeg");
    echo file_get_contents($_GET['url']);
    exit;
  }
  /**
  * Manage the action (called from Roundcube)
  */
  function action()
  {
    $rcmail = rcmail::get_instance();
    if($rcmail->action == 'index')
    {
      $url = $this->rc->config->get('ampache_url');
      $url = str_replace('http://', '', $url);
      $url = str_replace('https://', '', $url);
      $header_title = $this->rc->config->get('ampache_username').'@'.$url;
      $rcmail->output->set_env('ampache_header_title', $header_title);
      $this->include_script('js/ampache.js');
      $this->include_script('js/locStore.js');
      $this->include_script('js/keyboard.js');
      $this->include_script('js/player.js');
      $rcmail->output->set_pagetitle($this->gettext('ampache'));
      $rcmail->output->add_handlers(array('ampachecontent' => array($this, 'content')));
      $rcmail->output->send('ampache.ampache');
    }
  }
  /**
  * Called on logout from Roundcube.
  * Destroy the ampache-session
  */
  function logout($args)
  {
    $rcmail = rcmail::get_instance();
    $dbh = new PDO($rcmail->config->get('ampache_dbdriver', false).':dbname='.$rcmail->config->get('ampache_dbname', false).';host='.$rcmail->config->get('ampache_dbhost', false), $rcmail->config->get('ampache_dbuser', false), $rcmail->config->get('ampache_dbpass', false));
    $stmt = $dbh->prepare("DELETE FROM sessions WHERE sess_ID=:id");
    $stmt->bindParam(':id', $_COOKIE['ampache_sess']);
    $stmt->execute();
    setcookie('ampache_sess', '', time() - 3600);
  }
  /**
  * Display the content of the calender (calling ampache)
  */
  function content($attrib)
  {
    $rcmail = rcmail::get_instance();
    $url = $this->rc->config->get('ampache_url').'api/';
    $username = $this->rc->config->get('ampache_username');
    $passwd = $this->decrypt($this->rc->config->get('ampache_passwd'));
    $rcmail->output->set_env('ampache_url', $url);
    return $rcmail->output->frame($attrib);
  }
  /**
  * Handler for preferences_sections_list hook.
  * Adds Encryption settings section into preferences sections list.
  *
  * @param array Original parameters
  *
  * @return array Modified parameters
  */
  function ampache_preferences_sections_list($p)
  {
    $this->add_texts('localization/');
    $p['list']['ampache'] = array(
      'id' => 'ampache',
      'section' => $this->gettext('ampache'),
    );
    return $p;
  }
  /**
  * Handler for preferences_list hook.
  * Adds options blocks into ampache settings sections in Preferences.
  *
  * @param array Original parameters
  *
  * @return array Modified parameters
  */
  function ampache_preferences_list($p)
  {
    $this->add_texts('localization/');
    if($p['section'] != 'ampache') return $p;
    $urlV = rcube_utils::get_input_value('ampache_url', rcube_utils::INPUT_POST);
    $usernameV = rcube_utils::get_input_value('ampache_username', rcube_utils::INPUT_POST);
    $passwdV = rcube_utils::get_input_value('ampache_passwd', rcube_utils::INPUT_POST);
    $url = new html_inputfield(array('name' => 'ampache_url', 'type' => 'text', 'autocomplete' => 'off', 'value' => $urlV != '' ? $urlV : $this->rc->config->get('ampache_url'), 'size' => 255));
    $username = new html_inputfield(array('name' => 'ampache_username', 'type' => 'text', 'autocomplete' => 'off', 'value' => $usernameV != '' ? $usernameV : $this->rc->config->get('ampache_username'), 'size' => 255));
    $passwd = new html_inputfield(array('name' => 'ampache_passwd', 'type' => 'password', 'autocomplete' => 'off', 'value' => '', 'size' => 255));
    $p['blocks']['ampache_preferences_section'] = array(
      'options' => array(
        array('title'=> rcube::Q($this->gettext('url')), 'content' => $url->show()),
        array('title'=> rcube::Q($this->gettext('username')), 'content' => $username->show()),
        array('title'=> rcube::Q($this->gettext('password')), 'content' => $passwd->show()),
      ),
      'name' => rcube::Q($this->gettext('ampache_settings'))
    );
    return $p;
  }
  /**
  * Handler for preferences_save hook.
  * Executed on ampache settings form submit.
  *
  * @param array Original parameters
  *
  * @return array Modified parameters
  */
  function ampache_preferences_save($p)
  {
    $this->add_texts('localization/');
    if ($p['section'] == 'ampache')
    {
      $rcmail = rcmail::get_instance();
      $url = rcube_utils::get_input_value('ampache_url', rcube_utils::INPUT_POST);
      if(substr($url, strlen($url) - 1)=='/') $url .= substr($url, 0, strlen($url) - 1);
      $username = rcube_utils::get_input_value('ampache_username', rcube_utils::INPUT_POST);
      $passwd = rcube_utils::get_input_value('ampache_passwd', rcube_utils::INPUT_POST);
      if($passwd == '') $passwd = $this->decrypt($this->rc->config->get('ampache_passwd'));
      $p['prefs'] = array(
        'ampache_url'  => $url,
        'ampache_username'  => $username,
        'ampache_passwd'    => $this->encrypt($passwd),
      );
    }
    return $p;
  }
  /**
  * Plugin environment initialization.
  */
  function load_env()
  {
    if($this->env_loaded)
      return;
    $this->env_loaded = true;
    // load the ampache plugin configuration
    $this->load_config();
    // include localization (if wasn't included before)
    $this->add_texts('localization/');
  }
  /**
  * Plugin UI initialization.
  */
  function load_ui()
  {
    $this->load_env();
  }
  /**
  * Encrypt a passwort (key: IMAP-password)
  *
  * @param string $passwd             Password as plain text
  * @return string                    Encrypted password
  */
  private function encrypt($passwd)
  {
    $rcmail = rcmail::get_instance();
    $imap_password = $rcmail->decrypt($_SESSION['password']);
    while(strlen($imap_password)<24)
      $imap_password .= $imap_password;
    $imap_password = substr($imap_password, 0, 24);
    $deskey_backup = $rcmail->config->set('ampache_des_key', $imap_password);
    $enc = $rcmail->encrypt($passwd, 'ampache_des_key');
    $deskey_backup = $rcmail->config->set('ampache_des_key', '');
    return $enc;
  }
  /**
  * Decrypt a passwort (key: IMAP-password)
  *
  * @param string $passwd             Encrypted password
  * @return string                    Passwort as plain text
  */
  private function decrypt($passwd)
  {
    $rcmail = rcmail::get_instance();
    $imap_password = $rcmail->decrypt($_SESSION['password']);
    while(strlen($imap_password)<24)
      $imap_password .= $imap_password;
    $imap_password = substr($imap_password, 0, 24);
    $deskey_backup = $rcmail->config->set('ampache_des_key', $imap_password);
    $clear = $rcmail->decrypt($passwd, 'ampache_des_key');
    $deskey_backup = $rcmail->config->set('ampache_des_key', '');
    return $clear;
  }
}