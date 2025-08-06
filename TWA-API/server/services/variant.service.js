var variantModel = require("../models").variant;
var baseService = require("./base.service");
const Op = require("sequelize").Op;
const sequelize = require("sequelize");

exports.create = async function(variant) {
  let _newVariant = await variantModel.create(variant);
  return _newVariant;
};

exports.update = async function(variant) {
  await variantModel.update(variant, { where: { id: variant.id } });
  return variant;
};

exports.getById = async function(id) {
  let _variant = await variantModel.findByPk(id);
  return _variant;
};

exports.getByCode = async function(variantCode) {
  let _variant = await variantModel.findAll({
    where: { code: variantCode, isActive: true },
    order: [["id", "ASC"]],
    attributes: ["id"]
  });
  return _variant;
};

exports.getVariants = async function(page, pageSize, searchParam) {
  let whereClause = {
    isActive: true
  };

  if (
    searchParam !== undefined &&
    searchParam !== null &&
    searchParam !== "undefined"
  ) {
    whereClause[Op.or] = [
      { code: { [Op.iLike]: `%${searchParam}%` } },
      { description: { [Op.iLike]: `%${searchParam}%` } },
      sequelize.where(
        sequelize.cast(sequelize.col("variant.imagePath"), "varchar"),
        { [Op.iLike]: `%${searchParam}%` }
      )
    ];
  }

  let pageOffset = baseService.getPageoffset(page, pageSize);
  let _variant = await variantModel.findAndCountAll({
    where: whereClause,
    order: [["id", "DESC"]],
    limit: pageOffset.limit,
    offset: pageOffset.offset,
    attributes: [
      "id",
      "code",
      "name",
      "description",
      "imagePath",
      "billOfMaterialId",
      "sopFile"
    ]
  });
  return _variant;
};

exports.getAllVariants = async function(page, pageSize) {
  let _variant = await variantModel.findAll({
    where: { isActive: true },
    order: [["id", "ASC"]],
    attributes: ["id", "code", "name", "description", "imagePath"]
  });
  return _variant;
};

exports.getVariantImageById = async function(variantId) {
  let _variant = await variantModel.findAll({
    where: { isActive: true, id: variantId },
    order: [["id", "ASC"]],
    attributes: ["imagePath"]
  });
  return _variant;
};

exports.getVarianttByVarCode = async function(variantCode) {
  let _variant = await variantModel.findAll({
    where: { isActive: true, code: variantCode }
  });
  return _variant;
};

exports.getVarianttByVarCodeAndId = async function(variantCode, variantId) {
  let _variant = await variantModel.findAll({
    where: {
      isActive: true,
      code: variantCode,
      id: { [Op.notIn]: [variantId] }
    }
  });
  return _variant;
};

exports.getSOPFileByVariantId = async function(varinatId) {
  let _variant = await variantModel.findAll({
    where: {
      isActive: true,
      id: varinatId
    },
    order: [["id", "ASC"]],
    attributes: ["sopFile"]
  });
  return _variant;
};
