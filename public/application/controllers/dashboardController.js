var module = angular.module('imageResizer.dashboardController', ['ngTable']);
module.controller('dashboardController', ['$scope', '$timeout',
    '$window', '$location', '$filter', '$modal', 'config',
    'ngTableParams', 'activationService', 'dashboardService', 'notificationService',
    function ($scope, $timeout, $window, $location, $filter, $modal, config, ngTableParams, activationService, dashboardService, notificationService) {
        $scope.isLoading = false;

        $scope.summ = function (hits) {
            var result = 0;
            for (var i = 0; i < hits.length; i++) {
                result += hits[i];
            }
            return result;
        }

        dashboardService.get(function (profile) {
            $scope.profile = profile;
            $scope.modalOpened = $scope.modalOpened || false;
            if (!profile.activatedAt) {
                activationService.showActivationMessage(profile);
                $scope.isActivated = false;
                $scope.activatedEmail = profile.activatedEmail;
                $scope.loaded = true;
            } else {
                $scope.isActivated = true;
            }

            var today = moment(new Date());

            $scope.startDate = today.toDate();
            $scope.endDate = today.add('days', 1).toDate();

            $scope.tomorrow = today.add('days', 1).toDate();

            function getStatistics(){
                dashboardService.getStatistics(function (statistics) {
                    $scope.statistics = {};
                    _(_(statistics.statistics || {}).pairs()).each(function(p) {
                        $scope.statistics[p[0]] = {};
                        $scope.statistics[p[0]].usage = p[1].usage;

                        $scope.statistics[p[0]].chart = [];
                        for(var ch in p[1].chart){
                            var key = (new Date(ch)).getTime();
                            var item = [key, p[1].chart[ch]];
                            $scope.statistics[p[0]].chart.push(item);
                        };

                        if (!_.isUndefined(p[1].limit)) {
                            $scope.statistics[p[0]].limited = true;
                            $scope.statistics[p[0]].usagePercent = Math.ceil(p[1].usage * 100 / p[1].limit);
                        }
                        else
                            $scope.statistics[p[0]].limited = false;
                    });
                    // TODO. Prepare charts data from statistics[metric].chart
                    InitCharts(); // todo put charts data here
                    $scope.loaded = true;
                });
            };

            getStatistics();

            function InitCharts(){

            }

            $scope.refreshRates = function(){
                getStatistics();
            };

            $scope.$on('updated-subscription', function(event){
                $scope.refreshRates();
            });

            dashboardService.getUserDetails(function (details) {
                $scope.handle = details.firstName + ' ' + details.lastName;
                $scope.pixelDomain = details.pixelDomain;
                $scope.detailsLoaded = true;
            });
        });

        $scope.rowClick = function (pixel) {
            addRemoveSelectedPixel(pixel.path, pixel.selected);
        };

        function addRemoveSelectedPixel(pixelName, selected) {
            if (!$scope.selectedPixels)
                $scope.selectedPixels = [];
            if (selected)
                $scope.selectedPixels.push(pixelName);
            else
                $scope.selectedPixels.splice($scope.selectedPixels.indexOf(pixelName), 1);
            buildAndAssignExportLink(true);
        };

        $scope.getProfileInfo = function (name) {
            if (!$scope.profile) return;

            var item = _.find($scope.profile.info, function (item) {
                return item.type == name
            });
            return item ? item.value : null;
        };

        $scope.getTitle = function () {
            var position = $scope.getProfileInfo('position') || "";
            var company = $scope.getProfileInfo('company') || "";

            return (company && position) ? position + " of " + company : "" + position + company;
        }

        $scope.isCalling = false;
        $scope.callMeAgain = function () {
            $scope.isCalling = true;
            activationService.callMeAgain(function (response) {
                $scope.activateMessage = response.message;
                $scope.isCalling = false;
            });
        }

        activationService.showActivatedNotificationIfNeed();
    }
]);

module.directive('chart', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            var data = scope.statistics[attrs.statisticName].chart;
//            var data2 = [];
//            for(var i=0;i<data.length;i++){
//                if(data[i]) {
//                    var obj = {
//                        "x": data[i][0],
//                        "y": data[i][1]
//                    };
//                    data2.push(obj);
//                }
//            }

            var requestsObjects = [
                {
                    label: attrs.labelName,
                    data: data,
//                    bars: {
//                        show: true,
//                        barWidth: 12*24*60*60*300,
//                        fill: true,
//                        lineWidth:0,
//                        order: 1,
//                        fillColor:  "rgba(243, 89, 88, 0.7)"
//                    },
                    color: "#0090D9"
                }
            ];

            var today = new Date();
            var prev30Days = new Date();
            prev30Days.setDate(today.getDate()-30);
            var minDay = prev30Days;
            var maxDay = today;

            var yMax = 2;
            for (var t = 0; t < data.length; t++) {
                var item = data[t];
                yMax = item[1] > yMax ? item[1] : yMax;
            }
            yMax = yMax + 2;

//            Morris.Line({
//                element: $(elem),
//                data: data2,
//                xkey: 'x',
//                xmin: minDay.getTime(),
////                xmax: maxDay.getTime(),
//                ykeys: ['y'],
//                ymin: '0',
//                ymax: 'auto',
//                lineColors:['#0aa699'],
////                dateFormat:function (x) {
////                    return (new Date(x)).toString("MM dd, yyyy");
////                },
////                xLabelFormat:function (x) {
////                    return (new Date(x)).toString("MM dd, yyyy");
////                }
//            });



            $.plot($(elem), requestsObjects, {
                xaxis: {
                    mode: "time",
                    min: minDay.getTime(),
                    max: maxDay.getTime(),
                    timeformat: "%b %d, 20%y",
                    tickSize: [6, "day"],
                    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    tickLength: 0, // hide gridlines
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif'
                },
                yaxis: {
                    mode: null,
                    min:0,
                    max: yMax,
                    tickSize: yMax / 8,
                    axisLabel: 'Value',
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                    axisLabelPadding: 5
                },
                grid: {
                    hoverable: true,
                    clickable: false,
                    borderWidth: 1,
                    borderColor:'#f0f0f0',
                    labelMargin:8
                },
                series: {
                    shadowSize: 1
                }
            });
        }
    };
});

module.controller('activationModalController', ['$scope', '$modalInstance', '$q', '$location', '$anchorScroll', 'config', 'activationService', 'profile',
    function ($scope, $modalInstance, $q, $location, $anchorScroll, config, activationService, profile) {
        $scope.isActivated = profile.isActivated;

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

module.filter('byrequests', function () {

    summ = function (hits) {
        var result = 0;
        for (var i = 0; i < hits.length; i++) {
            result += hits[i];
        }
        return result;
    }
    return function (input, uppercase) {
        var output = input.sort(function(a, b){
            return summ(a.hits) - summ(b.hits);
        });
        output.reverse();
        return output;
    };
});