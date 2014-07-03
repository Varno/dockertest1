var module = angular.module('imageResizer.config', []);
module.constant('config', {
    filepickerKey: "AEogRGeCtSiKunHH7jXkQz",
    profileImage: {
        allowedFileTypes: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
        maxFileSizeInBytes: 1819200
    },
    profileBackgroungImage: {
        allowedFileTypes: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
        maxFileSizeInBytes: 1819200
    },
    resizerServiceBaseUrl: "http://174.129.216.231:8090"
});