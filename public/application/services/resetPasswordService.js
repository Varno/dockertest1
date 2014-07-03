angular.module('imageResizer.resetPasswordService', [])
    .factory('resetPasswordService', ['$http',
        function ($http) {
            return {
                requestToken: function (email, success, error) {
                    $http({
                        method: 'POST',
                        url: '/password/requestToken',
                        data: { email: email }
                    })
                        .success(success)
                        .error(error);
                },
                resetPassword: function (data, success, error) {
                    $http({
                        method: 'POST',
                        url: '/password/reset',
                        data: data
                    })
                        .success(success)
                        .error(error);
                },
                getRegUser: function(callback){
                    //not implemented
                    callback();
                }
            }
        }])
