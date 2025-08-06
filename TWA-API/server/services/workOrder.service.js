var workOrderModel = require("../models").workOrder;
var variantModel = require("../models").variant;
var assemblyLineModel = require("../models").assemblyLine;
var baseService = require("./base.service");
const Op = require("sequelize").Op;
const sequelize = require("sequelize");

exports.create = async function (workOrder) {
  let _newWorkOrder = await workOrderModel.create(workOrder);
  return _newWorkOrder;
};

exports.bulkCreate = async function (workOrdersArray) {
  let result = await workOrderModel.bulkCreate(workOrdersArray);
  return result;
};

exports.update = async function (workOrder) {
  await workOrderModel.update(workOrder, { where: { id: workOrder.id } });
  return workOrder;
};

exports.updateByWorkorderName = async function (workOrder) {
  await workOrderModel.update(workOrder, {
    where: { isActive: true, status: "InProgress", name: workOrder.name },
  });
  return workOrder;
};

exports.getById = async function (id) {
  let _workOrder = await workOrderModel.findByPk(id);
  return _workOrder;
};

exports.getExistingWorkOrders = async function (workOrderName) {
  let _workOrder = await workOrderModel.findAll({
    where: {
      isActive: true,
      status: "InProgress",
      name: workOrderName.toString(),
    },
    attributes: ["id", "name"],
  });
  return _workOrder;
};

exports.getExistingWorkOrdersById = async function (
  workOrderName,
  workOrderId
) {
  let _workOrder = await workOrderModel.findAll({
    where: {
      isActive: true,
      status: "InProgress",
      name: workOrderName.toString(),
      id: { [Op.notIn]: [workOrderId] },
    },
    attributes: ["id", "name"],
  });
  return _workOrder;
};

exports.getOpenWorkOrders = async function () {
  let _workOrder = await workOrderModel.findAll({
    where: { isActive: true, status: "Open" },
    order: [["id", "ASC"]],
    attributes: ["id", "name"],
  });
  return _workOrder;
};

exports.markAllWorkOrderAsComplete = async function (workOrder) {
  let updatedRows = await workOrderModel.update(workOrder, {
    where: { status: "InProgress", isActive: true },
  });
  return updatedRows;
};

exports.getWorkOrdersByAssemblyLine = async function (assemblyLineId) {
  let _workOrder = await workOrderModel.findAll({
    where: {
      isActive: true,
      assemblyLineId: assemblyLineId,
      status: "InProgress",
    },
    order: [["id", "ASC"]],
    include: [
      {
        model: variantModel,
        as: "variant",
      },
      {
        model: assemblyLineModel,
        as: "assemblyLine",
      },
    ],
    attributes: [
      "id",
      "assignedTime",
      "completedTime",
      "deletedTime",
      "status",
      "name",
      "priority",
    ],
  });
  return _workOrder;
};

exports.getWorkOrdersByLocation = async function (
  locationId,
  page,
  pageSize,
  searchParam
) {
  let whereClause = {
    isActive: true,
    status: "InProgress",
  };
  if (
    searchParam !== undefined &&
    searchParam !== null &&
    searchParam !== "undefined"
  ) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      sequelize.where(
        sequelize.cast(sequelize.col("workOrder.quantity"), "varchar"),
        { [Op.iLike]: `%${searchParam}%` }
      ),
      sequelize.where(sequelize.col("variant.code"), {
        [Op.iLike]: `%${searchParam}%`,
      }),
      sequelize.where(sequelize.col("variant.description"), {
        [Op.iLike]: `%${searchParam}%`,
      }),
      sequelize.where(sequelize.col("assemblyLine.code"), {
        [Op.iLike]: `%${searchParam}%`,
      }),
      sequelize.where(sequelize.col("type"), {
        [Op.iLike]: `%${searchParam}%`,
      }),
      sequelize.where(sequelize.col("cluster"), {
        [Op.iLike]: `%${searchParam}%`,
      }),
      sequelize.where(sequelize.col("UCP"), {
        [Op.iLike]: `%${searchParam}%`,
      }),
    ];
  }
  let pageOffset = baseService.getPageoffset(page, pageSize);
  let _workOrder = await workOrderModel.findAndCountAll({
    where: whereClause,
    order: [["id", "DESC"]],
    limit: pageOffset.limit,
    offset: pageOffset.offset,
    include: [
      {
        model: variantModel,
        as: "variant",
      },
      {
        model: assemblyLineModel,
        as: "assemblyLine",
        where: {
          locationId: locationId,
        },
      },
    ],
    attributes: [
      "id",
      "name",
      "quantity",
      "assignedTime",
      "completedTime",
      "deletedTime",
      "status",
      "priority",
      [sequelize.fn("COALESCE", sequelize.col("type"), ""), "type"],
      [sequelize.fn("COALESCE", sequelize.col("cluster"), ""), "cluster"],
      [sequelize.fn("COALESCE", sequelize.col("UCP"), ""), "UCP"],
    ],
  });
  return _workOrder;
};
