/**
 * Created by Alexey Okishev on 23.05.2014.
 */
angular.module('imageManagement.resizerService', ['imageResizer.config'])
    .factory('resizerService', ['$http', 'config', function ($http, config) {
        return {
            getSettings: function (callback) {
                $http({
                    method: "GET",
                    url: "/resizingSettings"
                })
                .success(callback);
            },
            resize: function (options, callback) {
                $http({
                    method: "GET",
                    url: config.resizerServiceBaseUrl + "/api/v1?" + options
                })
                .success(callback);
            }
        }
    }]);
