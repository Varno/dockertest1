angular.bootstrap($('.page-container'), [
    'ngSanitize',
    'ui.bootstrap',
    'imageResizer.config',
    'imageResizer.directives',
    'imageResizer.securityService',
    'imageResizer.dashboardService',
    'imageResizer.notificationService',
    'imageResizer.activationService',
    'imageResizer.dashboardController'
]);
