const sequelize = require("sequelize");
const feedbackTemplateModel = require("../models").feedbackTemplate;
const db = require('../models');
const logger = require("../utils/log4j.config").getLogger();

exports.getFeedbackTemplate = async (feedbackId) => {
    let result = await feedbackTemplateModel.findOne({ 
        where: { feedbackId: feedbackId },
        attributes: ['id', 'feedbackId', 'template']
    })
    logger.debug("feedback Template JSON::", result);
    if (!result) {
        throw new Error("Feedback template not found for the given feedback ID", feedbackId);
    }
    return result
}

exports.update = async (feedbackTemplate) => {
     await feedbackTemplateModel.update(feedbackTemplate, { 
        where: { feedbackId: feedbackTemplate.feedbackId },
    })
    return feedbackTemplate
}


