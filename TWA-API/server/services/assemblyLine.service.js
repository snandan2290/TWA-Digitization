var assemblyLineModel = require("../models").assemblyLine;
var locationModel = require("../models").location;

exports.create = async function(assemblyLine) {
  let _newAssemblyLine = await assemblyLineModel.create(assemblyLine);
  return _newAssemblyLine;
};

exports.update = async function(assemblyLine) {
  await assemblyLineModel.update(assemblyLine, {
    where: { id: assemblyLine.id }
  });
  return assemblyLine;
};

exports.updateByLocationId = async function(assemblyLine) {
  await assemblyLineModel.update(assemblyLine, {
    where: { locationId: assemblyLine.locationId }
  });
  return assemblyLine;
};

exports.getById = async function(id) {
  let _assemblyLine = await assemblyLineModel.findByPk(id);
  return _assemblyLine;
};

exports.getByCode = async function(assemblyCode, locationId) {
  let _assemblyLine = await assemblyLineModel.findAll({
    where: { isActive: true, code: assemblyCode, locationId: locationId },
    order: [["id", "ASC"]],
    attributes: ["id"]
  });
  return _assemblyLine;
};

exports.getAssemblyLines = async function() {
  let _assemblyLine = await assemblyLineModel.findAll({
    where: { isActive: true },
    order: [["id", "ASC"]],
    include: [
      {
        model: locationModel,
        as: "location"
      }
    ],
    attributes: ["id", "code", "name"]
  });
  return _assemblyLine;
};

exports.getAssemblyLinesByLocation = async function(locationId) {
  let _assemblyLine = await assemblyLineModel.findAll({
    where: {
      isActive: true,
      locationId: locationId
    },
    order: [["id", "ASC"]],
    attributes: ["id", "code", "name"]
  });
  return _assemblyLine;
};
