var activationController = require('../controllers/activationController'),
    permissionService = require('../services/permissionService');

module.exports = function (app) {

    app.get('/activate/email/:token', activationController.activateEmail);
    //Post method is better here, because call is under our control (from client code)
    //only for authorized
    app.post('/activate/phone/', activationController.activatePhone);
    //all is for testing. Twilio does POST. Replace after testing is completed
    app.all('/api/v1/twilio/twiml/:userId/:token', activationController.twiMl);
}