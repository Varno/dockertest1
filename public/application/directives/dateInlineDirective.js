angular.module('dateInlineDirective', [])
    .directive('dateInline', ['$timeout', function ($timeout) {
        return {
            scope: {
                dateInline: '=',
                dateChanged: '&'
            },
            link: function (scope, element) {
                element.datepicker()
                    .on('changeDate', function (e) {
                        var datepicker = element.data('datepicker');
                        if (e.date != datepicker.date) scope.dateChanged()(e.date);
                    });

                scope.$watch(function () {
                    return scope.dateInline;
                }, function (value) {
                    element.data('datepicker').update(moment(value).format('L'));
                });
            }
        }
    }]);