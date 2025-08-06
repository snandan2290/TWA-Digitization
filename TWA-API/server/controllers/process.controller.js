const processService = require("./../services/process.service");
const instructionService = require("./../services/instruction.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const configFile = require("./../config/config.json");
const multiparty = require("multiparty");
const fs = require("fs");

exports.saveProcessDetails = async function(req, res) {
  try {
    logger.debug("Executing saveProcessDetails method in process controller");
    await processFileAndSaveDetails(req, res);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.deleteProcessDetails = async function(req, res) {
  try {
    logger.debug("Executing deleteProcessDetails method in process controller");
    result = await processService.update(req.body);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getById = async function(req, res) {
  try {
    logger.debug("Executing getById method in process controller");
    let result = await processService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.findAllProcess = async function(req, res) {
  try {
    logger.debug("Executing findAllProcess method in process controller");
    let result = await processService.findAllProcess(
      req.params.page,
      req.params.pageSize,
      req.params.searchParam
    );
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getAllProcessesList = async function(req, res) {
  try {
    logger.debug("Executing getAllProcessesList method in process controller");
    let result = await processService.getAllProcessesList();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

async function processFileAndSaveDetails(req, res) {
  let process = {};
  let filePath = "";
  var form = new multiparty.Form();

  form.on("field", function(name, val) {
    process[name] = val;
  });
  form.on("part", function(part) {
    if (part.filename) {
      let dir = `${configFile.instructionsPath}\\ge\\${process.code}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      filePath = `${dir}\\${part.filename}`;
      part.pipe(fs.createWriteStream(filePath));
    }
  });

  form.on("close", function() {
    saveProcessAndInstruction(process, filePath, res);
    logger.debug(
      "File Stream closed in saveProcessDetails method in component controller"
    );
  });

  form.on("error", function(err) {
    baseController.sendFailure(
      res,
      err,
      "Unable to parse the uploaded file in saveProcessDetails"
    );
  });

  form.parse(req);
}

async function saveProcessAndInstruction(process, filePath, res) {
  let result;
  let instruction = {
    fileLocation: filePath,
    instructionType: "GE"
  };
  if (process.id != undefined && process.id != "") {
    let existingProcessCode = await processService.getProcessByCodeAndId(
      process.code,
      process.id
    );
    if (existingProcessCode.length == 0) {
      result = await processService.update(process);
      if (filePath != "") {
        instruction["processId"] = process.id;
        await instructionService.updateByProcessId(instruction);
      }
    } else {
      baseController.sendFailure(res, null, "Operation Code already exists");
    }
  } else {
    let existingProcessCode = await processService.getProcessByCode(
      process.code
    );
    if (existingProcessCode.length == 0) {
      delete process.id;
      result = await processService.create(process);
      instruction["processId"] = result.id;
      await instructionService.create(instruction);
    } else {
      baseController.sendFailure(res, null, "Operation Code already exists");
    }
  }
  baseController.sendSuccess(res, result, null);
}
