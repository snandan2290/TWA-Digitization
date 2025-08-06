var processModel = require("../models").process;
var baseService = require("./base.service");
var instructionModel = require("../models").instruction;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");

exports.create = async function(process) {
  let _newProcess = await processModel.create(process);
  return _newProcess;
};

exports.update = async function(process) {
  await processModel.update(process, { where: { id: process.id } });
  return process;
};

exports.getById = async function(id) {
  let _process = await processModel.findByPk(id);
  return _process;
};
exports.findAllProcess = async function(page, pageSize, searchParam) {
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
  let _process = await processModel.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: instructionModel,
        as: "instruction",
        where: { instructionType: "GE" },
        attributes: ["id", "fileLocation"]
      }
    ],
    order: [["id", "DESC"]],
    limit: pageOffset.limit,
    offset: pageOffset.offset,
    attributes: ["id", "code", "name"]
  });
  return _process;
};

exports.getAllProcessesList = async function() {
  let _process = await processModel.findAll({
    where: { isActive: true },
    order: [["id", "ASC"]],
    attributes: ["id", "code", "name"]
  });
  return _process;
};

exports.getProcessByCode = async function(processCode) {
  let _process = await processModel.findAll({
    where: { isActive: true, code: processCode }
  });
  return _process;
};

exports.getProcessByName = async function(processName) {
  let whereClause = {
    isActive: true,
    [Op.and]: [
      Sequelize.where(Sequelize.fn("lower", Sequelize.col("process.name")), {
        [Op.iLike]: processName
      })
    ]
  };
  let _process = await processModel.findAll({
    where: whereClause,
    attributes: ["id"]
  });
  return _process;
};

exports.getProcessByCodeAndId = async function(processCode, processId) {
  let _process = await processModel.findAll({
    where: {
      isActive: true,
      code: processCode,
      id: { [Op.notIn]: [processId] }
    }
  });
  return _process;
};
