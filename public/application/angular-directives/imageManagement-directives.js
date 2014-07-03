/**
 * Created by Alexey Okishev on 23.05.2014.
 */
/*Resizer options directives*/
var module = angular.module('imageManagement.directives', [])
    .directive('imgsrcWizard', ['$timeout', 'helper', function ($timeout, helper) {
        var isClick = false;

        function setBorderRadius(rectangle, side, value) {
            var key = 'border' + side + 'Radius',
                radius = parseInt(value),
                valid = !!radius,
                css = {};
            if (!valid)
                css[key] = '0px';
            else
                css[key] = radius + 'px';
            rectangle.css(css);
        }

        function clickPreviewBtn() {
            if (!isClick) {
                isClick = true;
                setTimeout(function () {
                    isClick = false;
                    $("#previewBtn").click();
                }, 500);
            }
        }

        function initMenu() {
            helper.applyInitPositionToAccordionMenu();
            var $container = $("#draggable-container");
            $container.find("input[type='checkbox'], select").change(function () {
                clickPreviewBtn();
            });
            $container.find("input[type='text']").keyup(function () {
                clickPreviewBtn();
            });
            $container.find("input[type='radio']").click(function () {
                if ($(this).attr("name") == "rotate") {
                    var isRotateDefined = $("#rotate").val() != "";
                    if (isRotateDefined) {
                        clickPreviewBtn();
                    }
                }
                else {
                    clickPreviewBtn();
                }
            });

            var resizedImageUrlWidth = Math.max($("#preview").width(), 1050);
            $(".resized-image-url").parent().width(resizedImageUrlWidth);

            $('.my-colorpicker-control').colorpicker().on('changeColor', function (ev) {
                var $this = $(this),
                    i = $this.parent().find('i'),
                    input = $this.parent().parent().find('input');
                i.css({backgroundColor: ev.color.toHex()});
                input.val(ev.color.toHex());
                input.trigger('input');

                clickPreviewBtn();
            });

            $('.border-radius input').bind('keyup', function (event) {
                var $this = $(event.target),
                    $rectangle = $('.border-radius .rectangle'),
                    id = $this.prop('id'),
                    val = $this.val();
                switch (id) {
                    case "left-top-radius":
                        setBorderRadius($rectangle, 'TopLeft', val);
                        break;
                    case "right-top-radius":
                        setBorderRadius($rectangle, 'TopRight', val);
                        break;
                    case "left-bottom-radius":
                        setBorderRadius($rectangle, 'BottomLeft', val);
                        break;
                    case "right-bottom-radius":
                        setBorderRadius($rectangle, 'BottomRight', val);
                        break;
                    case "all-borders-radius":
                        $('.border-radius input').val(val);
                        setBorderRadius($rectangle, '', val);
                        break;
                }
            });

            $('.slider-element').slider()
                .on("slide", function (ev) {
                    var targetInputName = $(this).data("target-name");
                    var $targetInput = $("input[name='" + targetInputName + "']");
                    $targetInput.val(ev.value);
                    $targetInput.trigger('input');
                })
                .on("slideStop", function (ev) {
                    clickPreviewBtn();
                });

            $('.rotate-container label.button').click(function (e) {
                $(this).addClass('selected').siblings().removeClass('selected');
            });

            BootstrapDialog.show({
                draggable: true,
                closable: false,
                message: $("#draggable-container"),
                title: 'ImgSrc Wizard',
                backdrop: 'static',
                onshown: function () {
                    $('.modal-backdrop').remove();
                }
            });

            $("#preview").load(function () {
                $("#preview").parent().unblock();
            });
        }

        return {
            restrict: 'A',
            templateUrl: '/views/templates/wizard/index.html',
            controller: 'imgMngtController',
            link: function (scope, element, attr) {
                scope.initMenu = function () {
                    if (scope.initialized) {
                        $timeout(function () {
                            initMenu();
                        }, 100); // hack
                    }
                    scope.initialized = true;
                }
            }
        }
    }])
    .directive('accordionControl', function ($compile, $parse) {
        return {
            restrict: 'AE',
            replace: false,
            priority: 1000,
            terminal: true,
            compile: function ($element, $attrs) {
                return {
                    pre: function preLink($scope, $element, $attrs, controller) {
                        $element.attr($scope.stageModel.directive, '1');
                        $element.removeAttr('accordion-control');
                    },
                    post: function postLink($scope, iElement, iAttrs, controller) {
                        $compile(iElement)($scope);
                    }
                };
            }
        };
    })

module.directive('uiSwitch', function () {
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function (scope, elem, atrrs, ngModel) {
            var html = elem[0];

            var offColor = html.attributes['off-color'] || '#0b9c8f',
                onColor = html.attributes['on-color'] || '#41b7f1';
            if (typeof offColor !== 'string')
                offColor = offColor.value;
            if (typeof onColor !== 'string')
                onColor = onColor.value;
            if (offColor == '#fff')
                offColor = null;
            if (onColor == '#fff')
                onColor = null;
            var compiledClass = html.attributes['compiled-class'] || 'switchery';
            if (typeof compiledClass !== 'string')
                compiledClass = 'switchery ' + compiledClass.value;
            var switchery = new Switchery(html, {color: onColor, secondaryColor: offColor, className: compiledClass });

            html.onchange = function () {
                scope.$apply(function () {
                    ngModel.$setViewValue(switchery.element.checked);
                });
            };

        }
    };
});

module.directive('number', function () {
    return {
        restrict: 'A',
        link: function (scope, element, atrrs) {
            function isNumber(evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (charCode > 31 && (charCode < 35 || (charCode > 40 && charCode != 46 && charCode < 48) || charCode > 57)) {
                    return false;
                }
                return true;
            }

            $(element).on("keypress", function (evt) {
                return isNumber(evt);
            });
        }
    };
})

module.directive('coords', function () {
    return {
        restrict: 'A',
        link: function (scope, element, atrrs) {
            function isCoords(evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 44) {
                    return false;
                }
                return true;
            }

            $(element).on("keypress", function (evt) {
                return isCoords(evt);
            });
        }
    };
})

module.directive('selectable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, atrrs) {
            $(element).click(function () {
                $(element).each(function (index, el) {
                    if (document.selection) {
                        var range = document.body.createTextRange();
                        range.moveToElementText(el);
                        range.select();
                    } else if (window.getSelection) {
                        var range = document.createRange();
                        range.selectNode(el);
                        window.getSelection().addRange(range);
                    }
                });
            });
        }
    };
})

    .directive('srcImgAccordion', function () {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: '/views/templates/wizard/src-img-accordion.html'
        };
    })
    .directive('cropAccordion', function () {
        function clickPreviewBtn() {
            setTimeout(function () {
                isClick = false;
                $("#previewBtn").click();
            }, 500);
        }

        return {
            restrict: 'AE',
            replace: false,
            templateUrl: '/views/templates/wizard/crop-accordion.html',
            link: function (scope, element, attrs) {
                if (scope.$parent) {
                    scope.$on('crop-move', function (event, data) {
                        scope.stageModel.crop.topX = data.x1;
                        scope.stageModel.crop.topY = data.y1;
                        scope.stageModel.crop.width = data.width;
                        scope.stageModel.crop.height = data.height;
                    });
                    scope.$on('crop-done', function (event) {
                        scope.$apply();
                        clickPreviewBtn();
                    });
                }
                var image = $('#preview');
                image.cropper({
                    aspectRatio: "auto",
                    done: function (data) {
                        scope.$root.$broadcast('crop-move', data);
                    }
                }).on('dragend', function () {
                    console.log('drag-end');
                    scope.$root.$broadcast('crop-done', null);
                });
            }
        };
    })
    .directive('resizeAccordion', function () {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: '/views/templates/wizard/resize-accordion.html'
        };
    })
    .directive('borderAccordion', function () {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: '/views/templates/wizard/border-accordion.html'
        };
    })
    .directive('effectsAccordion', function () {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: '/views/templates/wizard/effects-accordion.html'
        };
    })
    .directive('smartFillAccordion', function () {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: '/views/templates/wizard/smart-fill-accordion.html'
        };
    })
    .directive('outputAccordion', function () {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: '/views/templates/wizard/output-accordion.html'
        };
    });

/*helper child directives*/
module.directive('sliderInput', function () {
    return {
        restrict: 'E',
        scope: {
            optionModel: "=model"
        },
        replace: true,
        templateUrl: '/views/templates/wizard/slider-input.html',
        link: function (scope, element, atrrs) {
            applyAttrsToScope(scope, attrs);
            //applying defaults if no attrs passed
            if (!scope['sliderClass'])
                scope['sliderClass'] = 'slider primary';
            if (!scope['dataSliderValue'])
                scope['dataSliderValue'] = 0;
            if (!scope['dataSliderStep'])
                scope['dataSliderStep'] = 1;
            if (!scope['dataSliderMin'])
                scope['dataSliderMin'] = 0;
            if (!scope['dataSliderMax'])
                scope['dataSliderMax'] = 1000;
            if (!scope['dataSliderOrientation'])
                scope['dataSliderOrientation'] = 'horizontal';
            if (!scope['dataSliderSelection'])
                scope['dataSliderSelection'] = 'after';
            if (!scope['dataSliderTooltip'])
                scope['dataSliderTooltip'] = 'hide';
            element.boostrapSlider().on('slide', function (ev) {
                scope.model = ev.value;
            });
        }
    };
})
    .directive('colorPicker', function () {
        return {
            restrict: 'E',
            scope: {
                optionModel: "=model"
            },
            replace: true,
            templateUrl: '/views/templates/wizard/color-picker.html',
            link: function (scope, element, attrs) {
                applyAttrsToScope(scope, attrs);
                //applying defaults if no attrs passed
                if (!scope['dataColorFormat'])
                    scope['dataColorFormat'] = 'hex';
                if (!scope['placeholder'])
                    scope['placeholder'] = 'Choose color';
                if (!scope['dataColorpickerGuid'])
                    scope['dataColorpickerGuid'] = 8;
                element.colorPicker();
            }
        };
    });

function applyAttrsToScope(scope, attrs) {
    for (var key in attrs) {
        if (key.indexOf('$') != -1)
            continue;
        scope[key] = attrs[key];
    }
}

angular.module('imageManagement.helper', [])
    .factory('helper', [function () {
        return {
            applyInitPositionToAccordionMenu: function () {
                var preview = $('#preview'),
                    imgWidth = preview.outerWidth(),
                    imgRectangle = preview.position(),
                    imgRight = imgRectangle.left + imgWidth,
                    imgTop = imgRectangle.top, // - preview.outerHeight(),
                    draggableContainer = $('#draggable-container'),
                    draggableWidth = draggableContainer.outerWidth(),
                    containerWidth = $('.container').width();
                if (imgWidth + draggableWidth <= containerWidth) {
                    draggableContainer.css({left: imgWidth + 10, top: imgTop})
                } else {
                    draggableContainer.css({left: imgWidth - 20 - draggableWidth, top: imgTop + 20})
                }
            }
        }
    }]);
