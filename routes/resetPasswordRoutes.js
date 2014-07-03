var resetPasswordController = require('../controllers/resetPasswordController');

module.exports = function (app) {

    app.post('/password/requestToken', resetPasswordController.requestToken);
    app.get('/password/reset/:token', resetPasswordController.get);
    app.post('/password/reset',
        // Following flow need to define login url by user role
        resetPasswordController.rememberUserIdFromToken,
        resetPasswordController.reset,
        resetPasswordController.returnLoginUrl
    );
}