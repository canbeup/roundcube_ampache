var player = {
	audio: [],
	index: 0,
	isplaying: false,
	load: function(id){
		var url = '';
		if(!isNaN(id)){
			$('#ampSNG' + locStore.get('ampache.player.last.id')).removeClass('unread');
			url = $('#ampSLNK' + id).attr('href');
			locStore.set('ampache.player.last.id', id);
			ampache.after.songs();
			// player.notification(id);
			player.asnotified = true;
		}else url = id;
		locStore.set('ampache.player.last.url', url);
		player.audio[0].src = url;
		player.audio[0].load(); player.audio[0].play();
		player.isplaying = true;
	},
	next: function(){
		var id = $('#messagelist-content tr.unread').next('tr').attr('id');
		if(id===undefined) id = $('#messagelist-content tbody tr:first').attr('id');
		id = id.substring(6);
		player.load(id);
	},
	previous: function(){
		if(player.audio[player.index].currentTime>5){
			player.timeset(0);
		}else{
			var id = $('#messagelist-content tr.unread').prev('tr').attr('id');
			if(id===undefined) id = $('#messagelist-content tr:last').attr('id');
			id = id.substring(6);
			player.load(id);
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
	timeupdate: function(){
		if(player.audio[player.index].currentTime>1&&player.asnotified){
			player.notification(locStore.get('ampache.player.last.id'));
			player.asnotified = false;
		}
		locStore.set('ampache.player.last.seek', player.audio[player.index].currentTime);
		var per = (player.audio[player.index].currentTime / player.audio[player.index].duration) * 100;
		$("#radio .bar .value").css('width', per + '%');
		// $("#radio .bar .value").attr("max", player.audio[player.index].duration);
		// $('#radio .bar .value').val(player.audio[player.index].currentTime);
	},
	timeset: function(time){
		player.audio[player.index].currentTime = time;
	},
	timeperc: function(perc){
		player.audio[player.index].currentTime = (player.audio[player.index].duration / 100) * perc;
	},
	notification: function(id){
		if(Notification.permission === "granted"){
			var notification = new Notification($('#ampSLNK' + id + ' #title').html(), { icon: $('#currentArtwork').attr('src'), body: $('#ampSLNK' + id + ' #author').html() + "\n" + $('#ampSALB' + id).html() });
			notification.onclick = function(){ this.close(); };
		}
	},
	asnotified: true
};

$(function(){
	player.audio[0] = document.getElementById("audioplayer");
	player.audio[1] = document.getElementById("audioplayer2");
	player.audio[0].addEventListener('timeupdate',function(){ player.timeupdate(); });
	player.audio[1].addEventListener('timeupdate',function(){ player.timeupdate(); });
	player.audio[0].addEventListener('ended',function(e){ player.next(); });
	player.audio[1].addEventListener('ended',function(e){ player.next(); });
	$('#radio .quota-widget:before').on('click', function(){ player.toggle(); });
	// $("#radio .bar .value").bind("change", function(){ player.timeset($(this).val()); });
	$("#radio .bar").on("click", function(e){
		var parentOffset = $(this).parent().offset();
		var relX = e.pageX - parentOffset.left;
		var perc = relX / $(this).width() * 100;
		player.timeperc(perc);
	});
	$("#audioplayer").bind("loadstart", function(){
		// if($('#ampSNG' + locStore.get('ampache.player.last.id'))!==undefined) player.notification(locStore.get('ampache.player.last.id'));
		if(locStore.get('ampache.player.last.seek')!==null){
			player.timeset(locStore.get('ampache.player.last.seek'));
		}
		$("#audioplayer").unbind("loadstart");
	});
	if(locStore.get('ampache.player.last.url')!==null){
		player.audio[0].src = locStore.get('ampache.player.last.url');
		player.audio[0].load();
		player.audio[0].play();
		player.isplaying = true;
	}
});