var module = angular.module('imageResizer.resetPasswordControllers', []);
module.controller('resetPasswordController', ['$scope', '$http', '$modal', 'resetPasswordService',
    function ($scope, $http, $modal, resetPasswordService) {
        $scope.init = function (token) {
            $scope.token = token;
            resetPasswordService.getRegUser(function(){
                $scope.model = { regUser : null };
            });
        };

        $scope.showLoginForm = function(){
            $scope.showLogin = !$scope.showLogin;
        };

        $scope.toggleRegistrationForm = function(){
            $scope.showRegistration = !$scope.showRegistration;
        };

        $scope.checkFormSubmit = function(event){
            if(event.target.id == 'domains')
                event.preventDefault();
        };

        $scope.showResetPasswordRequestModal = function () {
            $modal.open({
                backdrop: 'static',
                templateUrl: '/templates/password/request.html',
                controller: 'resetPasswordRequestModalController'
            });
        }

        $scope.resetPassword = function () {
            $scope.errorMessage = null;
            $scope.isLoading = true;

            resetPasswordService.resetPassword({
                    token: $scope.token,
                    password: $scope.password,
                    confirm: $scope.confirm
                },
                function (data) {
                    $scope.isLoading = false;
                    $scope.isPasswordReseted = true;
                    $scope.loginUrl = data.loginUrl;
                },
                function (data) {
                    $scope.errorMessage = data.error.message;
                    $scope.isLoading = false;
                }
            );

        }
    }
]);

module.controller('resetPasswordRequestModalController', ['$scope', '$modalInstance', 'resetPasswordService',
    function ($scope, $modalInstance, resetPasswordService) {
        $scope.isLoading = false;
        $scope.isRequestSent = false;
        $scope.isEditing = true;

        $scope.process = function () {
            $scope.errorMessage = null;
            $scope.isLoading = true;
            $scope.isEditing = false;

            resetPasswordService.requestToken($scope.email, function (data) {
                    $scope.isLoading = false;
                    $scope.isRequestSent = true;
                    $scope.isEditing = true;
                },
                function (data) {
                    $scope.errorMessage = data.error.message;
                    $scope.isLoading = false
                    $scope.isEditing = true;
                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);
