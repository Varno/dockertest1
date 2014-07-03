angular.module('imageResizer.accountService', [])
    .factory('accountService', ['$http', 'securityService', function ($http, securityService) {
        return {
            list: function (callback) {
                $http({
                    method: "GET",
                    url: "/api/account"
                })
                    .success(callback);
            },
            remove: function (instance, callback) {
                $http({
                    method: "DELETE",
                    url: "/api/account/" + instance._id
                })
                    .success(callback)
            },
            pause: function (instance, callback) {
                $http({
                    method: "POST",
                    url: "/api/account/" + instance._id + "/pause"
                })
                    .success(callback)
            },
            resume: function (instance, callback) {
                $http({
                    method: "POST",
                    url: "/api/account/" + instance._id + "/resume"
                })
                    .success(callback)
            },
            createOrUpdate: function (instance, callback) {
                var isNew = !instance._id;
                var url = '/api/account' + (isNew ? '' : "/" + instance._id );
                $http({
                    method: "POST",
                    url: url,
                    data: instance
                }).success(function (data) {
                        callback(data, isNew);
                    });
            }
        }
    }]);
