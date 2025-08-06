var deviceModel = require("../models").device;
var assemblyLineModel = require("../models").assemblyLine;
var locationModel = require("../models").location;
var processModel = require("../models").process;

exports.create = async function(device) {
  delete device.id; // Ensure id is not set for new devic
  let _newDevice = await deviceModel.create(device);
  return _newDevice;
};

exports.update = async function(device) {
  await deviceModel.update(device, { where: { id: device.id } });
  return device;
};

exports.getById = async function(id) {
  let _device = await deviceModel.findByPk(id);
  return _device;
};

exports.getByUuid = async function(uuid) {
  let _device = await deviceModel.findAll({
    where: { isActive: true, uuid: uuid },
    order: [["id", "ASC"]],
    include: [
      {
        model: processModel,
        as: "process"
      },
      {
        model: assemblyLineModel,
        as: "assemblyLine",
        include: [
          {
            model: locationModel,
            as: "location"
          }
        ]
      }
    ],
    attributes: ["id", "uuid", "name"]
  });
  return _device;
};

exports.getDevices = async function() {
  let _device = await deviceModel.findAll({
    where: { isActive: true },
    order: [["id", "ASC"]],
    include: [
      {
        model: processModel,
        as: "process"
      },
      {
        model: assemblyLineModel,
        as: "assemblyLine"
      }
    ],
    attributes: ["id", "uuid", "name"]
  });
  return _device;
};

exports.updateByUUID = async function(device) {
  await deviceModel.update(device, { where: { uuid: device.uuid } });
  return device;
};

exports.getDeviceByUuid = async function(uuid) {
  let _device = await deviceModel.findAll({
    where: {uuid: uuid },
    order: [["id", "ASC"]],
    attributes: ["id", "uuid"]
  });
  return _device;
};


exports.getDevicesForAssemblyLine = async function(assemblyLineId) {
  console.log("getDevicesForAssemblyLine:::", assemblyLineId)
  let devices = await deviceModel.findAll({
    where: {
      assemblyLineId: assemblyLineId,
      isActive: true
    },
    order: [["id", "ASC"]],
    attributes: ["id", "uuid", "assemblyLineId", "operator_id", "fcm_token"]
  });
  return devices;
};