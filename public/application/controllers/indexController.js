var module = angular.module('imageResizer.indexController', []);
module.controller('indexController',
    ['$scope', '$http', '$location', '$modal',
        function ($scope, $http, $location, $modal) {
            $scope.showModal = function () {
                $scope.showLogin = true;
            }
        }]);
