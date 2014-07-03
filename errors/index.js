GLOBAL.ApplicationError = function(message){
    this.message = message;
    this.code = 500;
};
GLOBAL.ApplicationError.prototype = Error.prototype;

GLOBAL.NotFoundError = function(message){
    this.message = message;
    this.code = 404;
};
GLOBAL.NotFoundError.prototype = Error.prototype;

GLOBAL.PermissionDeniedError = function(message){
    this.message = message || "Permission Denied";
    this.code = 503;
};
GLOBAL.PermissionDeniedError.prototype = Error.prototype;