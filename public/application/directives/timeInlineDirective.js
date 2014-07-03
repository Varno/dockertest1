angular.module('timeInlineDirective', [])
    .controller("timeInlineController", ["$scope", function ($scope) {
        var getTimeCollection = function (from, to, step, perGroup, leadingZero) {
            var groups = [];
            var items = [];
            var currentGroup = [];

            function pad(str, max) {
                return str.length < max ? pad("0" + str, max) : str;
            }

            var getTitle = function (index) {
                return leadingZero ? pad(index.toString(), to.toString().length) : index;
            }

            for (var index = from; index <= to; index += step) {
                var item = {
                    value: index,
                    title: getTitle(index),
                    step: step
                };

                currentGroup.push(item);
                items.push(item);
                if (perGroup == currentGroup.length) {
                    groups.push(currentGroup);
                    currentGroup = [];
                }
            }

            return {
                groups: groups,
                items: items
            };
        }

        $scope.hourItems = getTimeCollection(1, 12, 1, 4, false);
        $scope.minuteItems = getTimeCollection(0, 55, 5, 4, true);

        $scope.selectHour = function (hour) {
            $scope.selectedHour = hour;
            onTimeChanged();
            return false;
        };

        $scope.selectMinute = function (minute) {
            $scope.selectedMinute = minute;
            onTimeChanged();
            return false;
        };

        $scope.isHourSelected = function (hour) {
            return $scope.selectedHour == hour;
        };

        $scope.isMinuteSelected = function (minute) {
            return $scope.selectedMinute == minute;
        };

        $scope.selectPeriod = function (period) {
            $scope.period = period;
            onTimeChanged();
        }

        var onTimeChanged = function () {
            var hours = $scope.period == "AM" ? $scope.selectedHour.value : 12 + $scope.selectedHour.value;
            var time = {
                hour: Math.min(hours, 24),
                minute: $scope.selectedMinute.value
            };

            var timeChanged = $scope.timeChanged();
            if (timeChanged) timeChanged(time);
        }

        var findHour = function (items, value) {
            return _.filter(items, function (item) {
                return item.value == value
            })[0];
        }

        var findMinute = function (items, value) {
            return _.filter(items, function (item) {
                return item.value <= value && value < (item.value + item.step)
            })[0];
        }

        $scope.init = function (date, timeChanged) {
            $scope.selectedHour = findHour($scope.hourItems.items, parseInt(moment(date).format('h')));
            $scope.selectedMinute = findMinute($scope.minuteItems.items, parseInt(moment(date).format('m')));
            $scope.period = moment(date).format('A');

            $scope.timeChanged = timeChanged;
            onTimeChanged();
        }
    }])
    .directive('timeInline', function () {
        return {
            scope: {
                timeInline: '=',
                timeChanged: '&'
            },
            controller: "timeInlineController",
            templateUrl: "/views/controls/time-inline.html",
            link: function (scope) {
                scope.init(scope.timeInline, scope.timeChanged);
            }
        }
    });
