const variantService = require("./../services/variant.service");
const processService = require("./../services/process.service");
const instructionService = require("./../services/instruction.service");
const billOfMaterialService = require("./../services/billOfMaterial.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const multiparty = require("multiparty");
const fs = require("fs");
const configFile = require("./../config/config.json");
const replaceall = require("replaceall");
const {convertToJSON} = require("./../scripts/VariantMasterUploadScript");

exports.saveVariantDetails = async function(req, res) {
   res.connection.setTimeout(900000);
  try {
    logger.debug("Executing saveVariantDetails method in variant controller");
    await processRequestAndSaveDetails(req, res);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.deleteVariant = async function(req, res) {
  try {
    logger.debug("Executing deleteVariant method in variant controller");
    let result = await variantService.update(req.body);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getById = async function(req, res) {
  try {
    logger.debug("Executing getById method in variant controller");
    let result = await variantService.getById(req.params.id);
    let processList = await instructionService.getInstructionsByVariantId(
      result.id
    );
    result.dataValues["process"] = processList;
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getVariants = async function(req, res) {
  try {
    logger.debug("Executing getVariants method in variant controller");
    let result = await variantService.getVariants(
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

exports.getAllVariants = async function(req, res) {
  try {
    logger.debug("Executing getAllVariants method in variant controller");
    let result = await variantService.getAllVariants();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getVariantImageById = async function(req, res) {
  try {
    logger.debug("Executing getVariantImageById method in variant controller");
    let result = await variantService.getVariantImageById(req.params.variantId);
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

exports.getSOPFileByVariantId = async function(req, res) {
  try {
    logger.debug(
      "Executing getSOPFileByVariantId method in variant controller"
    );
    let result = await variantService.getSOPFileByVariantId(
      req.params.variantId
    );
    if (result != null && result[0] != undefined) {
      let filePath = result[0].sopFile;
      relativeUrl =
        configFile.instructionsBaseUrl +
        filePath.substring(configFile.instructionsPath.length);
      relativeUrl = replaceall("\\", "/", relativeUrl);
      baseController.sendSuccess(res, relativeUrl, null);
    } else {
      baseController.sendFailure(res, null, "ERROR File does not exist");
    }
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

async function processRequestAndSaveDetails(req, res) {
  let variant = {};
  let sopFileName = "";
  let imagePathArry = [];
  let hasSOPFilePart = false;
  var form = new multiparty.Form();

  form.on("field", function(name, val) {
    variant[name] = val;
  });
  form.on("part", function(part) {
    if (part.filename) {
      if (part.name.includes("process")) {
        hasSOPFilePart = true;
        let dir = `${configFile.instructionsPath}\\sop\\${variant.code}`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        let filePath = `${dir}\\${part.filename}`;
        part
          .pipe(fs.createWriteStream(filePath))
          .on("finish", async function() {
            //This scenario is only valid when there is a single SOP uploaded from the UI
            variant["sopFile"] = filePath;
            if (variant["id"] !== undefined && variant["id"] !== null) {
              updateVariantDetails(variant, imagePathArry, sopFileName, res);
            } else {
              createVariantDetails(variant, imagePathArry, sopFileName, res);
            }
          });
        sopFileName = filePath;
      } else if (part.name.includes("image")) {
        let dir = `${configFile.variantFilePath}\\${variant.code}`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir,{ recursive: true });
        }
        let filePath = `${dir}\\${part.filename}`;
        part.pipe(fs.createWriteStream(filePath));
        imagePathArry.push(filePath);
      }
    }
  });

  form.on("close", async function() {
    //When there is no SOP trigger create logic in close
    if (hasSOPFilePart == false) {
      if (variant["id"] !== undefined && variant["id"] !== null) {
        updateVariantDetails(variant, imagePathArry, sopFileName, res);
      } else {
        createVariantDetails(variant, imagePathArry, sopFileName, res);
      }
    }
    logger.debug(
      "File Stream closed in saveVariantDetails method in Variant controller"
    );
  });

  form.on("error", function(err) {
    baseController.sendFailure(
      res,
      err,
      "Unable to parse the file in saveVariantDetails"
    );
  });

  form.parse(req);
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function sendFileURLInRespone(data, res) {
  let fileArray = [];
  let index = 0;

  const processUrl = async () => {
    await asyncForEach(data.dataValues.imagePath, async filePath => {
      let relativeUrl = "";
      relativeUrl =
        configFile.variantBaseUrl +
        filePath.substring(configFile.variantFilePath.length);
      relativeUrl = replaceall("\\", "/", relativeUrl);
      fileArray[index++] = relativeUrl;
    });
    baseController.sendSuccess(res, fileArray, null);
  };
  processUrl();
}

async function getCmdToconvertExcelToPDF(sopFileName, outputFolder) {
  var commandStr = `${configFile.pythonCmd} ${configFile.pythonScriptPath} "${sopFileName}" ${outputFolder}`;
  return commandStr;
}

async function processSOPFile(
  savedVariant,
  sopFileName,
  variant,
  res,
  fromUpdate
) {
  let outputFolder = `${configFile.instructionsPath}\\sop\\${variant.code}\\`;
  let commandStr = await getCmdToconvertExcelToPDF(sopFileName, outputFolder);
  
  console.log("Convert Excel to PDF > " + commandStr);
  
  var exec = require("child_process").exec;
  await exec(commandStr, async function(error, stdout, stderr) {
    if (error || stderr) {
      logger.error("Unable to convert excel to PDF: ", error);
      baseController.sendFailure(
        res,
        null,
        "Unable to convert SOP to PDF files"
      );
    } else {
		console.log(stdout);
      processFileMap = JSON.parse(stdout);
	  console.log(processFileMap);
	  console.log(fromUpdate);
      if (fromUpdate) {
        //In case of update delete the existing SOP files
        instructionService.deleteByVariantId(variant.id);
		
      }
	 
      for (value in processFileMap) {
		   console.log(value);
        let instructionObj = {};
        instructionObj["instructionType"] = "SOP";
        instructionObj["fileLocation"] = processFileMap[value];
        instructionObj["variantId"] = savedVariant.id;
        let processId = await processService.getProcessByName(value);
        if (processId != null && processId.length > 0) {
          //If process exists attach the SOP file
          instructionObj["processId"] = processId[0].dataValues.id;
          instructionService.create(instructionObj);
        }
      }
	  console.log("before success");
      baseController.sendSuccess(res, savedVariant, null);
    }
  });
}

async function createVariantDetails(variant, imagePathArry, sopFileName, res) {
  let existVarCode = await variantService.getVarianttByVarCode(variant.code);
  if (existVarCode.length == 0) {
    variant["imagePath"] = imagePathArry;
    let billOfMaterialId = await saveBillOfMaterial(variant.billOfMaterialId);
    variant["billOfMaterialId"] = billOfMaterialId.id;
    let savedVariant = await savevariant(variant);
    if (sopFileName !== "") {
      processSOPFile(savedVariant, sopFileName, variant, res, false);
    } else {
      baseController.sendSuccess(res, savedVariant, null);
    }
  } else {
    baseController.sendFailure(res, null, "Variant Code already exists");
  }
}

async function updateVariantDetails(variant, imagePathArry, sopFileName, res) {
  let existVarCode = await variantService.getVarianttByVarCodeAndId(
    variant.code,
    variant.id
  );
  if (existVarCode.length == 0) {
    if (imagePathArry !== undefined && imagePathArry != "") {
      variant["imagePath"] = imagePathArry;
    }
    await saveBillOfMaterial(
      variant.billOfMaterialId,
      variant.existingBillOfMaterialId
    );
    variant["billOfMaterialId"] = variant.existingBillOfMaterialId;
    let savedVariant = await savevariant(variant);
    if (sopFileName !== "") {
      processSOPFile(savedVariant, sopFileName, variant, res, true);
    } else {
      baseController.sendSuccess(res, savedVariant, null);
    }
  } else {
    baseController.sendFailure(res, null, "Variant Code already exists");
  }
}

async function savevariant(variant) {
  let result;
  if (variant.id != undefined && variant.id != "") {
    result = await variantService.update(variant);
  } else {
    result = await variantService.create(variant);
  }
  return result;
}

async function saveBillOfMaterial(billOfMaterialList, bomId) {
  let result;
  let parsedList = JSON.parse(billOfMaterialList);
  let billOfMaterialObj = {
    componentId: parsedList
  };
  if (bomId != undefined && bomId != "") {
    billOfMaterialObj["id"] = bomId;
    result = await billOfMaterialService.update(billOfMaterialObj);
  } else {
    result = await billOfMaterialService.create(billOfMaterialObj);
  }
  return result;
}


// Variant and Component master Bulk Upload
exports.uploadVarCompMaster = async function(req, res) {
   res.connection.setTimeout(900000);
  try {
    logger.debug("Executing uploadVarCompMaster method in variant controller");
    await processReqSaveMasterUpload(req, res);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

async function processReqSaveMasterUpload(req, res) {
  let masterFileName = "";
  let hasMasterFilePart = false;
  var form = new multiparty.Form();

  form.on("part", function(part) {
    if (part.filename) {
        hasMasterFilePart = true;
        let dir = `${configFile.variantFilePath}\\master_upload`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        // Append datetimestamp to the filename
        const ext = part.filename.substring(part.filename.lastIndexOf('.'));
        const baseName = part.filename.substring(0, part.filename.lastIndexOf('.'));
        const timestamp = Date.now();
        let filePath = `${dir}\\${baseName}_${timestamp}${ext}`;
        part
          .pipe(fs.createWriteStream(filePath))
          .on("finish", async function() {
            // process the saved master excel file
            logger.debug("Master Upload file saved at: ", filePath);
            res.setTimeout(15 * 60 * 1000);
            result = await convertToJSON(filePath);
            baseController.sendSuccess(res, result, "Master Upload successfull!");
          });
        masterFileName = filePath;
    }
  });

  form.on("close", async function() {
    //When there is no SOP trigger create logic in close
    logger.debug(
      "File Stream closed in uplodaVarCompMaster after saving successfully"
    );
  });

  form.on("error", function(err) {
    baseController.sendFailure(
      res,
      err,
      "Unable to parse the file in uplodaVarCompMaster"
    );
  });

  form.parse(req);
}