const deviceService = require("./../services/device.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();

exports.saveDeviceDetails = async function(req, res) {
  try {
    logger.debug("Executing saveDeviceDetails method in device controller");
    let result;
    let device = await deviceService.getDeviceByUuid(req.body.uuid);
    if (device.length > 0) {
      logger.debug("Update exisitng device", req.body.uuid, "for processId:", req.body.processId, " and assemblyLineId:", req.body.assemblyLineId);
      if (req.body.fcm_token) {
        logger.debug("FCM token:", req.body.fcm_token, ' operator_id:', req.body.operator_id);
      }
      console.log("Updating existing device");
      result = await deviceService.updateByUUID(req.body);
    } else {
      logger.debug("Create a new device", req.body.uuid, "for processId:", req.body.processId, " and assemblyLineId:", req.body.assemblyLineId);
      console.log("Creating new device");
      result = await deviceService.create(req.body);
    }
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getById = async function(req, res) {
  try {
    logger.debug("Executing getById method in device controller");
    let result = await deviceService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getByUuid = async function(req, res) {
  try {
    logger.debug("Executing getByUuid method in device controller");
    let result = await deviceService.getByUuid(req.body.uuid);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getDevices = async function(req, res) {
  try {
    logger.debug("Executing getDevices method in device controller");
    let result = await deviceService.getDevices();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
