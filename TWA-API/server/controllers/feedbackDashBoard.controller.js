const logger = require("../utils/log4j.config").getLogger();
const baseController = require("./base.controller");
const feedbackDashBoardService = require("./../services/feedbackDashBoard.service");

exports.getFeedbackSummary = async (req,res) => {
    try {
        logger.debug("Executing getFeedbackSummary method in feedbackDashBoard controller");
        const params = req.query;
        const result = await feedbackDashBoardService.getFeedbackSummary(params);
        baseController.sendSuccess(res, result, null);
    } catch (error) {
        logger.error("Error in getFeedbackSummary: ", error);
        baseController.sendFailure(res, error, null);
    }

}

exports.getFeedbackCategorySummary = async (req,res) => {
    try {
        logger.debug("Executing getFeedbackCategorySummary method in feedbackDashBoard controller");
        const params = req.query;
        const result = await feedbackDashBoardService.getFeedbackCategorySummary(params);
        baseController.sendSuccess(res, result, null);
    } catch (error) {
        logger.error("Error in getFeedbackCategorySummary: ", error);
        baseController.sendFailure(res, error, null);
    }

}

exports.getFeedbackLineSummary = async (req,res) => {
    try {
        logger.debug("Executing getFeedbackLineSummary method in feedbackDashBoard controller");
        const params = req.query;
        const result = await feedbackDashBoardService.getFeedbackLineSummary(params);
        baseController.sendSuccess(res, result, null);
    } catch (error) {
        logger.error("Error in getFeedbackLineSummary: ", error);
        baseController.sendFailure(res, error, null);
    }

}

exports.getFeedbackSeveritySummary = async (req,res) => {
    try {
        logger.debug("Executing getFeedbackSeveritySummary method in feedbackDashBoard controller");
        const params = req.query;
        const result = await feedbackDashBoardService.getFeedbackSeveritySummary(params);
        baseController.sendSuccess(res, result, null);
    } catch (error) {
        logger.error("Error in getFeedbackSeveritySummary: ", error);
        baseController.sendFailure(res, error, null);
    }

}

exports.getFeedbackComponenetSummary = async (req,res) => {
    try {
        logger.debug("Executing getFeedbackLineSummary method in feedbackDashBoard controller");
        const params = req.query;
        const result = await feedbackDashBoardService.getFeedbackComponentSummary(params);
        baseController.sendSuccess(res, result, null);
    } catch (error) {
        logger.error("Error in getFeedbackLineSummary: ", error);
        baseController.sendFailure(res, error, null);
    }

}


