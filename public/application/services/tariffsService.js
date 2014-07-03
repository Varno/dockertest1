angular.module('imageResizer.tariffsService', [])
    .factory('tariffsService', ['$http', 'securityService',
        function ($http, securityService) {
            var service = {};

            service.subscribe = function(planName, token, callback){
                var data = { token: token, plan: planName };
                $http(
                    {
                        method: 'POST',
                        url: '/tariffs/subscribe',
                        data: data
                    })
                    .success(function (data, status, headers, config) {
                        callback(data);
                    })
                    .error(securityService.redirectUnauthorized);
            };

            service.loadTariffs = function(callback){
                $http(
                    {
                        method: 'GET',
                        url: '/tariffs/all'
                    })
                    .success(function (data, status, headers, config) {
                        callback(data);
                    })
                    .error(securityService.redirectUnauthorized);
            };

            return service;
        }]);