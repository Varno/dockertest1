angular.module('submitValidOnlyDirective', [])
    .directive('submitValidOnly', function () {
        return {
            scope: false,
            link: function (scope, element, attrs) {

                element.on('submit', function () {
                    element.parsley('destroy');
                    if (element.parsley('validate'))
                        scope.$eval(attrs.submitValidOnly);
                });
            }
        };
    });
