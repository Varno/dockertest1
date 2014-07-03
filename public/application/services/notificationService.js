angular.module('imageResizer.notificationService', [])
    .factory('notificationService', function () {
        return {
            error: function (message) {
                Messenger().post({
                    message: message,
                    type: 'error',
                    showCloseButton: true
                });
            },

            success: function showSuccess(message) {
                Messenger().post({
                    message: message,
                    showCloseButton: true
                });
            }
        }
    });