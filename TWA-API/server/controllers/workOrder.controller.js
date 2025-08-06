const workOrderService = require("./../services/workOrder.service");
const variantService = require("./../services/variant.service");
const assemblyLineService = require("./../services/assemblyLine.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const excelToJson = require("convert-excel-to-json");
const multiparty = require("multiparty");
const configFile = require("./../config/config.json");
const fs = require("fs");
const replaceall = require("replaceall");
const {sendPushNotification}  = require("./../utils/pushNotification");
const deviceService = require("./../services/device.service");

exports.saveWorkOrderDetails = async function (req, res) {
  try {
    logger.debug(
      "Executing saveWorkOrderDetails method in workOrder controller"
    );
    let result;

    if (req.body.id != undefined && req.body.id != "") {
      let existingWorkOrder = await workOrderService.getExistingWorkOrdersById(
        req.body.name,
        req.body.id
      );
      if (existingWorkOrder.length > 0) {
        baseController.sendFailure(res, null, "Work Order already exists");
      } else {
        result = await workOrderService.update(req.body);
        baseController.sendSuccess(res, result, null);
      }
    } else {
      let existingWorkOrder = await workOrderService.getExistingWorkOrders(
        req.body.name
      );
      if (existingWorkOrder.length > 0) {
        baseController.sendFailure(res, null, "Work Order already exists");
      } else {
        result = await workOrderService.create(req.body);
        baseController.sendSuccess(res, result, null);
      }
    }
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getById = async function (req, res) {
  try {
    logger.debug("Executing getById method in workOrder controller");
    let result = await workOrderService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
exports.getOpenWorkOrders = async function (req, res) {
  try {
    logger.debug("Executing getOpenWorkOrders method in workOrder controller");
    let result = await workOrderService.getOpenWorkOrders();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};


exports.updateWorkOrders = async function (req, res) {
  try {
    logger.debug("Executing updateWorkOrders method in workOrder controller");
    let result = await workOrderService.update(req.body);
    if (result.id == req.body.id){
      // Sending Push Notification - WorkOrder Priority Change
      let workOrder = await workOrderService.getById(req.body.id);
      let devices_fcm_details = await deviceService.getDevicesForAssemblyLine(workOrder.assemblyLineId);
      for (let fcm_token of devices_fcm_details) {
        logger.debug("Sending WorkOrder-Priority Push Notification to device: ", fcm_token.uuid, " of operator: ", fcm_token.operator_id );
        sendPushNotification(fcm_token.fcm_token, "Titan", "WorkOrder Priority", 
          { 
            id: req.body.id,
            priority: req.body.priority,
          }
        );
      }
    }
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getWorkOrdersByAssemblyLine = async function (req, res) {
  try {
    logger.debug(
      "Executing getWorkOrdersByAssemblyLine method in workOrder controller"
    );
    let result = await workOrderService.getWorkOrdersByAssemblyLine(
      req.params.assemblyLineId
    );
    if (result.length === 0) {
      baseController.sendSuccess(res, result, null);
    } else {
      let index = 0;
      const processResultAsync = async () => {
        await asyncForEach(result, async (element) => {
          getFileURL(element).then(function (urlArray) {
            if (element.dataValues.variant != null) {
              element.dataValues.variant.dataValues["filePathURL"] = urlArray;
            }
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

exports.getWorkOrdersByLocation = async function (req, res) {
  try {
    logger.debug(
      "Executing getWorkOrdersByLocation method in workOrder controller"
    );
    let result = await workOrderService.getWorkOrdersByLocation(
      req.params.locationId,
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

exports.markAllWorkOrderAsComplete = async function (req, res) {
  try {
    logger.debug(
      "Executing markAllWorkOrderAsComplete method in workOrder controller"
    );
    let workOrder = { status: "Complete" };
    let updatedRows = await workOrderService.markAllWorkOrderAsComplete(
      workOrder
    );
    baseController.sendSuccess(res, updatedRows, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.uploadWorkOrders = async function (req, res) {
  try {
    var form = new multiparty.Form();
    let filePath = "";
    let locationId = "";
    form.on("field", function (name, val) {
      if (name === "locationId") {
        locationId = val;
      }
    });
    form.on("part", function (part) {
      if (part.filename) {
        let dir = `${configFile.workOrdersUpload}`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        filePath = `${dir}\\${Date.now()}_${part.filename}`;
        part.pipe(
          fs.createWriteStream(filePath).on("finish", async function () {
            if (filePath != "") {
              const result = await excelToJson({
                sourceFile: filePath,
                header: {
                  // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
                  rows: 2,
                },
                sheets: [
                  {
                    name: "pendingset",
                    columnToKey: {
                      A: "orderName",
                      B: "variantName",
                      E: "quantity",
                      G: "assemblyName",
                    },
                  },
                ],
              });

              for (var item in result) {
                processExcelData(result[item], res, locationId);
              }
            }
          })
        );
      }
    });

    form.on("close", function (err) {
      logger.debug(
        "File Stream closed in Upload work Order in workOrder controller"
      );
    });

    form.on("error", function (err) {
      baseController.sendFailure(
        res,
        err,
        "Please select a valid file to upload"
      );
    });

    form.parse(req);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

async function processExcelData(data, res, locationId) {
  let addedCount = 0;
  let rejectCount = 0;
  let processedRows = 0;
  let totalQuanitity = 0;

  data.forEach(async function (table) {
    if (
      table.orderName != undefined &&
      table.quantity != undefined &&
      table.variantName != undefined &&
      table.assemblyName != undefined
    ) {
      let variantId = await variantService.getByCode(table.variantName);
      //Upload workorders to Supervisor's Location Assembly Lines
      let assemblyLineId = await assemblyLineService.getByCode(
        table.assemblyName,
        locationId
      );
      let workOrder = {
        name: table.orderName,
        assignedTime: Date.now(),
        quantity: table.quantity,
        status: "InProgress",
      };
      if (assemblyLineId.length > 0 && variantId.length > 0) {
        workOrder["variantId"] = variantId[0].id;
        workOrder["assemblyLineId"] = assemblyLineId[0].id;
        //If Assembly Line and Variant ID exists then create the record else discard
        let existingWorkOrder = await workOrderService.getExistingWorkOrders(
          workOrder.name
        );
        if (existingWorkOrder.length > 0) {
          await workOrderService.updateByWorkorderName(workOrder);
        } else {
          await workOrderService.create(workOrder);
        }
        totalQuanitity = totalQuanitity + table.quantity;
        addedCount++;
      } else {
        rejectCount++;
      }
    }
    processedRows++;
    if (data.length === processedRows) {
      let data = {};
      data["Added"] = addedCount;
      data["Rejected"] = rejectCount;
      data["TotalQuantity"] = totalQuanitity;
      baseController.sendSuccess(res, data, null);
    }
  });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function getFileURL(data) {
  let fileArray = [];
  let index = 0;

  const processUrl = async () => {
    if (
      data.dataValues.variant != null &&
      data.dataValues.variant.imagePath != null
    ) {
      await asyncForEach(
        data.dataValues.variant.imagePath,
        async (filePath) => {
          let relativeUrl = "";
          relativeUrl =
            configFile.variantBaseUrl +
            filePath.substring(configFile.variantFilePath.length);
          relativeUrl = replaceall("\\", "/", relativeUrl);
          fileArray[index++] = relativeUrl;
        }
      );
    }
    return fileArray;
  };
  return processUrl();
}