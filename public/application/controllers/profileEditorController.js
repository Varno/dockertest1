/**
 * Created by ASUS on 22.05.2014.
 */
var module = angular.module('imageResizer.profileEditorController', []);
module.controller('profileEditorController', [
    '$scope', '$modal', 'notificationService', 'dashboardService', 'activationService',
    function($scope, $modal, notificationService, dashboardService, activationService){

    dashboardService.get(function (profile) {
        $scope.profile = profile;
        $scope.modalOpened = $scope.modalOpened || false;
        if (!profile.activatedAt) {
            activationService.showActivationMessage(profile);
            $scope.isActivated = false;
            $scope.activatedEmail = profile.activatedEmail;
            $scope.loaded = true;
        } else {
            $scope.isActivated = true;
        }
    });

    $scope.openProfileEditor = function () {
        var modalInstance = $modal.open({
            backdrop: 'static',
            templateUrl: '/views/profile/profileEditorModal.html',
            controller: 'profileEditorModalController',
            resolve: {
                profile: function () {
                    return $scope.profile;
                }
            }
        });

        modalInstance.result.then(
            function (profile) {
                $scope.profile = profile;
                notificationService.success('Profile successfully updated');
            }, function () {
            }
        );
    };
}]);

module.controller('profileEditorModalController', [
    '$scope', '$modalInstance', '$q', '$location', '$anchorScroll', 'config', 'dashboardService', 'profile',
    function ($scope, $modalInstance, $q, $location, $anchorScroll, config, dashboardService, profile) {
        $scope.errorMessage = null;
        $scope.profileImageConfig = config.profileImage;
        $scope.profile = angular.copy(profile);

        $scope.initModal = function () {
            $("#phone").mask("+9(999) 999-9999");
        };

        // Converst info array to object
        $scope.profile.infoObject = {};
        angular.forEach(profile.info, function (item, key) {
            $scope.profile.infoObject[item.type] = item.value;
        });

        $scope.update = function () {
            $scope.errorMessage = null;
            var profile = angular.copy($scope.profile);

            profile.info = [];
            angular.forEach($scope.profile.infoObject, function (value, key) {
                profile.info.push({ type: key, value: value });
            });

            // No need to store this object
            delete profile.infoObject;

            dashboardService.update(
                profile,
                $scope.image,
                function (profile) {
                    // Return profile to view
                    $modalInstance.close(profile);
                }, function (error) {
                    $scope.errorMessage = error.errors
                        ? error.errors.join('<br/>') : (error.message ? error.message : error);
                    // Scroll to error
                    $location.hash('modal-header');
                    $anchorScroll();
                    $location.hash('');
                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);