angular.module('imageResizer.checkoutService', [])
    .factory('checkoutService', ['$http', 'securityService',
        function ($http, securityService) {
            var service = {};

            service.process = function(eventId, token, callback){
                $http({
                    method: "POST",
                    url: "/showorg/checkout/" + eventId,
                    data: {token: token}
                }).success(callback)
                .error(securityService.redirectUnauthorized);
            }

            return service;
        }]);