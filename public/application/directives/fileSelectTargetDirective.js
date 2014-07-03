angular.module('fileSelectTargetDirective', [])
    .directive('fileSelectTarget', [ function () {
        return function (scope, elem, attr) {
            var targetId = attr['fileSelectTarget'];
            var target = angular.element(document.getElementById(targetId));
            elem.bind('click', function () {
                target.click();
            });
        };
    } ]);