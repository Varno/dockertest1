angular.module('wiswigEditorDirective', [])
    .directive('wiswigEditor', function () {
        return {
            scope: {
                ngModel: '=',
                wiswigEditor: '&'
            },
            link: function (scope, element, attrs) {
                scope.wiswigEditor = scope.wiswigEditor || {};
                $(element).wysihtml5({
                    image: false,
                    color: false,
                    stylesheets: ['/assets/others/plugins/bootstrap-wysihtml5/wysiwyg-color.css'],
                    events: {
                        blur: function () {
                            scope.ngModel = $(element).val();
                        }
                    }
                });
            }
        }
    });