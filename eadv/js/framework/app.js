var app = app || {};

app = function(){};

app.stage  = {

     options:{
        events: null,
        eventsEnd: null,
        popup: null,
        currentScreen  : 0,
        currentFlow  : "flow1",
        flowsMax: null,
        flow: null,
        flowTheme: null,
        flowjson: null,
        ref: null,
        dom :{ 
            content: null,
            stage: null,
            css: null,
            head: document.getElementsByTagName('head')[0],
            menu: null,
            menuCss: null
        },
        removeClass: [],
        removeTimeouts: [],
        removeInterval: [],
        tracking: {
            time: null,
            id: null,
            description: null
        },
        flowExist: {},
        linkScreen: {},
        inSwipe: false
     },
     _construct_: function(){

        window.parent.alert = function () {
            return false
        }
            //Disable alert MI
           var _this = this,
                dom  = this.options.dom;

           dom.stage = $('<div>',{id:"stage"}).appendTo(document.body);
           dom.menu = $('<div>',{id:"menu", "data-prevent-tap":"true"}).appendTo(dom.stage);
           dom.css = $('<style>',{type:"text/css","real":"preload"}).appendTo(dom.head);
           dom.menuCss = $('<style>',{type:"text/css"}).appendTo(dom.head);
           dom.mainJS  = $('<script>', {type: "text/javascript"}).appendTo(dom.head);

            $.getJSON('js/framework/ref.json').done(function(_ref_){
               _this.ref = _ref_;
            });

            $.getJSON('js/framework/flows.json').done(function(_data_){
               _this.flowjson = _data_;
               _this.init(_this.options.currentFlow,_this.options.currentScreen);
            });
     },
     init: function(currentFlow, screen){

        var _this  = this;

        this.options.flow        = this.flowjson[0][currentFlow];
        this.options.flowsMax    = Object.keys(_this.options.flow).length -2;
        this.options.flowTheme   = this.options.flow[0].theme;
        this.options.currentFlow = currentFlow;

        if('ontouchstart' in window){
           this.options.events = "touchstart";
           this.options.eventsEnd = "touchend";
        }else{
           this.options.events = "mousedown";
           this.options.eventsEnd = "mouseup";
        }

        this.loadMenu(function(){
              _this.loadContent(currentFlow, screen);
        });

        for(flow in this.options.flow){

            var current = this.options.flow[flow];

            if(current.hasOwnProperty('id')){

               _this.options.linkScreen[current.link] = flow -1;
            }

        }


        _this.handleEvent(); 
     },
     loadMenu: function(callback){

          this.options.dom.stage.find('#menu').html("");

          var path = this.options.flowTheme,
              _this = this;

          if(Object.keys(this.options.flowExist).length == 0){

              this.ajax_('theme/'+path+'/main.css','text', function(data){
                   _this.options.dom.menuCss.append(data);
              });
          }

          this.ajax_('theme/'+path+'/index.html','html', function(data){
               _this.options.dom.menu.append(data);
               $.getScript('theme/'+path+'/main.js');
               callback();
          });
     },
     loadContent: function(currentFlow,screen){


        var _this = this,path = [],requests = [];

        for(var key in this.options.flow)
            this.options.flow[key].hasOwnProperty('id') ?  path.push(this.options.flow[key].id) : null;

        if(_this.options.flowExist[currentFlow] != true){

          for(var e in path) {

              if(!$('[path="'+path[e]+'"]').length){

                  requests.push($.ajax({
                    url: 'screen/'+path[e]+'/index.html',
                    success: function(html){_this.options.dom.stage.append(html)}
                  }));

                  requests.push($.ajax({
                    url: 'screen/'+path[e]+'/main.css',
                    success: function(css){_this.options.dom.css.append(css)}
                  }));
                  
              }
          }

          $.when.apply(undefined, requests).then(function(results){
              _this.loadScreen(screen); 
              setTimeout(function(){
                $('.content').addClass('preload');            
              },250)
          });

        }else{
            _this.loadScreen(screen);
        }
     },
     loadScreen: function(screen){

          // SMART CONTENT
/*        if(typeof EL == "object"){
             EL.changeScreen(screen);
        }else{
            try{
              SC.logs.push({'Library event': "Not loaded"});
            }catch(e){
              console.log('Error library event not loaded');
            }
        }*/
        
        var screen = parseInt(screen);
        this.options.currentScreen = screen;
        var path = this.options.flow[screen +1].id,
            current = this.options.dom.stage.find('.active'),
            news = this.options.dom.stage.find('[path="'+path+'"]'),
            chapter = this.options.flow[screen +1].chapter;

        //Current slide remove active class
        current.removeClass('active').css({display:"none"});

        //New slide add class active
        news.addClass('active').css({display:"block","opacity":1});

        // App screen start
        $.getScript('screen/'+path+'/main.js');

        //set menu
        this.setMenu(chapter, screen +1);

        //Mi DataTracking
        this.tracking(screen);

        //Remove class/setTimeout/style
        this.removeAll(current);
     },
     setMenu: function(chapter, screen){

         var ref   = this.options.dom.menu.find('.ref'),
             sub   = this.options.flow[screen].id,
             _this = this;

         //Add class to menu
         this.options.dom.menu.find('.current').removeClass('current');
         this.options.dom.menu.find('[data-chapter = "'+chapter+'"]').addClass('current');
         
         //Add class to subMenu
         if(this.options.dom.menu.find('.subMenu').length > 0){
            this.options.dom.menu.find('.subMenu .current').removeClass('current');
            this.options.dom.menu.find('.subMenu [data-sub="'+sub+'"]').addClass('current');
         }

         //Set reference status
         if(this.options.flow[screen].ref.length <= 0){
                ref.css({"opacity":"0.5"});
                this.options.ref = false;
         }else{ 
                ref.css({"opacity":"1"});
                this.options.ref = true;
         }
     },
     handleEvent: function(){

            var _this      = this,
                path       = this.options.flowTheme;

           if(Object.keys(ARGO.options.flowExist).length <= 0){
                //Swipe
                this.options.dom.stage.swipe({
                    swipe : function (event, direction){

                          var screen        = _this.options.currentScreen,
                              nameScreen    = _this.options.flow[screen +1].id;
                              min           = 0,
                              max           = _this.options.flowsMax;

                            if(direction === 'up' || direction === 'down'){
                                return false;
                            }

                            if(direction == "left" && screen < max){
                                _this.inSwipe = true;
                                _this.loadScreen(screen + 1);
                            }

                            if(direction == "right" && screen > min){
                                _this.inSwipe = true;
                                _this.loadScreen(screen - 1);
                            }
                        }
                });

                //Global link
                $(document).on(_this.options.eventsEnd,'[data-link]:not(".disable")', function(){

                         if(_this.inSwipe != true){
/*                              EL.closePopup();
                              EL.refClose();*/
                              var location = _this.options.linkScreen[$(this).attr('data-link')];
                              _this.loadScreen(location);
                         }
                });


                //Global link with ID
                $(document).on(_this.options.eventsEnd,'[data-id-link]:not(".disable")', function(){

                         var _ID_ = $(this).attr('data-id-link');

                         if(_this.inSwipe != true){
/*                              EL.closePopup();
                              EL.refClose();*/
                              //var location = _this.options.linkScreen[$(this).attr('data-link')];
                              for(var e in _this.options.flow){

                                    if(_ID_ == _this.options.flow[e].id){
                                        _this.loadScreen(_this.options.flow[e].link);
                                    }
                              }
                         }
                });

                //Open reference
                $(document).on('click','.ref.show', function(){

                     if(_this.options.ref == true){
                        //EL.refOpen();
                        var screen    = _this.options.currentScreen,
                            refID       = _this.options.flow[screen +1].ref.split('-'),
                            thisPicto = $(this),
                            ref = "";

                            thisPicto.removeClass('show');

                        for(var e in refID)
                            ref += "<li>"+(parseInt(e)+1)+" "+_this.ref[refID[e]]+"</li>";
                        

                        $.ajax({
                            url: 'theme/'+_this.options.flowTheme+'/reference/reference.html',
                            dataType: "text",
                            success: function(data){


                                $('.content.active').append(data);
                                $('.textReference').html(ref);

                                _this.swipe('disable');

                                $('#layer[data-ref]')
                                    .velocity({opacity: 1}, {
                                       display: "block", 
                                       duration: 300,
                                       begin: function(){
                                         
                                       },
                                       complete: function(){
                                           _this.scroller('scrollerRef');
                                       }
                                });
                             }
                        });
                     }
                });

                //Close reference
                $(document).on(this.options.events,'#boxReferenceClose', _this.options.events, function(){

                    //EL.refClose();
                    $('#layer[data-ref]')
                        .velocity({opacity: 0}, {
                           display: "none", 
                           duration: 300 , 
                           complete: function(){ 
                                   $('#layer[data-ref]').remove();
                                   $('.ref').addClass('show');
                                   _this.swipe('enable');
                           }
                    });
                });

                // Open popup
                $(document).on(_this.options.eventsEnd,'[btn-popup]:not(.show)', function(e){

                      e.stopPropagation();

                      if(_this.inSwipe != true){

                        var screen    = _this.options.currentScreen,
                            id        = _this.options.flow[screen +1].id;

                          var name    = $(this).attr('btn-popup'),
                              _parent = $(this).closest('.content'),
                              self    = $(this);

                          _parent.find('[popup="'+name+'"]')
                              .velocity({
                                  opacity: 1
                              }, {
                                  display: "block",
                                  duration: 200,
                                  complete: function () {
                                      _this.swipe('disable');
                                      _parent.find('btn-popup').addClass('show');
                                  }
                              });

                          //EL.openPopup($(this).attr('sc-popup-name'),id);
                      }
                });

                // Close popup
                $(document).on(this.options.events,'[btn-popup-close]', function(e){

                      e.stopPropagation();

                      var _parent = $(this).closest('[popup]');

                      //EL.closePopup();

                      _parent
                          .velocity({
                              opacity: 0
                          }, {
                              display: "none",
                              duration: 200,
                              complete: function () {
                                  _this.swipe('enable');
                                  _parent.find('btn-popup').removeClass('show');
                              }
                          });
                });
           };
     },
     removeAll: function(current){

          var Rclass    = this.options.removeClass,
              Rtimeout  = this.options.removeTimeouts,
              Rinterval = this.options.removeInterval,
              _this     = this;

          setTimeout(function(){
              _this.inSwipe = false;
              _this.swipe('enable');
          }, 50);

          
          $('*').removeClass('off on show');
          $('#layer').remove();
          $('.ref').addClass('show');

          current.find('*').removeAttr('style');
          current.find('*').removeClass(Rclass[0]);

          $('[popup]').removeAttr('style');

          for(key in Rtimeout){

              clearTimeout(Rtimeout[key]);
          }
          for(key in Rinterval){

              clearInterval(Rinterval[key]);
          }

          this.options.removeClass = [];
          this.options.removeTimeouts = [];
     },
     ajax_: function(path,type,callback){

          $.ajax({
              url: path,
              dataType: type,
              success: function(data){
                   callback(data);
              }
          });
     },
     tracking: function(screen){
           try{
              window.parent.onEnterPage(this.options.flow[screen +1].description);
           }catch(e){
              console.log(this.options.flow[screen +1].description);
           }
     },
     old_tracking: function(screen){

         if(window.parent.trackingTime != undefined){
            
            try{
               var time = new Date().getTime() - window.parent.trackingTime;
               window.parent.addAsset(
                     window.parent.trackingDescription,
                     parseInt(window.parent.trackingTime),
                     parseInt(time/1000),
                     window.parent.trackingId
               );
            }catch(e){
               console.log("Track: "+ window.parent.trackingDescription
                          +" / "+ time/1000
                          +" / "+ window.parent.trackingId
               ); 
            }
         }

         window.parent.trackingTime =  new Date().getTime();
         window.parent.trackingId =  this.options.flow[screen +1].id;
         window.parent.trackingDescription =  this.options.flow[screen +1].description;
     },
     scroller: function(el){

             var scroller = new iScroll(el, {
                vScroll: true,
                vScrollbar: false,
                hideScrollbar: false,
                bounce: false
             });
     },
     swipe: function(action){

          this.options.dom.stage.swipe(action);
     }
};

document.addEventListener("DOMContentLoaded", function(){
   ARGO = Object.create(app.stage);
   ARGO._construct_();
});