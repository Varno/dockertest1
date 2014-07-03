var tariffsController = require('../controllers/tariffsController'),
    permissionService = require('../services/permissionService'),
    menu = require('../middleware/menu'),
    menuSetup = require('./menu');
module.exports = function (app) {
    app.get('/tariffs/index', permissionService.authorizedOnly(),
        menu({ menu: menuSetup.pages, preprocessors: menuSetup.preprocessors }), tariffsController.index);
    app.post('/tariffs/subscribe', permissionService.ajaxAuthorizedOnly(), tariffsController.subscribe);
    app.get('/tariffs/all', permissionService.ajaxAuthorizedOnly(), tariffsController.getTariffs);
}