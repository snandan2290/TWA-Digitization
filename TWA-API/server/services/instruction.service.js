var instructionModel = require("../models").instruction;
var processModel = require("../models").process;

exports.create = async function(instruction) {
  let _newInstruction = await instructionModel.create(instruction);
  return _newInstruction;
};

exports.update = async function(instruction) {
  await instructionModel.update(instruction, { where: { id: instruction.id } });
  return instruction;
};

exports.updateByProcessVariantId = async function(instruction) {
  let result = await instructionModel.update(instruction, {
    where: {
      variantId: instruction.variantId,
      processId: instruction.processId
    }
  });
  return result;
};

exports.deleteByVariantId = async function(variantId) {
  let result = await instructionModel.destroy({
    where: {
      variantId: variantId
    }
  });
  return result;
};

exports.updateByProcessId = async function(instruction) {
  await instructionModel.update(instruction, {
    where: { processId: instruction.processId, instructionType: "GE" }
  });
  return instruction;
};

exports.getById = async function(id) {
  let _instruction = await instructionModel.findByPk(id);
  return _instruction;
};

exports.getInstructions = async function() {
  let _instruction = await instructionModel.findAll({
    order: [["id", "ASC"]],
    attributes: ["fileLocation", "instructionType"]
  });
  return _instruction;
};

exports.getSOPInstructions = async function(processId, variantId) {
  let _instruction = await instructionModel.findAll({
    where: {
      variantId: variantId,
      processId: processId,
      instructionType: "SOP"
    },
    order: [["id", "ASC"]],
    attributes: ["fileLocation", "instructionType"]
  });
  return _instruction;
};

exports.getSOPInstructionsByVariantId = async function(variantId) {
  let _instruction = await instructionModel.findAll({
    where: {
      variantId: variantId,
      instructionType: "SOP"
    },
    order: [["id", "ASC"]],
    include: [
      {
        model: processModel,
        as: "process"
      }
    ],
    attributes: ["fileLocation"]
  });
  return _instruction;
};

exports.getProcessByVariantId = async function(variantId) {
  let _instruction = await instructionModel.findAll({
    where: {
      variantId: variantId,
      instructionType: "SOP"
    },
    order: [["id", "ASC"]],
    include: [
      {
        model: processModel,
        as: "process",
        attributes: ["id", "code", "name"]
      }
    ],
    attributes: []
  });
  return _instruction;
};

exports.getInstructionsByVariantId = async function(variantId) {
  let _instruction = await instructionModel.findAll({
    where: {
      variantId: variantId,
      instructionType: "SOP"
    },
    order: [["id", "ASC"]],
    include: [
      {
        model: processModel,
        as: "process"
      }
    ],
    attributes: ["fileLocation", "instructionType"]
  });
  return _instruction;
};

exports.getGEInstructions = async function(processId) {
  let _instruction = await instructionModel.findAll({
    where: {
      processId: processId,
      instructionType: "GE"
    },
    order: [["id", "ASC"]],
    attributes: ["fileLocation", "instructionType"]
  });
  return _instruction;
};
