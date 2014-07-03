angular.module('dateTimeInlineDirective', [])
    .directive('dateTimeInline', function () {
        return {
            scope: {
                dateTimeInline: "="
            },
            templateUrl: "/views/controls/date-time-inline.html",
            link: function (scope) {
                scope.date = scope.dateTimeInline;

                scope.getDateWithTime = function (date, time) {

                    var date = moment(date).hour(time.hour).minute(time.minute).second(0).millisecond(0);
                    return date.format("L LT");
                }

                scope.onDateChanged = function (date) {
                    scope.date = scope.getDateWithTime(date, scope.time);
                    scope.dateTimeInline = scope.date;
                };

                scope.time = {};
                scope.onTimeChanged = function (time) {
                    scope.time = time;
                    scope.date = scope.getDateWithTime(scope.date, scope.time);
                    scope.dateTimeInline = scope.date;
                }
            }
        }
    });
