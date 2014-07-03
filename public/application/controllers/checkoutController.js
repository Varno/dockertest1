var module = angular.module('imageResizer.checkoutController', []);
module.controller('checkoutController', ['$scope', '$window', 'checkoutService',
    function ($scope, $window, checkoutService) {
        $scope.init = function(params){
            $scope.stripePublicKey = params.stripePublicKey;
            $scope.siteName = params.siteName;
            $scope.payment = params.payment;
            $scope.eventId = params.eventId;
        };

        $scope.checkout = function(){
            var handler = StripeCheckout.configure({
                key: $scope.stripePublicKey,
                image: '/square-image.png',
                token: function(token, args) {
                    checkoutService.process($scope.eventId, token.id, function(response){
                        if(response.url) $window.location.href = response.url;
                        if(response.message) $scope.errorMessage = response.message;
                    });
                }
            });

            handler.open({
                name: $scope.siteName,
                description: $scope.payment.paymentDescription,
                amount: $scope.payment.amount
            });
        };
    }]);