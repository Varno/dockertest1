$(function() { 

    $.fn.extend({

        blockUIElement: function() {
            return this.each(function() {
                $(this).block({
                    message: '<img src="/assets/others/plugins/jquery-block-ui/loading.gif" class="MyClass123" ' +
                        'alt="Loading&hellip;" title="Loading&hellip;"/>',
                    css: { 
                        width: '66px',
                        border: 'none', 
                        padding: '10px'
                    },
                    overlayCSS: {
                        opacity: 0.6
                    }
                });
            });
        },

        blockUIElementWithMessage: function(message, width) {
            this.each(function() {
                $(this).block({
                    message: '<div class="block-loader">' + message + '&hellip;</div>',
                    css: {
                        width: width || '300px',
                        height: '66px',
                        border: 'none',
                        padding: '10px',
                        backgroundColor: 'white',
                        '-webkit-border-radius': '5px',
                        '-moz-border-radius': '5px'
                    },
                    overlayCSS: {
                        opacity: 0.6
                    }
                });
            });
        }

    });

});