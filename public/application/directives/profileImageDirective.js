angular.module('profileImageDirective', [])
    .directive('profileImage', ['$parse', function ($parse) {

        function cancelFileSelection(element, modelSetter, scope, className) {
            $(element).parents('div:first').find('.' + className).show();

            element[0].files = [];
            modelSetter(scope, null);
        }

        function drawSelectedImage(image) {
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onloadend = function () {
                    $('.user-profile-pic-modal img').attr('src', this.result);
                };
            } else {
                $('.user-profile-pic-modal')
                    .empty()
                    .text(image.name);
            }
        }

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.profileImage);
                var modelSetter = model.assign;

                var allowedTypes = attrs.profileImageAllowedTypes.toLowerCase().split(',');
                var maxSizeInBytes = parseInt(attrs.profileImageMaxSize);

                element.bind('click', function () {
                    // Clear validation
                    $(element).parents('div:first').find('.wrong-type, .too-large').hide();
                });

                element.bind('change', function () {
                    if (element[0].files.length == 0) {
                        // Clear model if no file selected
                        scope.$apply(function () {
                            modelSetter(scope, null);
                        });

                        return;
                    }

                    var file = element[0].files[0];
                    var fileTypeParts = file.name.toLowerCase().split('.');
                    var fileType = fileTypeParts[fileTypeParts.length - 1];

                    // Check file type
                    if (allowedTypes.indexOf(fileType) == -1) {
                        cancelFileSelection(element, modelSetter, scope, 'wrong-type');
                        return false;
                    }

                    // Check file size
                    var fileSize = file.size;
                    if (fileSize > maxSizeInBytes) {
                        cancelFileSelection(element, modelSetter, scope, 'too-large');
                        return false;
                    }

                    scope.$apply(function () {
                        modelSetter(scope, file);
                    });

                    drawSelectedImage(file);
                });
            }
        };
    }]);
