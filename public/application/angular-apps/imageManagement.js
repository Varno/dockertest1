/**
 * Created by Alexey Okishev on 23.05.2014.
 */
var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
    return window._;
});
angular.bootstrap($('.container'), [
    'ngSanitize',
    'ui.bootstrap',
    'imageManagement.directives',
    'imageManagement.resizerService',
    'imageResizer.dashboardService',
    'imageResizer.securityService',
    'underscore',
    'imageResizer.config',
    'imageManagement.imgMngtController',
    'imageManagement.helper'
]);