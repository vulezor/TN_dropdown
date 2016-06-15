/**
 * jQuery Widget name: TN_dropdown
 * Version: 1.0.0
 * Author: Zoran Vulanovic
 * Company: TNation
 * Email: vulezor@gmail.com
 * */
( function( $, window, document, undefined ) {
    "use strict";
    var pluginName = "TN_dropdown",
        defaults = {
            delay: 300,
            overflow_length: 10,
            ajax_load_icon:'<i class="tnDropdown-loader fa fa-circle-o-notch fa-spin fa-fw margin-bottom"></i>',
            ajax:{
                url: null,
                datatype: 'json',
                method: "GET",
                data: function(){
                    return {};
                },
                processResults: function(){}
            },
            data:[],
            onChange: function(data){}
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = $(element);

        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    //----------------------------------------------------------------------------------------------------------------------------------------------

    // Avoid Plugin.prototype conflicts

    $.extend( Plugin.prototype, {

        init: function() {
            console.log(this.options);
            this.element.wrap('<div class="TN_dropdown"></div>');

            this.element
                .on('focus', this, function(){$(this).select()})
                .on('keyup', this, this._initAjax.bind(this))
                .on('blur', this, this._destroyAutocompleteBox.bind(this))
                .on('keydown', this, this._actionToInput.bind(this));

        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _initAjax:function(e){
            var event = window.event ? window.event : e;

            if(event.keyCode === 40 || event.keyCode === 38 || event.keyCode === 13 || event.keyCode === 9) return false; //stop calling ajax on keyup up and down

            if(this.element.val() === 0) return false;

            if(!this.element.next().hasClass('TN_dropdown_load')){
                this.element.after('<div class="TN_dropdown_load" style="position:absolute;">'+this.options.ajax_load_icon+'</div>');
            }
            clearTimeout(this.timeout);
            if(this.xhr && this.xhr.readyState != 4){
                this.xhr.abort();
            }
            this.timeout = window.setTimeout(this._newAjaxCall.bind(this), this.options.delay);
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _newAjaxCall:function(){
            var self = this;

            //var ajaxData = this.options.ajax.data();
            this.options.ajax.data.q = this.element.val();

            this.xhr = $.ajax({
                method: this.options.ajax.method,
                url: this.options.ajax.url,
                dataType: this.options.ajax.datatype,
                data: this.options.ajax.data//ajaxData
            }).success(function(msg){
                console.log(msg)
                self.element.next().remove();
                if(msg.length !== 0 ){
                    self.options.data = self.options.ajax.processResults(msg);
                    self._destroyAutocompleteBox();
                    self._buildAutocompleteBox();
                } else {
                    self._destroyAutocompleteBox();
                }

            }).error(function(error){
                console.log('sdfddsf')
                console.log(error);
            });
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------  

        _buildAutocompleteBox:function(){
            var offset = this.element.offset();
            var template = '<div class="auto-complete-box" id="autocomplete_box" style="background-color:#fff;"><ul style="positionrelative"></ul></div>';

            $('body').append(template);

            for(var i = 0; i<this.options.data.length; i++){
                var li = $('<li>'+this.options.data[i]['text']+'</li>');
                li.data('value',this.options.data[i]['value']);
                li.data('obj',this.options.data[i]['obj']);
                $('#autocomplete_box ul').append(li);
            }

            $('#autocomplete_box').css({'top':offset.top+'px', 'left':offset.left+'px', 'width':this.element.outerWidth()});
            var check_overflow_height = parseInt($('#autocomplete_box').find('li').outerHeight()) * parseInt(this.options.overflow_length);
            if($('#autocomplete_box').outerHeight()>=check_overflow_height){
                $('#autocomplete_box').css({'height':check_overflow_height+'px','overflow-x':'hidden','overflow-y':'auto'});
            }else{
                $('#autocomplete_box').css({'height':'auto','overflow-x':'none','overflow-y':'none'});
            }

            this._eachListItemAction();
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _eachListItemAction:function(){
            var self = this;

            $('#autocomplete_box').mousemove(function(){
                $(this).removeClass('key_up')
            });

            $('#autocomplete_box').find('li').mouseenter(function(){
                if(!$('#autocomplete_box').hasClass('key_up')){
                    $('#autocomplete_box').find('li').each(function(i, item){
                        $(this).removeClass('auto-complete-active')
                    });
                    $(this).addClass('auto-complete-active');

                    self.setData({
                        text: $(this).html(),
                        value: $(this).data('value'),
                        obj: $(this).data('obj')
                    });

                }
            }).mouseleave(function(){
                $(this).removeClass('auto-complete-active')
            })

        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _actionToInput:function(e){
            var self = this
            var event = window.event ? window.event : e;

            $('#autocomplete_box').addClass('key_up');

            //keypress down
            if(event.keyCode === 40){

                if($('.auto-complete-active').length===0){
                    $('#autocomplete_box li:first').addClass('auto-complete-active');
                    var text = $('.auto-complete-active').html();
                    self.setData({
                        text: self.element.html(),
                        value: self.element.data('value'),
                        obj: self.element.data('obj')
                    });

                } else{
                    var activeItem = $('.auto-complete-active:not(:last-child)');
                    if($('.auto-complete-active:not(:last-child)').length){
                        activeItem.removeClass('auto-complete-active')
                            .next()
                            .addClass('auto-complete-active');
                    } else{
                        $('.auto-complete-active').removeClass('auto-complete-active');

                        $('#autocomplete_box li:first')
                            .addClass('auto-complete-active');
                        $('#autocomplete_box').scrollTop(0);
                        self.setData({

                        });
                    }

                }
            }

            //keypress up
            if(event.keyCode === 38){
                var activeItem = $('.auto-complete-active:not(:first-child)');
                if($('.auto-complete-active:not(:first-child)').length){
                    activeItem.removeClass('auto-complete-active')
                        .prev()
                        .addClass('auto-complete-active');
                }else{
                    $('.auto-complete-active').removeClass('auto-complete-active');

                    $('#autocomplete_box li:last')
                        .addClass('auto-complete-active');
                    $('#autocomplete_box').scrollTop($('#autocomplete_box').height());
                }
                self.setData({
                    text: self.element.html(),
                    value: self.element.data('value'),
                    obj: self.element.data('obj')
                });
            }

            //if enter or tab key
            if(event.keyCode === 9 || event.keyCode === 13){
                if($('#autocomplete_box').length>=1){
                    $('#autocomplete_box').remove();
                }
            }

            //keypress keyup or keydown
            if(event.keyCode === 38 || event.keyCode === 40){

                $('#autocomplete_box').scrollTop(0);
                $('#autocomplete_box').scrollTop(($('.auto-complete-active:first').position().top + $('.auto-complete-active:first').outerHeight()) - $('#autocomplete_box').height());
                self.setData({
                    text: $('.auto-complete-active').html(),
                    value: $('.auto-complete-active').data('value'),
                    obj: $('.auto-complete-active').data('obj')
                });
            }

        },

        //----------------------------------------------------------------------------------------------------------------------------------------------
        setData: function(obj){
            this.element.val(obj.text)
            this.element.data('value', obj.value);
            this.element.data('obj', obj.obj);

            this.options.onChange(obj);
        },

        getData: function(){
            return {
                value: this.element.data('value'),
                text: this.element.val(),
                obj: this.element.data('obj'),
            }
        },

        _destroyAutocompleteBox:function(){
            $('#autocomplete_box').remove();
        }
    });


    $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };


} )( jQuery, window, document );
