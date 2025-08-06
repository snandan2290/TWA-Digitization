var feedbackModel = require("../models").feedback;
var processModel = require("../models").process;
var userModel = require("../models").user;
var assemblyLineModel = require("../models").assemblyLine;
var baseService = require("./base.service");
const Op = require("sequelize").Op;
const sequelize = require("sequelize");
const db = require('../models');
const logger = require("../utils/log4j.config").getLogger("feedback.service");
const feedbackTemplateService = require("./feedbackTemplate.service");

exports.create = async function (feedback) {
  let _newFeedback = await feedbackModel.create(feedback);
  return _newFeedback;
};

exports.update = async function (feedback) {
  await feedbackModel.update(feedback, { where: { id: feedback.id } });
  return feedback;
};

exports.getById = async function (id) {
  let _feedback = await feedbackModel.findByPk(id);
  return _feedback;
};

exports.getCategoryList = async function () {
  let categoryList = await feedbackModel.rawAttributes.category.values;
  return categoryList;
};

exports.getFeedbacksByLocation = async function (
  locationId,
  page,
  pageSize,
  searchParam,
  options
) {
  let whereClause = {
    isActive: true,
    // isResolved: false  // As per customer request displaying all feedback with status
  };

  if (options.operator_id !== "undefined") {
    whereClause["operatorId"] = options.operator_id;
  }
  if (options.variant_code !== "undefined") {
    whereClause["variant_code"] = options.variant_code;
  }
  if (options.workorder_no !== "undefined") {
    whereClause["workorder_no"] = options.workorder_no;
  }
  if(options.id !== "undefined") {
    whereClause["id"] = options.id;
  }

  if (
    searchParam !== undefined &&
    searchParam !== null &&
    searchParam !== "undefined"
  ) {
    whereClause[Op.or] = [
      sequelize.where(sequelize.col("user.username"), {
        [Op.iLike]: `%${searchParam}%`
      }),
      sequelize.where(sequelize.col("assemblyLine.code"), {
        [Op.iLike]: `%${searchParam}%`
      }),
      sequelize.where(sequelize.col("process.name"), {
        [Op.iLike]: `%${searchParam}%`
      }),
      sequelize.where(
        sequelize.cast(sequelize.col("feedback.createdAt"), "varchar"),
        { [Op.iLike]: `%${searchParam}%` }
      ),
      sequelize.where(
        sequelize.cast(sequelize.col("feedback.variant_code"), "varchar"),
        { [Op.iLike]: `%${searchParam}%` }
      ),
      sequelize.where(
        sequelize.cast(sequelize.col("feedback.workorder_no"), "varchar"),
        { [Op.iLike]: `%${searchParam}%` }
      )
    ];
  }

  logger.debug("Feedbacks filetr:", whereClause);

  let pageOffset = baseService.getPageoffset(page, pageSize);
  let _feedback = await feedbackModel.findAndCountAll({
    where: whereClause,
    order: [["id", "DESC"]],
    limit: pageOffset.limit,
    offset: pageOffset.offset,
    include: [
      {
        model: processModel,
        as: "process",
        attributes: ["name", "code", "id"]
      },
      {
        model: userModel,
        as: "user",
        where: { locationId: locationId, isActive: true },
        attributes: ["username", "id"]
      },
      {
        model: assemblyLineModel,
        as: "assemblyLine",
        attributes: ["name", "code", "id"]
      }
    ],
    attributes: [
      "isResolved",
      "isEscalated",
      "category",
      "voiceFeedback",
      "textFeedback",
      "createdAt",
      "id",
      "imagePath",
      [sequelize.fn("COALESCE", sequelize.col("variant_code"), ""), "variant_code"],
      [sequelize.fn("COALESCE", sequelize.col("workorder_no"), ""), "workorder_no"],
      [
        sequelize.literal(
          `CASE 
            WHEN "isResolved" = true AND "isEscalated" = false THEN 'Resolved'
            WHEN "isResolved" = false AND "isEscalated" = true THEN 'Escalated'
            ELSE 'Pending'
          END`
        ),
        "Status"
      ],
      "isNew"
    ]
  });
  return _feedback;
};

exports.getFeedbackOperator = async function (id) {
  const result = await db.sequelize.query(
    `
    SELECT  d.fcm_token AS fcm_token, 
    d.uuid AS device_uuid,
    d.operator_id AS operator_id
    FROM feedback f
    INNER JOIN device d ON f."operatorId" = d."operator_id"
    WHERE f.id = :id
    `,
    {
      replacements: { id: id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
  return result;
};

exports.getFeedbackTemplate = async function (feedbackId) {
   let template = await feedbackTemplateService.getFeedbackTemplate(feedbackId);
  return template.dataValues.template;
};