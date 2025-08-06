var componentModel = require("../models").component;
var baseService = require("./base.service");
const Op = require("sequelize").Op;
const sequelize = require("sequelize");

exports.create = async function(component) {
  let _newComponent = await componentModel.create(component);
  return _newComponent;
};

exports.update = async function(component) {
  await componentModel.update(component, { where: { id: component.id } });
  return component;
};

exports.getById = async function(id) {
  let _component = await componentModel.findByPk(id);
  return _component;
};

exports.getComponents = async function(page, pageSize, searchParam) {
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
      { uom: { [Op.iLike]: `%${searchParam}%` } },
      { name: { [Op.iLike]: `%${searchParam}%` } },
      sequelize.where(
        sequelize.cast(sequelize.col("component.imagePath"), "varchar"),
        { [Op.iLike]: `%${searchParam}%` }
      )
    ];
  }

  let pageOffset = baseService.getPageoffset(page, pageSize);
  let _component = await componentModel.findAndCountAll({
    where: whereClause,
    order: [["id", "DESC"]],
    limit: pageOffset.limit,
    offset: pageOffset.offset,
    attributes: ["id", "code", "uom", "name", "imagePath"]
  });
  return _component;
};

exports.getAllComponents = async function() {
  let _component = await componentModel.findAll({
    where: { isActive: true },
    order: [["id", "ASC"]],
    attributes: ["id", "code", "uom", "name", "description"]
  });
  return _component;
};

exports.getComponentImageById = async function(componentId) {
  let _component = await componentModel.findAll({
    where: { isActive: true, id: componentId },
    order: [["id", "ASC"]],
    attributes: ["imagePath"]
  });
  return _component;
};

exports.getComponentByCompCode = async function(componentCode) {
  let _component = await componentModel.findAll({
    where: { isActive: true, code: componentCode }
  });
  return _component;
};

exports.getComponentByCompCodeAndId = async function(
  componentCode,
  componentId
) {
  let _component = await componentModel.findAll({
    where: {
      isActive: true,
      code: componentCode,
      id: { [Op.notIn]: [componentId] }
    }
  });
  return _component;
};
