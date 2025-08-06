var locationModel = require("../models").location;
var assemblyLineModel = require("../models").assemblyLine;
var baseService = require("./base.service");
const Op = require("sequelize").Op;
const sequelize = require("sequelize");

exports.create = async function(location) {
  let _newLocation = await locationModel.create(location);
  return _newLocation;
};

exports.update = async function(location) {
  await locationModel.update(location, { where: { id: location.id } });
  return location;
};
exports.getById = async function(id) {
  let _location = await locationModel.findByPk(id);
  return _location;
};
exports.getLocations = async function(page, pageSize, searchParam) {
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
      { name: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  let pageOffset = baseService.getPageoffset(page, pageSize);
  let _location = await locationModel.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: assemblyLineModel,
        as: "assemblyLine",
        where: { isActive: true },
        required: false,
        attributes: ["id", "code", "name"]
      }
    ],
    limit: pageOffset.limit,
    offset: pageOffset.offset,
    distinct: true,
    order: [["id", "DESC"], [assemblyLineModel, "id", "ASC"]],
    attributes: ["id", "code", "name"]
  });
  return _location;
};

exports.getAllLocations = async function() {
  let _location = await locationModel.findAll({
    where: { isActive: true },
    order: [["id", "ASC"]],
    attributes: ["id", "code", "name"]
  });
  return _location;
};
