const logger = require("../utils/log4j.config").getLogger();
const baseController = require("./base.controller");
const feedbackTemplateService = require("../services/feedbackTemplate.service");
const multiparty = require("multiparty");

exports.getFeedbackTemplate = async (req,res) => {
  try {
    logger.debug("Executing getFeedbackTemplate method in feedbackTemplate controller");
    const result = await feedbackTemplateService.getFeedbackTemplate(req.params.feedbackId);
    baseController.sendSuccess(res, result, null);
  } catch (error) {
    logger.error("Error in getFeedbackTemplate: ", error);
    baseController.sendFailure(res, error, null);
  }

}

exports.saveFeedbackTemplate = async (req,res) => {
  try {
    logger.debug("Executing saveFeedbackTemplate method in feedbackTemplate controller");
    processRequestAndSaveDetails(req, res);
  } catch (error) {
    logger.error("Error in saveFeedbackTemplate: ", error);
    baseController.sendFailure(res, error, null);
  }
}

async function processRequestAndSaveDetails(req, res) {
  var form = new multiparty.Form();
  let template = {};
  let feedbackTemplate = {}
  let timeStamp = new Date().getTime();

  form.on("field", function (name, val) {
    template[name] = val.replace(/^"(.*)"$/, '$1'); // Sanitize to remove quotes
  });

  form.on("part", function (part) {
    // To-do
  });

  form.on("close", async function () {
    feedbackTemplate["feedbackId"] = req.params.feedbackId; // Assuming feedbackId is passed in the URL
    feedbackTemplate["template"] = template; // Save template as JSON string
    await feedbackTemplateService.update(feedbackTemplate);
    baseController.sendSuccess(res, "FeedbackTemplate Saved Successfully", null);
    logger.debug(
      "File Stream closed in saveFeedbackTemplate method in FeedbackTemplate controller"
    );
  });

  form.on("error", function (err) {
    baseController.sendFailure(
      res,
      err,
      "Unable to parse the file in saveFeedbackTemplate"
    );
  });

  form.parse(req);
}