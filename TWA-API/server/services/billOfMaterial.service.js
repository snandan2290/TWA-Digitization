var billOfMaterialModel = require("../models").billOfMaterial;
var componentModel = require("../models").component;

exports.create = async function(billOfMaterial) {
  let _newBillOfMaterial = await billOfMaterialModel.create(billOfMaterial);
  return _newBillOfMaterial;
};

exports.update = async function(billOfMaterial) {
  await billOfMaterialModel.update(billOfMaterial, {
    where: { id: billOfMaterial.id }
  });
  return billOfMaterial;
};

exports.getById = async function(id) {
  let _billOfMaterial = await billOfMaterialModel.findByPk(id);
  return _billOfMaterial;
};

exports.getBillOfMaterials = async function() {
  let _billOfMaterial = await billOfMaterialModel.findAll({
    order: [["id", "ASC"]],
    attributes: ["id", "componentId"]
  });
  return _billOfMaterial;
};

exports.getBillOfMaterialsByVariant = async function(variantId) {
  var strQuery =
    `select c.id, c.code, c.description, c.name, c.uom, c."imagePath" from component c ` +
    `where id in (select unnest("componentId") from "billOfMaterial" ` +
    `where id=(select "billOfMaterialId" from variant where id=${variantId}))`;
  var results = componentModel.sequelize.query(strQuery, {
    model: componentModel
  });

  return results;
};
