/*var disableVolet = $('<div>', {class:"disableVolet", "data-prevent-tap":"true"});

$(document).on(ARGO.options.events,'.subPicto:not(.down)', function(){

	   ARGO.options.dom.menu
			    .velocity({
				    bottom: "-53px"
				},{
				    duration: 400,
				    easing: "swing",
				    complete: function(){
				    	$('.subMenu.current').addClass('off');
				    	$('.subPicto').addClass('down');
				    }
				});
	    document.getElementById("menu").dataset.preventTap = "true";
	    ARGO.options.dom.stage.append(disableVolet);
});
$(document).on(ARGO.options.events,'.subPicto.down', function(){

	  	ARGO.options.dom.menu
			    .velocity({ 
				    bottom: "0px"
				}, {
				    duration: 400,
				    easing: "swing",
				    complete: function(){
				    	$('.subMenu.current').removeClass('off');
				    	$('.subPicto').removeClass('down');
				    }
				});
		 document.getElementById("menu").dataset.preventTap = "false";
		 disableVolet.remove();
});*/

$('#menu .maxMenu, #menu .subMenu').on('scroll', function(e){

   var menuA = $('#menu a[data-link]:not(.home)');
   menuA.addClass('disable');

   $(this).off("touchend").on('touchend', function(){

        delay1 = setTimeout(function(){
            menuA.removeClass('disable');
        },100);
   });

});


