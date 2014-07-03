angular.module('preventClickDirective', [])
    .directive('preventClick', function () {
        return {
            link: function (scope, element) {
                element.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        }
    });
