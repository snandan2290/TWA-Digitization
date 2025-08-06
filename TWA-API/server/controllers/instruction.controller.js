const instructionService = require("./../services/instruction.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const fs = require("fs");
var path = require("path");
const configFile = require("./../config/config.json");
const replaceall = require("replaceall");

exports.saveInstructionDetails = async function(req, res) {
  try {
    logger.debug(
      "Executing saveInstructionDetails method in instruction controller"
    );
    let result;
    if (req.body.id != undefined && req.body.id != "") {
      result = await instructionService.update(req.body);
    } else {
      result = await instructionService.create(req.body);
    }
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getById = async function(req, res) {
  try {
    logger.debug("Executing getById method in instruction controller");
    let result = await instructionService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getProcessByVariantId = async function(req, res) {
  try {
    logger.debug(
      "Executing getProcessByVariantId method in instruction controller"
    );
    let result = await instructionService.getProcessByVariantId(
      req.params.variantId
    );
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getInstructions = async function(req, res) {
  try {
    logger.debug("Executing getInstructions method in instruction controller");
    let result = await instructionService.getInstructions();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getSOPInstructions = async function(req, res) {
  try {
    logger.debug(
      "Executing getSOPInstructions method in instruction controller"
    );
    let result = await instructionService.getSOPInstructions(
      req.body.processId,
      req.body.variantId
    );
    if (result != null && result[0] != undefined) {
      sendFileURLInRespone(res, result[0].fileLocation);
    } else {
      baseController.sendFailure(res, null, "ERROR File does not exist");
    }
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getSOPInstructionsByVariantId = async function(req, res) {
  try {
    logger.debug(
      "Executing getSOPInstructionsByVariantId method in instruction controller"
    );
    let result = await instructionService.getSOPInstructionsByVariantId(
      req.body.variantId
    );
    processData(res, result);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getGEInstructions = async function(req, res) {
  try {
    logger.debug(
      "Executing getGEInstructions method in instruction controller"
    );
    let result = await instructionService.getGEInstructions(req.body.processId);
    if (result != null && result[0] != undefined) {
      sendFileURLInRespone(res, result[0].fileLocation);
    } else {
      baseController.sendFailure(res, null, "ERROR File does not exist");
    }
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

function sendFileURLInRespone(res, filePath) {
  fs.exists(filePath, function(exists) {
    if (exists) {
      let relativeUrl = "";
      relativeUrl =
        configFile.instructionsBaseUrl +
        filePath.substring(configFile.instructionsPath.length);
      relativeUrl = replaceall("\\", "/", relativeUrl);
      baseController.sendSuccess(res, relativeUrl, null);
    } else {
      baseController.sendFailure(res, null, "ERROR File does not exist");
    }
  });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function processData(res, data) {
  let index = 0;
  const processUrl = async () => {
    await asyncForEach(data, async element => {
      let relativeUrl = "";
      relativeUrl =
        configFile.instructionsBaseUrl +
        element.dataValues.fileLocation.substring(
          configFile.instructionsPath.length
        );
      relativeUrl = replaceall("\\", "/", relativeUrl);
      element.dataValues["fileUrl"] = relativeUrl;
      index++;
      if (index === data.length) {
        baseController.sendSuccess(res, data, null);
      }
    });
  };

  if (data.length > 0) {
    return processUrl();
  } else {
    baseController.sendSuccess(res, data, null);
  }
}
