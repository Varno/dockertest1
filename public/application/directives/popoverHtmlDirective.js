angular.module('popoverHtmlDirective', [ 'ui.bootstrap.tooltip' ])
    .directive('popoverHtmlPopup', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
            template: '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">'
                + '<div class="arrow"></div><div class="popover-inner">'
                + '<h3 class="popover-title" ng-bind-html="title" ng-show="title"></h3>'
                + '<div class="popover-content" ng-bind-html="content"></div></div></div>'
        };
    })

    .directive('popoverHtml', [ '$tooltip', function ($tooltip) {
        return $tooltip('popoverHtml', 'popover', 'click');
    }]);