const componentService = require("./../services/component.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const multiparty = require("multiparty");
const fs = require("fs");
const configFile = require("./../config/config.json");
const replaceall = require("replaceall");

exports.saveComponentDetails = async function (req, res) {
  try {
    await processFileAndSaveDetails(req, res);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.deleteComponent = async function (req, res) {
  try {
    logger.debug("Executing deleteComponent method in component controller");
    let result = await componentService.update(req.body);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getById = async function (req, res) {
  try {
    logger.debug("Executing getById method in component controller");
    let result = await componentService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getComponents = async function (req, res) {
  try {
    logger.debug("Executing getComponents method in component controller");
    let result = await componentService.getComponents(
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

exports.getAllComponents = async function (req, res) {
  try {
    logger.debug("Executing getAllComponents method in component controller");
    let result = await componentService.getAllComponents();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getComponentImageById = async function (req, res) {
  try {
    logger.debug(
      "Executing getComponentImageById method in component controller"
    );
    let result = await componentService.getComponentImageById(
      req.params.componentId
    );
    if (result != null && result[0] != undefined) {
      sendFileURLInRespone(result[0], res);
    } else {
      baseController.sendFailure(res, null, "Unable to fetch the data");
    }
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function sendFileURLInRespone(data, res) {
  let fileArray = [];
  let index = 0;

  const processUrl = async () => {
    await asyncForEach(data.dataValues.imagePath, async (filePath) => {
      let relativeUrl = "";
      relativeUrl =
        configFile.componentBaseUrl +
        filePath.substring(configFile.componentFilePath.length);
      relativeUrl = replaceall("\\", "/", relativeUrl);
      fileArray[index++] = relativeUrl;
    });
    baseController.sendSuccess(res, fileArray, null);
  };
  processUrl();
}

async function processFileAndSaveDetails(req, res) {
  let component = {};
  let filePathArry = [];
  logger.debug("Executing saveComponentDetails method in component controller");
  var form = new multiparty.Form();

  form.on("field", function (name, val) {
    component[name] = val;
  });
  form.on("part", function (part) {
    if (part.filename) {
      let dir = `${configFile.componentFilePath}\\${component.code}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      let filePath = `${dir}\\${part.filename}`;
      part.pipe(fs.createWriteStream(filePath));
      filePathArry.push(filePath);
    }
  });

  form.on("close", function () {
    //Both in case of create/edit if file exists override the path
    if (filePathArry != null && filePathArry.length > 0) {
      component["imagePath"] = filePathArry;
    }
    saveComponent(component, res);
    logger.debug(
      "File Stream closed in saveComponentDetails method in component controller"
    );
  });

  form.on("error", function (err) {
    baseController.sendFailure(res, err, "Unable to parse the uploaded file");
  });

  form.parse(req);
}

async function saveComponent(component, res) {
  let result;
  if (component.isActive === "false") {
    //In case of delete no need to check for existing comp code
    result = await componentService.update(component);
    baseController.sendSuccess(res, result, null);
  } else if (component.id != undefined && component.id != "") {
    let existingCompCode = await componentService.getComponentByCompCodeAndId(
      component.code,
      component.id
    );
    if (existingCompCode.length == 0) {
      result = await componentService.update(component);
      baseController.sendSuccess(res, result, null);
    } else {
      baseController.sendFailure(res, null, "Component Code already exists");
    }
  } else {
    let existingCompCode = await componentService.getComponentByCompCode(
      component.code
    );
    if (existingCompCode.length == 0) {
      delete component.id // No need sendthe primary key id (create action) as the sequenmce is set to auto increment
      result = await componentService.create(component);
      baseController.sendSuccess(res, result, null);
    } else {
      baseController.sendFailure(res, null, "Component Code already exists");
    }
  }
}
