angular.module('imagePositionDirective', [])
    .directive('imagePosition', ['$parse', '$timeout', function ($parse, $timeout) {
        return function (scope, element, attr) {
            var currentPosition = {};

            var $startButton = $(element).find('.image-position-start');
            var $finishButton = $(element).find('.image-position-finish');
            var $sourceImage = $(element).find('.image-position-source');
            var $selectButtonGroup = $startButton.parents('.btn-group:first');

            $startButton.bind('click', function () {
                $sourceImage.jWindowCrop({
                    targetWidth: $(element).width(),
                    targetHeight: $(element).height(),
                    smartControls: false,
                    showControlsOnStart: false,
                    onChange: function (result) {
                        currentPosition = result;
                    }
                });

                var base = $sourceImage.getjWindowCrop();
                base.setZoom(1); // Show original image size

                $selectButtonGroup.hide();
                $finishButton.show();
            });

            $finishButton.bind('click', function () {
                // Destroy control
                $sourceImage.getjWindowCrop().destroy();

                $sourceImage.hide();
                $finishButton.hide();
                $selectButtonGroup.show();

                var callback = $parse(attr['imagePosition']);
                callback(scope, {
                    $position: currentPosition
                });
            });
        }
    }
    ]);