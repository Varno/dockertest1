angular.bootstrap($('.container'), [
    'ngSanitize',
    'ui.bootstrap',
    'imageResizer.config',
    'imageResizer.directives',
    'imageResizer.securityService',
    'imageResizer.tariffsService',
    'imageResizer.notificationService',
    'imageResizer.dashboardService',
    'imageResizer.activationService',
    'imageResizer.tariffsController',
    'imageResizer.dashboardController'
]);