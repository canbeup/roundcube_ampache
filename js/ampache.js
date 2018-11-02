var ampache = {
  previous: function(){
    var id = $('#mailboxlist li.unread').prev('li');
    if(id===undefined) return; // id = $('#mailboxlist li:last');
    id.children('a').trigger('click');
  },
  next: function(){
    var id = $('#mailboxlist li.unread').next('li');
    if(id===undefined) return; // id = $('#mailboxlist li:first');
    id.children('a').trigger('click');
  },
  load: {
    folder: function(folder){
      if(folder===undefined||folder===null){
        $('#mailboxlist').load('./?_task=ampache&_action=getTree');
        locStore.unset('ampache.last.folder');
      }else{
        $('#mailboxlist').load('./?_task=ampache&_action=getFolder&folder=' + folder, function(){ ampache.after.folder(); });
        locStore.set('ampache.last.folder', folder);
      }
    },
    songs: function(type, filter, start, step){
      $('#ampCAT' + locStore.get('ampache.last.filter')).removeClass('unread');
      $('#ampCAT' + locStore.get('ampache.last.filter')).removeClass('selected');
      if(type===undefined) type = 'songs';
      if(filter===undefined) filter = '';
      if(start===undefined) start = 0;
      if(step===undefined) step = 250;
      locStore.set('ampache.last.type', type);
      locStore.set('ampache.last.filter', filter);
      locStore.set('ampache.last.start', start);
      locStore.set('ampache.last.step', step);
      $('#messagelist-content').load('./?_task=ampache&_action=getSongs&type=' + type + '&filter=' + filter + '&limit=' + start + '&step=' + step, function(){ ampache.after.folder(); ampache.after.songs(); });
    }
  },
  after: {
    folder: function(){
      $('#ampCAT' + locStore.get('ampache.last.filter')).addClass('unread');
      $('#ampCAT' + locStore.get('ampache.last.filter')).addClass('selected');
      ampache.scrollToElement(document.getElementById('ampCAT' + locStore.get('ampache.last.filter')), document.getElementById('folderlist-content'));
    },
    songs: function(){
      $('#ampSNG' + locStore.get('ampache.player.last.id')).addClass('unread');
      $('#ampSNG' + locStore.get('ampache.player.last.id')).addClass('selected');
      $('#currentArtwork').attr('src', $('#ampSNG' + locStore.get('ampache.player.last.id')).data('art'));
      ampache.scrollToElement(document.getElementById('ampSNG' + locStore.get('ampache.player.last.id')), document.getElementById('messagelist-content'));
    }
  },
  getAverageRGB: function(imgEl){
    var blockSize = 5,
        defaultRGB = {r:0,g:0,b:0},
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width,
        i = -4,
        rgb = {r:0,g:0,b:0},
        count = 0;
    if(!context){
      $(canvas).remove();
      return defaultRGB;
    }
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
    context.drawImage(imgEl, 0, 0);
    try{
      data = context.getImageData(0, 0, width, 1);
    }catch(e){
      alert(e);
      $(canvas).remove();
      return defaultRGB;
    }
    var colorChange = false, lastColor = '';
    while((i += blockSize * 4) < width){
      ++count;
      rgb.r += data.data[i];
      rgb.g += data.data[i+1];
      rgb.b += data.data[i+2];
    }
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);
    $(canvas).remove();
    return rgb;
  },
  scrollToElement: function(element, container){
    if(element===undefined || element===null) return;
    if(element.offsetTop < container.scrollTop){
      container.scrollTop = element.offsetTop;
    }else{
      var offsetBottom = element.offsetTop + element.offsetHeight;
      var scrollBottom = container.scrollTop + container.offsetHeight;
      if(offsetBottom > scrollBottom){
        container.scrollTop = offsetBottom - container.offsetHeight;
      }
    }
  }
};

$(function(){
  ampache.load.folder(locStore.get('ampache.last.folder'));
  if(locStore.get('ampache.last.type')!==null) ampache.load.songs(locStore.get('ampache.last.type'), locStore.get('ampache.last.filter'), locStore.get('ampache.last.start'), locStore.get('ampache.last.step'));
  $('#currentArtwork').on('load', function(){
    var rgb = ampache.getAverageRGB(document.getElementById('currentArtwork'));
    $('.content .iframe-wrapper').css('background-color', 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
  });
});