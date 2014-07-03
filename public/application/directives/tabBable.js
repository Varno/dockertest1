/**
 * Created by ASUS on 30.05.2014.
 */
angular.module('tabBableDirective', [])
    .directive('tabBable', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(e.target).tab('show');
                });
            }
        }
    });
