var player = {
  audio: [],
  index: 0,
  isplaying: false,
  crossfade: false,
  ondex: function(){
    if(player.index===0) return 1;
    else return 0;
  },
  load: function(id, index){
    if(index===undefined) index = player.index;
    var url = '';
    if(!isNaN(id)){
      $('#ampSNG' + locStore.get('ampache.player.last.id')).removeClass('unread');
      $('#ampSNG' + locStore.get('ampache.player.last.id')).removeClass('selected');
      url = $('#ampSLNK' + id).attr('href');
      locStore.set('ampache.player.last.id', id);
      ampache.after.songs();
      // player.notification(id);
    }else url = id;
    locStore.set('ampache.player.last.url', url);
    player.audio[index].src = url;
    player.audio[index].load(); player.audio[index].play();
    player.isplaying = true;
  },
  next: function(index){
    if(index===undefined) index = player.index;
    var id = $('#messagelist-content tr.unread').next('tr').attr('id');
    if(id===undefined) id = $('#messagelist-content tbody tr:first').attr('id');
    if(id===undefined) return;
    id = id.substring(6);
    player.load(id, index);
  },
  previous: function(){
    if(player.audio[player.index].currentTime>5){
      player.timeset(0);
    }else{
      var id = $('#messagelist-content tr.unread').prev('tr').attr('id');
      if(id===undefined) id = $('#messagelist-content tr:last').attr('id');
      if(id===undefined) return;
      id = id.substring(6);
      player.load(id, player.index);
    }
  },
  toggle: function(){
    player.isplaying = !player.isplaying;
    if(player.isplaying){
      player.audio[player.index].play();
      $('#radio .quota-widget').removeClass('pause');
    }else{
      player.audio[player.index].pause();
      $('#radio .quota-widget').addClass('pause');
    }
  },
  timeupdate: function(index){
    if(index!=player.index) return;
    locStore.set('ampache.player.last.seek', player.audio[player.index].currentTime);
    var per = (player.audio[player.index].currentTime / player.audio[player.index].duration) * 100;
    $("#radio .bar .value").css('width', per + '%');
    player.loadupdate();
    if(player.audio[player.index].currentTime + 10 >= player.audio[player.index].duration){
      if(player.crossfade){
        player.audio[player.index].volume = (player.audio[player.index].duration - player.audio[player.index].currentTime) / 10;
        player.audio[player.ondex()].volume = 1 - ((player.audio[player.index].duration - player.audio[player.index].currentTime) / 10);
      }else{
        player.crossfade = true;
        player.audio[player.ondex()].volume = 0;
        player.next(player.ondex());
      }
    }
  },
  timeend: function(index){
    if(index!=player.index) return;
    if(player.crossfade){
      player.notification(locStore.get('ampache.player.last.id'));
      player.crossfade = false;
      player.index = player.ondex();
      player.audio[player.ondex()].volume = 1;
      player.audio[player.index].volume = 1;
    }
  },
  loadupdate: function(index){
    if(index!=player.index) return;
    var range = 0;
    var bf = player.audio[index].buffered;
    var time = player.audio[index].currentTime;
    if(bf.length===0) return;
    while(!(bf.start(range) <= time && time <= bf.end(range))) range += 1;
    var loadStartPercentage = bf.start(range);
    var loadEndPercentage = bf.end(range);
    var loadPercentage = loadEndPercentage - loadStartPercentage;
    var per = (bf.end(range) / player.audio[index].duration) * 100;
    $("#radio .bar .value.buffered").css('width', per + '%');
  },
  timeset: function(time){
    player.audio[player.index].currentTime = time;
  },
  timeperc: function(perc){
    player.audio[player.index].currentTime = (player.audio[player.index].duration / 100) * perc;
  },
  notification: function(id){
    if(Notification.permission === "granted"){
      if($('#ampSLNK' + id + ' #title').html()===undefined) return;
      var notification = new Notification($('#ampSLNK' + id + ' #title').html(), { icon: $('#currentArtwork').attr('src'), body: $('#ampSLNK' + id + ' #author').html() + "\n" + $('#ampSALB' + id).html() });
      notification.onclick = function(){ this.close(); };
    }
  }
};

$(function(){
  player.audio[0] = document.getElementById("audioplayer");
  player.audio[1] = document.getElementById("audioplayer2");
  player.audio[0].addEventListener('timeupdate',function(){ player.timeupdate(0); });
  player.audio[1].addEventListener('timeupdate',function(){ player.timeupdate(1); });
  player.audio[0].addEventListener('progress',function(){ player.loadupdate(0); });
  player.audio[1].addEventListener('progress',function(){ player.loadupdate(1); });
  player.audio[0].addEventListener('ended',function(e){ player.timeend(0); });
  player.audio[1].addEventListener('ended',function(e){ player.timeend(1); });
  $('#radio .quota-widget:before').on('click', function(){ player.toggle(); });
  $("#radio .bar").on("click", function(e){
    var parentOffset = $(this).parent().offset();
    var relX = e.pageX - parentOffset.left;
    var perc = relX / $(this).width() * 100;
    player.timeperc(perc);
  });
  if(locStore.get('ampache.player.last.url')!==null){
    player.audio[0].src = locStore.get('ampache.player.last.url');
    player.audio[0].load();
    if(locStore.get('ampache.player.last.seek')!==null) player.timeset(locStore.get('ampache.player.last.seek'));
    $("#audioplayer").unbind("loadstart");
    player.audio[0].play();
    player.isplaying = true;
  }
});