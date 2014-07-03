angular.module('imageResizer.dashboardService', [])
    .factory('dashboardService', ['$http', 'securityService',
        function ($http, securityService) {
            var getUserKey = function(){
                var userKey;
                return function(callback){
                    if (userKey) callback(userKey);
                    $http(
                        {
                            method: 'GET',
                            url: '/api/user/current/userkey'
                        })
                        .success(function (result) {
                            userKey = result;
                            callback(userKey);
                        })
                        .error(function(err){
                            securityService.redirectUnauthorized();
                        });
                }
            }
            return {
                get: function (callback) {
                    $http
                        .get('/api/user/current')
                        .success(function (data) {
                            callback(data);
                        })
                        .error(securityService.redirectUnauthorized);
                },
                update: function (profile, file, onSuccess, onError) {
                    $http({
                            url: '/api/user/current',
                            method: 'POST',
                            data: profile
                        })
                        .success(function (data, status, headers, config) {
                            onSuccess(data);
                        })
                        .error(function (data, status, headers, config) {
                            if (status == 403) {
                                securityService.redirectUnauthorized();
                            } else {
                                onError(data);
                            }
                        });
                },
                getUserKey: getUserKey(),
                getStatistics: function(callback){
                    $http(
                        {
                            method: 'GET',
                            url: '/api/user/current/statistics'
                        })
                        .success(function (data, status, headers, config) {
                            callback(data);
                        })
                        .error(securityService.redirectUnauthorized);
                },
                getUserDetails : function(callback){
                   $http({
                            method: 'GET',
                            url: '/api/user/current/details'
                        })
                        .success(function (data, status, headers, config) {
                            callback(data);
                        })
                        .error(securityService.redirectUnauthorized);
                }
            }
        }]);