angular.module('tagsInputDirective', [])
    .directive('tagsInputDirective', function () {
        return{
            scope: {
                model: '=ngModel'
            },
            link: function (scope, element, attrs) {
                element.tagsinput({
                    itemText: function(item) {
                        validate(item);
                        return item;
                    }
                });
                if(scope.model){
                    var splitted = scope.model.split(',');
                    for(var i=0; i< splitted.length; i++){
                        element.tagsinput('add', splitted[i]);
                    }
                }
                var style = $('<style type="text/css">.form-row .bootstrap-tagsinput input, .bootstrap-tagsinput input{ margin-bottom:0px; min-width:105px;}' +
                    '.form-row .bootstrap-tagsinput span, .bootstrap-tagsinput span{ margin-bottom:3px; }'+
                    '.parsley-error, .parsley-error.input-focus,div.parsley-error.input-focus input, ' +
                    'div.pasrsley-error, div.parsley-error input, div.parsley-error ' +
                    'input.bootstrap-tagsinput input[type="text"]{color: #B94A48 !important;background-color: #F2DEDE !important;border: 1px solid #EED3D7 !important;}' +
                    'div.parsley-error.input-focus input, div.parsley-error input{border: none !important;}</style>');
                $('head').append(style);
                $(".bootstrap-tagsinput input").blur(function(){
                    $(this).parent().removeClass('input-focus');
                })

                $(".bootstrap-tagsinput input").focus(function(){
                    $(this).parent().addClass('input-focus');
                });

                $(".bootstrap-tagsinput input").prop('placeholder', element.prop('placeholder'));

                function validate(text){
                    setTimeout(function(){
                        var valid = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/.test(text);
                        if(!valid){
                            var $tag = $('span.tag.label.label-info:contains("' + text + '")');
                            $tag.each(function(index){
                                if($(this).text() == text)
                                   $(this).removeClass('label-info').addClass('label-important');
                            });
                            $('div.bootstrap-tagsinput').addClass('parsley-error');
                        } else{
                            $('div.bootstrap-tagsinput').removeClass('parsley-error');
                        }
                    }, 50);
                };
            }
        }
    });