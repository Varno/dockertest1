var module = angular.module('imageResizer.tariffsController', []);
module.controller('tariffsController', ['$scope', '$window', '$modal', 'tariffsService', 'activationService',
    function ($scope, $window, $modal, tariffsService, activationService) {
        $scope.init = function(params){
            $scope.stripeKey = params.stripeKey;
            $scope.activePlan = params.activePlan;
            $scope.isActivated = checkTypeAndParseToBool(params.isPhoneActivated);
            $scope.isEmailActivated = checkTypeAndParseToBool(params.isEmailActivated);
            $scope.handle = params.firstName + ' ' + params.lastName;
            $scope.firstName = params.firstName;
            $scope.lastName = params.lastName;
            $scope.email = params.email;

            $scope.handler = StripeCheckout.configure({
                key: params.stripeKey,
                token: function(token, args) {
                    tariffsService.subscribe($scope.planToSubscribe, token.id, function(result){
                        $scope.activePlan = result.activePlan;
                        if(result.statistics)
                            $scope.$parent.limit = result.statistics.limit;
                        updateButtonsTexts();
                        $scope.$root.$broadcast('updated-subscription');
                    });
                }
            });
            initPlans();
        };


        function checkTypeAndParseToBool(maybeString){
            if(typeof maybeString === 'string')
                return maybeString == 'true' ? true : false;
            else
                return Boolean(maybeString);
        }

        initPlans = function(){
            $scope.loaded = false;
            tariffsService.loadTariffs(function(tariffs){
                $scope.loaded = true;
                $scope.tariffs = tariffs;
                updateButtonsTexts();
            });
        };

        function updateButtonsTexts(){
            var upgradeText = 'Upgrade',
                downgradeText = 'Downgrade';
            switch($scope.activePlan){
                case 'free':
                    $scope.current = 0;
                    $scope.basicButtonText = $scope.plusButtonText = $scope.advancedButtonText = upgradeText;
                    break;
                case 'basic':
                    $scope.current = 1;
                    $scope.plusButtonText = $scope.advancedButtonText = upgradeText;
                    $scope.freeButtonText = downgradeText;
                    break;
                case 'plus':
                    $scope.current = 2;
                    $scope.advancedButtonText = upgradeText;
                    $scope.freeButtonText = $scope.basicButtonText = downgradeText;
                    break;
                case 'advanced':
                    $scope.current = 3;
                    $scope.freeButtonText = $scope.basicButtonText = $scope.plusButtonText = downgradeText;
                    break;
            }
        };

        $scope.getButtonText = function(index){
            switch(index){
                case 0:
                    return $scope.freeButtonText;
                case 1:
                    return $scope.basicButtonText;
                case 2:
                    return $scope.plusButtonText;
                case 3:
                    return $scope.advancedButtonText;
            }
        };

        function openDowngradeToBasicConfirmationModal(callback){
            var modalInstance = $modal.open({
                backdrop: 'static',
                templateUrl: '/views/templates/tariffs/downgrade-to-basic-confirmation-template.html',
                controller: 'confirmationController'
            });

            modalInstance.result.then(function () {
                callback(true);
            }, function () {
                callback(false);
            });
        };

        $scope.subscribe = function(planKey, planName, amount){
            if(!$scope.isEmailActivated)
                return;
            $scope.planToSubscribe = planKey;
            if (planKey == "free") {
                openDowngradeToBasicConfirmationModal(function(confirmed){
                    if (confirmed)
                        tariffsService.subscribe($scope.planToSubscribe, null, function(result){
                            $scope.activePlan = result.activePlan;
                            updateButtonsTexts();
                        });
                });
            }
            else {
                $scope.handler.open({
                    name: 'ImgSrc',
                    description: 'Subscribe to our ' + planName + ' Plan.',
                    amount: amount
                });
            }
        };
        $scope.isActivateEmailSending = false;

        $scope.emailMeAgain = function () {
            $scope.isActivateEmailSending = true;
            $scope.activateMessage = '';
            activationService.emailMeAgain(function (response) {
                $scope.activateMessage = response.message;
                $scope.isActivateEmailSending = false;
            });
        }
    }]);

module.controller('downgradeModalController', ['$scope', '$window', '$modalInstance', 'email',
    function ($scope, $window, $modalInstance, email) {
        $scope.init = function() {
            $scope.supportEmail = email;
        }
        $scope.cancel = function(){
            $modalInstance.dismiss();
       };
    }]);

module.controller('confirmationController', ['$scope', '$window', '$modalInstance',
    function ($scope, $window, $modalInstance) {
        $scope.cancel = function(){
            $modalInstance.dismiss();
        };
        $scope.ok = function(){
            $modalInstance.close();
        };
    }]);