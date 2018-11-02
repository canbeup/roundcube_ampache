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
          default: valuetoreturn = true;
        }
      }else if(event.shiftKey){
        switch(chCode){
          case 38: ampache.previous(); break; //up
          case 40: ampache.next(); break; //down
          default: valuetoreturn = true;
        }
      }else if(event.ctrlKey){
        switch(chCode){
          default: valuetoreturn = true;
        }
      }else{
        switch(chCode){
          case 32: player.toggle(); break; //espace
          case 38: player.previous(); break; //up
          case 40: player.next(); break; //down
          default:
            valuetoreturn = true;
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