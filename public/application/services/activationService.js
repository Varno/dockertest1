angular.module('imageResizer.activationService', [])
    .factory('activationService', ['$http', '$location', '$modal', 'notificationService', 'securityService',
        function ($http, $location, $modal, notificationService, SecurityService) {
            return {
                showActivationMessage: function (profile) {
                    $modal.open({
                        backdrop: 'static',
                        templateUrl: 'views/profile/activationMessageModal.html',
                        controller: 'activationModalController',
                        resolve: {
                            profile: function () {
                                return profile;
                            }
                        }
                    });
                },

                showActivatedNotificationIfNeed: function () {
                    if ($location.search().activated) {
                        var message = $location.search().email ? 'Email successfully confirmed' : 'Account successfully activated';
                        notificationService.success(message);
                        $location.search('activated', null);
                        if($location.search().email)
                            $location.search('email', null);
                    }
                },

                emailMeAgain: function (callback) {
                    $http({
                        method: "POST",
                        url: "/api/user/current/emailMeAgain"
                    })
                        .success(callback)
                        .error(SecurityService.redirectUnauthorized);
                },

                callMeAgain: function(callback){
                    $http({
                        method: "POST",
                        url: "/api/user/current/callMeAgain"
                    })
                        .success(callback)
                        .error(SecurityService.redirectUnauthorized);
                }
            }
        }]);

var showActivationMessageController = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};