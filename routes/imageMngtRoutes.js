var imageMngtController = require('../controllers/imageMngtController'),
    permissionService = require('../services/permissionService'),
    menu = require('../middleware/menu'),
    menuSetup = require('./menu');

module.exports = function (app) {
    app.get('/imageManagement', permissionService.authorizedOnly(),
        menu({ menu: menuSetup.pages, preprocessors: menuSetup.preprocessors }), imageMngtController.index);
    app.post('/imageManagement/resize', permissionService.authorizedOnly(), imageMngtController.resize);
}