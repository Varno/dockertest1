var module = angular.module('imageResizer.accountController', []);
module.controller('accountController',
    ['$scope', '$http', '$location', '$modal', 'accountService', 'notificationService',
        function ($scope, $http, $location, $modal, instanceService, notificationService) {
            $scope.list = function () {
                $scope.isLoading = true;
                instanceService.list(function (instances) {
                    $scope.accounts = instances;
                    $scope.reorder();
                    $scope.isLoading = false;
                });
            }

            $scope.showModal = function (instance) {
                var modalInstance = $modal.open({
                    backdrop: 'static',
                    templateUrl: 'views/account/accountEditorModal.html',
                    controller: 'accountEditorModalController',
                    resolve: {
                        account: function () {
                            return instance;
                        }
                    }
                });

                modalInstance.result.then(
                    function (instance) {
                        instanceService.createOrUpdate(instance, function (updatedInstance, isNew) {
                            var current = _.filter($scope.accounts, function (item) {
                                return item._id == instance._id
                            })[0];
                            var index = $scope.accounts.indexOf(current);
                            if (index >= 0) $scope.accounts.splice(current, 1);
                            $scope.accounts.push(updatedInstance);
                            $scope.reorder();
                        });
                    }, function () {
                    }
                );
            }

            $scope.add = function () {
                $scope.showModal({});
            }

            $scope.update = function (instance) {
                $scope.showModal(instance);
            }

            $scope.remove = function (instance) {
                instance.isUpdating = true;
                instanceService.remove(instance, function (response) {
                    instance.isUpdating = false;
                    var index = $scope.accounts.indexOf(instance);
                    if (index >= 0) $scope.accounts.splice(index, 1);
                    $scope.reorder();
                })
            }

            $scope.canPause = function(instance) {
                return instance.statusName == "active";
            }

            $scope.pause = function (instance) {
                instance.isUpdating = true;
                instanceService.pause(instance, function (response) {
                    instance.isUpdating = false;
                    // TODO: refresh status
                })
            }

            $scope.canResume = function(instance) {
                return instance.statusName == "paused";
            }

            $scope.resume = function (instance) {
                instance.isUpdating = true;
                instanceService.resume(instance, function (response) {
                    instance.isUpdating = false;
                    // TODO: refresh status
                })
            }

            $scope.reorder = function () {
                $scope.accounts = _.sortBy($scope.accounts, function (item) {
                    return -1 * new Date(item.createdAt).getTime();
                })
            }

            var showAcceptedNotificationIfNeed = function () {
                if ($location.search().accepted) {
                    notificationService.success('Account successfully created');
                    $location.search('accepted', null);
                }
            }

            $scope.list();
            showAcceptedNotificationIfNeed();

        }]);


module.controller('accountEditorModalController', ['$scope', '$modalInstance', 'accountService', 'account',
    function ($scope, $modalInstance, instanceService, instance) {
        $scope.instance = angular.copy(instance);

        $scope.update = function () {
            $modalInstance.close($scope.instance);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);