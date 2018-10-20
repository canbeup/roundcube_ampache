var keyboard = {
	onKeyDown: function(event){
		var chCode = ('charCode' in event) ? event.charCode : event.keyCode;
		chCode = event.which ? event.which : event.keyCode ? event.keyCode : 0;
		var valuetoreturn = false;
		var OnElement = 'none';
		var el = document.activeElement;
		if(el&&((el.tagName.toLowerCase()=='input'&&el.type=='text')||el.tagName.toLowerCase()=='textarea')){ OnElement = el.tagName.toLowerCase(); }
		if(chCode==27&&OnElement!='none'){
			if((OnElement=='text'||OnElement=='input')) document.activeElement.blur();
		}else if(OnElement=='none'){
			if(event.ctrlKey&&event.shiftKey){
				switch(chCode){
					// case 82: document.location.href = document.location.href; break; //R
					default: valuetoreturn = true;
				}
			}else if(event.shiftKey){
				switch(chCode){
					// case 49: window.open(document.location.href); break; //1
					default: valuetoreturn = true;
				}
			}else if(event.ctrlKey){
				switch(chCode){
					// case 13: explorer.selection.open(event.ctrlKey); break; //enter
					// case 65: explorer.menu('add'); break; //insert, A
					// case 69: explorer.notepad('WD::NewFile'); break; //E
					// case 72: explorer.open(''); explorer.menu(); break; //H
					// case 78: window.open(document.location.href); break; //N
					// case 81: document.location.href = '/logout'; break; //Q
					// case 67: input('clipboard'); break; //C
					// case 71: input('google'); break; //G
					// case 77: input('math'); break; //M
					// case 83: settings.show(); break; //S
					// case 80: ping(); break; //P
					default: valuetoreturn = true;
				}
			}else{
				switch(chCode){
					// case 8: if(explorer.clean()){ explorer.back(); } break; //basckspace
					// case 13: explorer.selection.open(event.ctrlKey); break; //enter
					// case 27: if(explorer.clean()){ explorer.selection.cancel(); } break; //escape
					case 32: player.toggle(); break; //espace
					// case 37: if($('#slideshow').html()!=='') slideshow.next(-1); else explorer.selection.move('left'); break; //left
					case 38: player.previous(); break; //up
					// case 39: if($('#slideshow').html()!=='') slideshow.next(1); else explorer.selection.move('right'); break; //right
					case 40: player.next(); break; //down
					// case 45: explorer.menu('add'); break; //Insert, A
					// case 48: case 96: explorer.selection.select('0'); break; //0
					// case 49: case 97: explorer.selection.select('1'); break; //1
					// case 50: case 98: explorer.selection.select('2'); break; //2
					// case 51: case 99: explorer.selection.select('3'); break; //3
					// case 52: case 100: explorer.selection.selectOpenNLink('4'); break; //4
					// case 53: case 101: explorer.selection.selectOpenNLink('5'); break; //5
					// case 54: case 102: explorer.selection.selectOpenNLink('6'); break; //6
					// case 55: case 103: explorer.selection.selectOpenNLink('7'); break; //7
					// case 56: case 104: explorer.selection.selectOpenNLink('8'); break; //8
					// case 57: case 105: explorer.selection.selectOpenNLink('9'); break; //9
					// case 107: window.open(document.location.href); break; //Numpad +
					// case 110: case 190: explorer.selection.select('.'); break;
					// case 116: explorer.open($('#explorer_dir').html()); break;
					default:
						if((chCode>=65&&chCode<=90)){ explorer.selection.select(String.fromCharCode(chCode)); }
						else{ valuetoreturn = true; }
				}
			}
		}else{
			valuetoreturn = true;
		} return valuetoreturn;
	}
};

$(function(){
	$('body').on('keydown', function(e){ if(keyboard.onKeyDown(e)){ return true; }else{ e.preventDefault(); return false; } });
});