angular.module('loaderDirective', [])
    .directive('loader', function () {
        return {
            restrict: 'E',
            scope: {
                ngModel: "=",
                center: "&"
            },
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.ngModel
                }, function (loaded) {
                    if (!loaded){
                        $(attrs.target).plainOverlay('show', {
                            progress: function() { return $('<img src="/assets/img/loading-spinning-bubbles.svg" />'); }
                        });
                    }
                    else {
                        $(attrs.target).plainOverlay('hide');
                    }
                })
            }
        }
    });
