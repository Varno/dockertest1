angular.module('imageResizer.securityService', [])
    .factory('securityService', function () {
        return {
            redirectUnauthorized: function (data, status, headers, config) {
                if (status == 403 && data.redirectUrl) window.location.href = data.redirectUrl;
            }
        }
    });
