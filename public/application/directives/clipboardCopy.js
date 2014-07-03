angular.module('clipboardCopyDirective', [])
    .directive('clipboardCopy', ['notificationService', function (notificationService) {
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                ZeroClipboard.config( { moviePath: '/assets/lib/ZeroClipboard/ZeroClipboard.swf' } );
                var client = new ZeroClipboard( element );
                    client.on( "ready", function( readyEvent ) {
                        client.on( 'copy', function (event) {
                            var text = $("#gif-name").val();
                            if(!text){
                                $("#gif-name").addClass('error');
                                return;
                            } else{
                                $("#gif-name").removeClass('error');
                            }
                            text = text.substring(text.indexOf('.gif'), text.length) == 'gif' ?
                                    text : text + '.gif';
                            var domain = attrs.domain.substring(attrs.domain, attrs.domain.length) == '/' ?
                                    attrs.domain : attrs.domain + '/';
                            var toCopy = domain + scope.userKey + '/' + text;
                            try{
                                event.clipboardData.setData("text/plain", toCopy);
                                notificationService.success('Your URL was successfully copied')
                            } catch(e){
                                //odd behaviour
                                //sometimes not copying text without this try-catch
                            }
                        });
                        client.on( "aftercopy", function( event ) {
                            notificationService.success('Your URL was successfully copied')
                        });
                } );
            },
            template: '<button type="button" class="btn btn-primary btn-cons">Copy it</button>'
        }
    }]);