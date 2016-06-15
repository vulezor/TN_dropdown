( function( $, window, document, undefined ) {
    "use strict";
    var pluginName = "TN_clearBtn",
        defaults = {
            clearValue:null,
        };

    function Plugin ( element, options ) {
        this.element = $(element);
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        /**
         * init
         */
        init: function() {
            console.log(this.element.outerWidth());
            this._setButton();
            this.element.on('keyup', this._event.bind(this));
            this._checkClearButton();
            this.element.prev().click(this._clearValues.bind(this));
        },

        /**
         * description: set buton before this.element
         */
        _setButton:function(){
            var top = this.element.position().top, left = this.element.position().left, elem_width = this.element.outerWidth();
            this.element.before('<span class="clearBtn" style="position:absolute;z-index:1">&times;</span>');
            this.element.prev().css({'left':left+'px','top':top+'px','margin-left': (elem_width - 27)+'px'});
        },

        /**
         * description: keyup checking if value exist triger method _checkClearButton
         * @param e
         */
        _event:function(e){
            this._checkClearButton();
        },

        /**
         * description: check if value exist in this.element clearBtn set css to visible
         */
        _checkClearButton: function() {
            console.log(this.element.val())
            if(this.element.val().length !== 0 ){
                this.element.prev().css('visibility', 'visible')
            } else {
                this.element.prev().css('visibility', 'hidden')
            }
        },

        /**
         * description: on click .clearBtn clear value of this.element or
         * clear value of this.element and init callback function if set callback function
         */
        _clearValues:function(){
            if(typeof this.options.clearValue === 'function'){
                this.options.clearValue.call(this);
                this.element.val('');
            } else {
                this.element.val('');
            };
            this._checkClearButton();
        }

    });


    //SET PLUGIN
    $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };

} )( jQuery, window, document );