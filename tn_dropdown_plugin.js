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
                data: null,
                processResults: null
            },
            data:[]
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = $(element);
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            this.element.wrap('<div class="TN_dropdown" style="margin-top:20px"></div>');
            this.element
                .on('focus', this, function(){$(this).select()})
                .on('keyup', this, this._initAjax.bind(this))
                .on('blur', this, this._destroyAutocompleteBox.bind(this))
                .on('keydown', this, this._actionToInput.bind(this));
        },



        _clearInputField: function(){
            this.element.val('')
            this.element.attr('data-value', '');
            this.element.focus();
            this._checkClearButton();
        },


        //----------------------------------------------------------------------------------------------------------------------------------------------

        _initAjax:function(e){
            var event = window.event ? window.event : e;

            if(event.keyCode === 40 || event.keyCode === 38 || event.keyCode === 13 || event.keyCode === 9) return false; //stop calling ajax on keyup up and down

            this.options.ajax.data.q = this.element.val();
            if(this.options.ajax.data.q.length === 0) return false;

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
            this.xhr = $.ajax({
                method: this.options.ajax.method,
                url: this.options.ajax.url,
                dataType: this.options.ajax.datatype,
                data: this.options.ajax.data
            }).success(function(msg){
                self.element.next().remove();
                if(msg.length !== 0 ){
                    self.options.data = self.options.ajax.processResults(msg);
                    self._destroyAutocompleteBox();
                    self._buildAutocompleteBox();
                } else {
                    self._destroyAutocompleteBox();
                }
            }).error(function(error){
                console.log(error);
            });
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _buildAutocompleteBox:function(){
            var offset = this.element.offset();
            var template = '<div class="auto-complete-box" id="autocomplete_box" style="background-color:#fff;"><ul style="positionrelative">';
            for(var i = 0; i<this.options.data.length; i++){
                var className = i === 0 ? 'auto-complete-active' : '';
                template += '<li class="className" data-value="'+this.options.data[i]['value']+'">'+this.options.data[i]['text']+'</li>';
            }
            template +='</ul></div>';

            $('body').append(template);

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
                        value: $(this).attr('data-value')
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
                        value: self.element.attr('data-value')
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
                    value: self.element.attr('data-value')
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
                    value: $('.auto-complete-active').attr('data-value')
                });
            }
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------
        setData: function(obj){
            this.element.val(obj.text)
            this.element.attr('data-value', obj.value);
        },

        getData: function(){
            return {
                value: this.element.attr('data-value'),
                text: this.element.val()
            }
        },

        _destroyAutocompleteBox:function(){
            $('#autocomplete_box').remove();
        }

    } );



    $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };

} )( jQuery, window, document );