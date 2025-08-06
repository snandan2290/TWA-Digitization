const billOfMaterialService = require("./../services/billOfMaterial.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const configFile = require("./../config/config.json");
const replaceall = require("replaceall");

exports.saveBillOfMaterialDetails = async function(req, res) {
  try {
    logger.debug(
      "Executing saveBillOfMaterialDetails method in billOfMaterial controller"
    );
    let result;
    if (req.body.id != undefined && req.body.id != "") {
      result = await billOfMaterialService.update(req.body);
    } else {
      result = await billOfMaterialService.create(req.body);
    }
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getById = async function(req, res) {
  try {
    logger.debug("Executing getById method in billOfMaterial controller");
    let result = await billOfMaterialService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getBillOfMaterials = async function(req, res) {
  try {
    logger.debug(
      "Executing getBillOfMaterials method in billOfMaterial controller"
    );
    let result = await billOfMaterialService.getBillOfMaterials();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getBillOfMaterialsByVariant = async function(req, res) {
  try {
    logger.debug(
      "Executing getBillOfMaterialsByVariant method in billOfMaterial controller"
    );
    let result = await billOfMaterialService.getBillOfMaterialsByVariant(
      req.params.variantId
    );
    if (result.length === 0) {
      baseController.sendSuccess(res, result, null);
    } else {
      let index = 0;
      const processResultAsync = async () => {
        await asyncForEach(result, async element => {
          getFileURL(element).then(function(urlArray) {
            element.dataValues["filePathURL"] = urlArray;
            index++;
            //Added length check to hold the return of response till the complete Array processing
            if (index === result.length) {
              baseController.sendSuccess(res, result, null);
            }
          });
        });
      };
      processResultAsync();
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

function getFileURL(data) {
  let fileArray = [];
  let index = 0;

  const processUrl = async () => {
    if (data.dataValues.imagePath != null) {
      await asyncForEach(data.dataValues.imagePath, async filePath => {
        let relativeUrl = "";
        relativeUrl =
          configFile.componentBaseUrl +
          filePath.substring(configFile.componentFilePath.length);
        relativeUrl = replaceall("\\", "/", relativeUrl);
        fileArray[index++] = relativeUrl;
      });
    }
    return fileArray;
  };
  return processUrl();
}
