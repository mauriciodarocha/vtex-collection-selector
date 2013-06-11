/**

@author: Mauricio Rocha
plugin: vtex_collection_selector

purpose:    Build box with collections.
             
use:
        jQuery("#container").vtex_collection_selector({
            url: "/ColecaoFiltros",
            callback: null // Callback after load collection
            rotate: false, // Rotate selectors
            clickable: false // If set to true, it'll show collection only if selector is clicked.
                            // Otherwise, the collection is loaded in each rotating selector. 
                            // It is slower if true, due the ajax loading for each selector.
        });
    
options:
    url: "/ColecaoFiltros" // required
    
*/
(function(document,window) {
    jQuery.fn.vtex_collection_selector = function(options){
    
        var _container = jQuery(this);
    
        var _settings = jQuery.extend({
            url:'/ColecaoFiltros',
            callback:null,
            rotate: false,
            clickable: false
        }, options);
        
        var _collection = {
            data:null,
            lists:[],
            current:0,
            max:0,
            panels:[],
            init: function()
            {
                _collection.load.lists();
            },
            load:
            {
                lists: function()
                {
                    jQuery.ajax({
                        url: _settings.url,
                        success: function(data)
                        {
                            if (data==="") return false;
                            _collection.data = data;
                            _collection.set.lists();
                        }
                    });
                },
                panel: function(_rel)
                {
                    if(_collection.inArray(_rel,_collection.panels)) return false;

                    // _collection.show.loading();
                    _collection.panels.push(_rel);
                    _url = jQuery(".collection-selector-"+_rel).attr("url");
                    if(_url===""){
                        var _div=jQuery("<div>").addClass("not-found").text("Verifique arquivo de configuração. URL não encontrada!");
                        jQuery(".collection-container-"+_rel).html(_div);
                        _collection.show.panel(_rel);

                        if(typeof _settings.callback=="function")
                                    _settings.callback();
                    }else{
                        params = {
                            url:_url,
                            success: function(data){
                                var _result = jQuery(data).find("ul");
                                if(_result.length<=0)
                                    _result=jQuery("<div>").addClass("not-found").text("Nenhum produto foi encontrado!");

                                jQuery(".collection-container-"+_rel).html(_result);
                                _collection.show.panel(_rel);

                                if(typeof _settings.callback=="function")
                                    _settings.callback();
                            }
                        }

                        jQuery.ajax(params);
                    }
                }
            },
            set:
            {
                lists: function()
                {
                    var rows = _collection.data.split("\n");
                    var list;
                    jQuery(rows).each(function(ndx,item){
                        if(!item) return false;

                        list={};
                        itens = item.split(";");
                        list.text = itens[0];
                        list.img = itens[1];
                        list.url = itens[2]?itens[2].replace(/\r/g,''):undefined;
                        _collection.lists.push(list);
                    });
                    _collection.set.html();
                },
                html: function()
                {
                    
                    _div_nav = jQuery("<div>").addClass("collection-nav-container");
                    _div_nav_selectors = jQuery("<div>").addClass("collection-nav-selectors");
                    _div_nav_controls = jQuery("<div>").addClass("collection-nav-controls");
                    _previous = jQuery("<a>").addClass("nav").addClass("prev");
                    _next = jQuery("<a>").addClass("nav").addClass("next");

                    jQuery(_div_nav_controls).append(_previous).append(_next);
                    jQuery(_div_nav).append(_div_nav_selectors).append(_div_nav_controls);

                    _div_containers = jQuery("<div>").addClass("collection-containers");
                    jQuery(_container).append(_div_nav);
                    jQuery(_collection.lists).each(function(ndx,item){
                        _url = item.url;
                        _img_url = item.img;
                        _text = item.text;
                        
                        _div_container = jQuery("<div>").addClass("collection-container").addClass("collection-container-"+ndx);
                        _a = jQuery("<a>").addClass("collection-selector").addClass("collection-selector-"+ndx).attr("rel",ndx).attr("url",_url);
                        _span = jQuery("<span>").addClass("collection-text").addClass("collection-text-"+ndx).text(_text);
                        
                        if(typeof _img_url!="undefined")
                        {
                            _img = jQuery("<img>",{src:_img_url}).addClass("collection-img").addClass("collection-img-"+ndx);
                            jQuery(_a).append(_img);
                        }

                        jQuery(_a).append(_span);

                        jQuery(_div_nav_selectors).append(_a);
                        jQuery(_div_containers).append(_div_container);

                        _collection.max=ndx;
                    });
                    jQuery(_container).addClass("active").append(_div_containers);
                    
                    _collection.set.events();
                    _collection.show.panel(0);
                },
                events: function()
                {
                    if(!_settings.rotate)
                        if(_collection.current===0) {
                            _collection.disable.prev();
                        }

                    if(!_settings.rotate)
                        if(_collection.current===_collection.max) {
                            _collection.disable.next();
                        }

                    jQuery(".collection-selector").bind("click",function(){
                        _rel = jQuery(this).attr("rel");
                        _url = jQuery(this).attr("url");
                        _collection.show.panel(_rel);
                    });

                    jQuery(".collection-nav-controls .prev").click(function(){
                        _collection.current--;
                        if (_collection.current<0) 
                            _collection.current = _settings.rotate ? _collection.max : 0;
                        
                        _collection.show.selector();
                        if(!_settings.clickable)
                            _collection.show.panel(_collection.current);

                        if(!_settings.rotate){
                            if(_collection.current===0) {
                                _collection.disable.prev();
                            }
                            if(_collection.current!==_collection.max){
                                _collection.enable.next();
                            }else if(_collection.current!==_collection.max && _collection.current!==0){
                                _collection.enable.prev();
                                _collection.enable.next();
                            }

                        }
                    });
                    jQuery(".collection-nav-controls .next").click(function(){
                        _collection.current++;
                        if(_collection.current>_collection.max)
                            _collection.current = _settings.rotate ? 0 : _collection.max;
                        
                        _collection.show.selector();
                        if(!_settings.clickable)
                            _collection.show.panel(_collection.current);

                        if(!_settings.rotate){
                            if(_collection.current===_collection.max){
                                _collection.disable.next();
                            }
                            if(_collection.current!==0){
                                _collection.enable.prev();
                            }else if(_collection.current!==0 && _collection.current!==_collection.max){
                                _collection.enable.prev();
                                _collection.enable.next();
                            }
                        }
                    });
                    
                }
            },
            disable:
            {
                prev:function()
                {
                    jQuery(".collection-nav-controls .prev").addClass("disabled");
                },
                next:function()
                {
                    jQuery(".collection-nav-controls .next").addClass("disabled");
                }
            },
            enable:
            {
                prev:function()
                {
                    jQuery(".collection-nav-controls .prev").removeClass("disabled");
                },
                next:function()
                {
                    jQuery(".collection-nav-controls .next").removeClass("disabled");
                }
            },
            show:
            {
                panel: function(_rel)
                {
                    if(jQuery(".collection-container-"+_rel).is(":empty")){
                        _collection.load.panel(_rel);
                    }else
                    {
                        jQuery(".collection-selector").removeClass("active");
                        jQuery(".collection-container").removeClass("active");
                        jQuery(".collection-selector-"+_rel).addClass("active");
                        jQuery(".collection-container-"+_rel).addClass("active");
                        if(jQuery(".collection-selector[style*=opacity]").length<1)
                            jQuery(".collection-selector").not(".active").css({opacity:0});
                    }

                },
                selector: function()
                {
                    if(!_settings.rotate&&jQuery(".collection-selector-"+_collection.current).hasClass("active")) return false;

                    jQuery(".collection-selector:visible").stop(true).animate({opacity:0},"fast", function(){
                        jQuery(".collection-selector-"+_collection.current).addClass("active").stop(true).animate({opacity:1},"slow");
                    }).removeClass("active");
                }
            },
            inArray: function(value,array)
            {
                var i;
                for (i=0; i < array.length; i++)
                    if (array[i] == value) return true;
                return false;
            }
        }
        
        return _collection.init();
    }
})(document,window,undefined);