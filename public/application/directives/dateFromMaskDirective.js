    angular.module('dateFromMaskDirective', [])
        .directive('dateFromMask', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attr, ngModel) {
                    function fromStartDate(text) {
                        if (!text) return null;
                        return new Date(text || '');
                    }

                    function toStartDate(text) {
                        if (!text) return null;
                        return moment(text).format('MM/DD/YYYY HH:mm');
                    }

                    ngModel.$parsers.push(fromStartDate);
                    ngModel.$formatters.push(toStartDate);
                }
            };
        });