angular.module('twitterHandlerDirective', [])
    .directive('twitterHandler', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function getHandler(text) {
                    return text ? "@" + text.replace(/@/g, '') : null;
                }

                ngModel.$parsers.push(getHandler);
                ngModel.$formatters.push(getHandler);
            }
        };
    });