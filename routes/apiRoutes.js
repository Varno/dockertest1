var statsController = require('../controllers/statsController'),
    docsController = require('../controllers/docsController'),
    externalEventsController = require('../controllers/externalEventsController'),
    externalEventsController = require('../controllers/externalEventsController'),
    permissionService = require('../services/permissionService'),
    resizingLogsController = require('../controllers/resizingLogsController'),
    menu = require('../middleware/menu'),
    menuSetup = require('./menu');

module.exports = function (app) {
    app.get('/statistics', statsController.getTotalStats);
    app.get('/percentageReport', statsController.percentageReport);
    app.post('/processStripeEvent', externalEventsController.processStripeEvent);
    app.post('/processPlanDowngradeEvent',permissionService.authorizedOnly(), externalEventsController.processPlanDowngradeEvent);
    app.get('/dashboard/api-docs', permissionService.authorizedOnly(),
        menu({ menu: menuSetup.pages, preprocessors: menuSetup.preprocessors }), docsController.index);
    app.get('/dashboard/external-libs', permissionService.authorizedOnly(),
        menu({ menu: menuSetup.pages, preprocessors: menuSetup.preprocessors }), docsController.externalLibsDescription);
    app.get('/resize', docsController.imageResizerProxy);
    app.get('/resizingLogs/:dateFrom/:dateTo', permissionService.authorizedOnly(), resizingLogsController.export);
    app.get('/resizingSettings', docsController.imageResizerSettings);

}