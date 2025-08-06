const assemblyLineService = require('./../services/assemblyLine.service');
const baseController = require('./base.controller');
const logger = require('./../utils/log4j.config').getLogger();

exports.create = async function(req, res) {
    try {
        logger.debug("Executing create method in Assembly Line controller");
        let result = await assemblyLineService.create(req.body);
        baseController.sendSuccess(res, result, null);
    } catch (exception) {
        logger.error("ERROR: ", exception);
        baseController.sendFailure(res, exception, null);
    }
}
exports.getById = async function(req, res) {
    try {
        logger.debug("Executing getById method in Assembly Line controller");
        let result = await assemblyLineService.getById(req.params.id);
        baseController.sendSuccess(res, result, null);
    } catch (exception) {
        logger.error("ERROR: ", exception);
        baseController.sendFailure(res, exception, null);
    }
}
exports.getAssemblyLines = async function(req, res) {
    try {
        logger.debug("Executing getAssemblyLines method in Assembly Line controller");
        let result = await assemblyLineService.getAssemblyLines();
        baseController.sendSuccess(res, result, null);
    } catch (exception) {
        logger.error("ERROR: ", exception);
        baseController.sendFailure(res, exception, null);
    }
}

exports.getAssemblyLinesByLocation = async function(req, res) {
    try {
        logger.debug("Executing getAssemblyLinesByLocation method in Assembly Line controller");
        let result = await assemblyLineService.getAssemblyLinesByLocation(req.params.locationId);
        baseController.sendSuccess(res, result, null);
    } catch (exception) {
        logger.error("ERROR: ", exception);
        baseController.sendFailure(res, exception, null);
    }
}






