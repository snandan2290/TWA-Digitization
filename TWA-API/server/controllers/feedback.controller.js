const feedbackService = require("./../services/feedback.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const mailUtil = require("./../utils/emailUtil");
const emailConfigFile = require("./../config/emailConfig.json");
const fs = require("fs");
const configFile = require("./../config/config.json");
const multiparty = require("multiparty");
const replaceall = require("replaceall");
const {sendPushNotification} = require("./../utils/pushNotification");
const path = require('path');
const {generateFeedbackExcel} = require("./../scripts/feedbackTemplate");

exports.saveFeedbackDetails = async function (req, res) {
  try {
    logger.debug("Executing saveFeedbackDetails method in feedback controller");
    let result;
    if (req.body.id != undefined && req.body.id != "") {
      result = await feedbackService.update(req.body);
    } else {
      result = await feedbackService.create(req.body);
    }
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.addFeedbackDetails = async function (req, res) {
  try {
    logger.debug("Executing addFeedbackDetails method in feedback controller");
    processRequestAndSaveDetails(req, res);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.resolveFeedback = async function (req, res) {
  try {
    logger.debug("Executing resolveFeedback method in feedback controller");
    let result;
    result = await feedbackService.update(req.body);
    // Sending Push Notification - Resolved feedback
    let fcm_details = await feedbackService.getFeedbackOperator(req.body.id);
    for (let fcm_token of fcm_details) {
      logger.debug("Sending Push Notification to device: ", fcm_token.device_uuid, " of operator: ", fcm_token.operator_id );
      sendPushNotification(fcm_token.fcm_token, "Titan", "Feedback Resolved", {id: req.body.id});
    }
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.escalateFeedback = async function (req, res) {
  try {
    logger.debug("Executing escalateFeedback method in feedback controller");
    let result;
    let template;
    let feedbackReport;

    let mailOptions = {
      from: emailConfigFile.emailFrom,
      to: req.body.escalatedTo,
      subject: "Feedback Escalation",
      text: req.body.escalateMessage,
    };
    
    if (req.body.isNew) {

      template = await feedbackService.getFeedbackTemplate(req.body.id);
      feedbackReport = await generateFeedbackExcel(template)

      mailOptions.cc = req.body.escalatedCC
      mailOptions.attachments = [{
        filename: 'Feedback_Report.xlsx',
        path: path.resolve(feedbackReport),
      }];
    }
    
    logger.info("Mail Options: ", mailOptions);
    console.log("Mail Options: ", mailOptions);

    mailUtil.sendMail(mailOptions, async (error, info) => {
      if (error) {
        logger.error("ERROR: ", error);
        baseController.sendFailure(res, error, null);
      } else {
        let feedback=req.body;
        delete feedback.escalatedCC;
        result = await feedbackService.update(feedback);
        baseController.sendSuccess(res, result, null);
      }
    });
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getById = async function (req, res) {
  try {
    logger.debug("Executing getById method in feedback controller");
    let result = await feedbackService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getCategoryList = async function (req, res) {
  try {
    logger.debug("Executing getCategoryList method in feedback controller");
    let result = await feedbackService.getCategoryList();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getFeedbacksByLocation = async function (req, res) {
  try {
    logger.debug(
      "Executing getFeedbacksByLocation method in feedback controller"
    );
    let result = await feedbackService.getFeedbacksByLocation(
      req.params.locationId,
      req.params.page,
      req.params.pageSize,
      req.params.searchParam,
      {
        operator_id: req.query.operator_id || "undefined", 
        variant_code: req.query.variant_code || "undefined", 
        workorder_no: req.query.workorder_no || "undefined",
        id: req.query.id || "undefined" // Supporting client for feedback push search
      }
    );
    if (result.rows.length === 0) {
      baseController.sendSuccess(res, result, null);
    } else {
      let index = 0;
      const processResultAsync = async () => {
        await asyncForEach(result.rows, async (element) => {
          getImageFileURL(element).then(function (urlArray) {
            element.dataValues["filePathURL"] = urlArray;
            element.dataValues["voiceFeedbackURL"] = getAudioFileURL(element);
            index++;
            //Added length check to hold the return of response till the complete Array processing
            if (index === result.rows.length) {
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

function getImageFileURL(data) {
  let fileArray = [];
  let index = 0;

  const processUrl = async () => {
    if (data.dataValues.imagePath != null) {
      await asyncForEach(data.dataValues.imagePath, async (filePath) => {
        let relativeUrl = "";
        relativeUrl =
          configFile.feedbackBaseUrl +
          filePath.substring(configFile.feedbackFilePath.length);
        relativeUrl = replaceall("\\", "/", relativeUrl);
        fileArray[index++] = relativeUrl;
      });
    }
    return fileArray;
  };
  return processUrl();
}

function getAudioFileURL(data) {
  filePath = data.dataValues.voiceFeedback;

  if (filePath !== null && filePath !== "") {
    let audioFileUrl =
      configFile.feedbackBaseUrl +
      filePath.substring(configFile.feedbackFilePath.length);
    audioFileUrl = replaceall("\\", "/", audioFileUrl);

    return audioFileUrl;
  } else {
    return "";
  }
}

async function processRequestAndSaveDetails(req, res) {
  var form = new multiparty.Form();
  let feedback = {};
  let imagePathArry = [];
  let timeStamp = new Date().getTime();

  form.on("field", function (name, val) {
    // feedback[name] = val;
    feedback[name] = val.replace(/^"(.*)"$/, '$1'); // Sanitize to remove quotes
  });

  form.on("part", function (part) {
    if (part.filename) {
      if (part.name.includes("voice")) {
        let dir = `${configFile.feedbackFilePath}\\audio\\${timeStamp}`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        let filePath = `${dir}\\${part.filename}`;
        part.pipe(fs.createWriteStream(filePath));
        feedback["voiceFeedback"] = filePath;
      } else if (part.name.includes("image")) {
        let dir = `${configFile.feedbackFilePath}\\image\\${timeStamp}`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        let filePath = `${dir}\\${part.filename}`;
        part.pipe(fs.createWriteStream(filePath));
        imagePathArry.push(filePath);
      }
    }
  });

  form.on("close", async function () {
    feedback["imagePath"] = imagePathArry;
    let category = feedback["category"];
    feedback["category"] = replaceall('"', "", category);

    await feedbackService.create(feedback);
    baseController.sendSuccess(res, "Feedback Added Successfully", null);
    logger.debug(
      "File Stream closed in addFeedbackDetails method in Feedback controller"
    );
  });

  form.on("error", function (err) {
    baseController.sendFailure(
      res,
      err,
      "Unable to parse the file in addFeedbackDetails"
    );
  });

  form.parse(req);
}



