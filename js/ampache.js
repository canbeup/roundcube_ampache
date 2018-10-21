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
				locStore.set('ampache.last.folder', null);
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
		},
		songs: function(){
			$('#ampSNG' + locStore.get('ampache.player.last.id')).addClass('unread');
			$('#ampSNG' + locStore.get('ampache.player.last.id')).addClass('selected');
			$('#currentArtwork').attr('src', $('#ampSNG' + locStore.get('ampache.player.last.id')).data('art'));
		},
	},
	getAverageRGB: function(imgEl){
		var blockSize = 5,
			defaultRGB = {r:0,g:0,b:0},
			canvas = document.createElement('canvas'),
			context = canvas.getContext && canvas.getContext('2d'),
			data, width, height,
			i = -4,
			length,
			rgb = {r:0,g:0,b:0},
			count = 0;
		if(!context){
			alert(1);
			$(canvas).remove();
			return defaultRGB;
		}
		height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
		width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
		context.drawImage(imgEl, 0, 0);
		try{
			data = context.getImageData(0, 0, width, height);
		}catch(e){
			alert(e);
			$(canvas).remove();
			return defaultRGB;
		}
		length = data.data.length;
		while((i += blockSize * 4) < length){
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