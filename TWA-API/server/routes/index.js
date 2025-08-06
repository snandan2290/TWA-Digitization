const userController = require("../controllers/user.controller");
const locationController = require("../controllers/location.controller");
const processController = require("../controllers/process.controller");
const assemblyLineController = require("../controllers/assemblyLine.controller");
const deviceController = require("../controllers/device.controller");
const authController = require("../controllers/auth.controller");
const componentController = require("../controllers/component.controller");
const billOfMaterialController = require("../controllers/billOfMaterial.controller");
const variantController = require("../controllers/variant.controller");
const instructionController = require("../controllers/instruction.controller");
const workOrderController = require("../controllers/workOrder.controller");
const feedbackController = require("../controllers/feedback.controller");
const feedbackDashBoardRoutes = require('./feedbackDashBoard.routes');
const feedbackTemplateRoutes = require('./feedbackTemplate.routes');

module.exports = (app) => {
  app.get("/api", (req, res) =>
    res.status(200).send({
      message:
        "Titan Watch Assembly Digitiization APIs are up and running!!!. Please reach out to Admin",
    })
  );

  app.post("/api/saveUserDetails", userController.saveUserDetails);
  app.get("/api/getUserById/:id", userController.getById);
  app.post("/api/resetPassword", userController.resetPassword);
  app.get(
    "/api/getUserListByLocation/:locationId",
    userController.getUserListByLocation
  );
  app.get(
    "/api/getAllUserListByPagination/:page/:pageSize/:searchParam",
    userController.getAllUserListByPagination
  );

  app.post("/api/saveLocationDetails", locationController.saveLocationDetails);
  app.get("/api/getLocationById/:id", locationController.getById);
  app.post("/api/deleteLocation", locationController.deleteLocation);
  app.get(
    "/api/getAllLocations/:page/:pageSize/:searchParam",
    locationController.getAllLocations
  );
  app.get("/api/getDeviceMasterData", locationController.getDeviceMasterData);
  app.get("/api/getLocationList", locationController.getLocationList);

  app.post("/api/saveProcessDetails", processController.saveProcessDetails);
  app.post("/api/deleteProcessDetails", processController.deleteProcessDetails);
  app.get("/api/getProcessById/:id", processController.getById);
  app.get(
    "/api/getAllProcesses/:page/:pageSize/:searchParam",
    processController.findAllProcess
  );
  app.get("/api/getAllProcessesList", processController.getAllProcessesList);

  app.post("/api/createAssemblyLine", assemblyLineController.create);
  app.get("/api/getAssemblyLineById/:id", assemblyLineController.getById);
  app.get("/api/getAssemblyLines", assemblyLineController.getAssemblyLines);
  app.get(
    "/api/getAssemblyLinesByLocation/:locationId",
    assemblyLineController.getAssemblyLinesByLocation
  );

  app.post("/api/saveDeviceDetails", deviceController.saveDeviceDetails);
  app.get("/api/getDeviceById/:id", deviceController.getById);
  app.post("/api/getDeviceByUUID", deviceController.getByUuid);
  app.get("/api/getDevices", deviceController.getDevices);

  app.post(
    "/api/saveComponentDetails",
    componentController.saveComponentDetails
  );
  app.get("/api/getComponentById/:id", componentController.getById);
  app.get("/api/getAllComponents", componentController.getAllComponents);
  app.get(
    "/api/getComponentImageById/:componentId",
    componentController.getComponentImageById
  );
  app.get(
    "/api/getComponents/:page/:pageSize/:searchParam",
    componentController.getComponents
  );
  app.post("/api/deleteComponent", componentController.deleteComponent);

  app.post(
    "/api/saveBillOfMaterialDetails",
    billOfMaterialController.saveBillOfMaterialDetails
  );
  app.get("/api/getBillOfMaterialById/:id", billOfMaterialController.getById);
  app.get(
    "/api/getBillOfMaterial",
    billOfMaterialController.getBillOfMaterials
  );
  app.get(
    "/api/getBOMByVariant/:variantId",
    billOfMaterialController.getBillOfMaterialsByVariant
  );
  app.post("/api/saveVariantDetails", variantController.saveVariantDetails);
  app.get("/api/getVariantById/:id", variantController.getById);
  app.get(
    "/api/getVariants/:page/:pageSize/:searchParam",
    variantController.getVariants
  );
  app.get("/api/getAllVariants", variantController.getAllVariants);
  app.post("/api/deleteVariant", variantController.deleteVariant);
  app.get(
    "/api/getSOPFileByVariantId/:variantId",
    variantController.getSOPFileByVariantId
  );
  app.get(
    "/api/getVariantImageById/:variantId",
    variantController.getVariantImageById
  );
  // Bulk upload Variant and Associcated Components (BOM)
  app.post("/api/uploadVarCompMaster", variantController.uploadVarCompMaster); 

  app.post(
    "/api/saveInstructionDetails",
    instructionController.saveInstructionDetails
  );
  app.get("/api/getInstructionById/:id", instructionController.getById);
  app.get(
    "/api/getProcessByVariantId/:variantId",
    instructionController.getProcessByVariantId
  );
  app.get("/api/getInstructions", instructionController.getInstructions);
  app.post("/api/getSOPInstructions", instructionController.getSOPInstructions);
  app.post(
    "/api/getSOPInstructionsByVariantId",
    instructionController.getSOPInstructionsByVariantId
  );
  app.post("/api/getGEInstructions", instructionController.getGEInstructions);

  app.post(
    "/api/saveWorkOrderDetails",
    workOrderController.saveWorkOrderDetails
  );
  app.post("/api/updateWorkOrders", workOrderController.updateWorkOrders);
  app.post("/api/uploadWorkOrders", workOrderController.uploadWorkOrders);
  app.post(
    "/api/markAllWorkOrderAsComplete",
    workOrderController.markAllWorkOrderAsComplete
  );
  app.get("/api/getWorkOrderById/:id", workOrderController.getById);
  app.get("/api/getOpenWorkOrders", workOrderController.getOpenWorkOrders);
  app.get(
    "/api/getWorkOrdersByAssemblyLine/:assemblyLineId",
    workOrderController.getWorkOrdersByAssemblyLine
  );
  app.get(
    "/api/getWorkOrdersByLocation/:locationId/:page/:pageSize/:searchParam",
    workOrderController.getWorkOrdersByLocation
  );

  app.post("/api/saveFeedbackDetails", feedbackController.saveFeedbackDetails);
  app.post("/api/addFeedbackDetails", feedbackController.addFeedbackDetails);
  app.post("/api/resolveFeedback", feedbackController.resolveFeedback);
  app.post("/api/escalateFeedback", feedbackController.escalateFeedback);
  app.get("/api/getFeedbackById/:id", feedbackController.getById);
  app.get("/api/getCategoryList", feedbackController.getCategoryList);
  app.get(
    "/api/getFeedbacksByLocation/:locationId/:page/:pageSize/:searchParam",
    feedbackController.getFeedbacksByLocation
  );

  app.post("/api/login", authController.userLogin);
  app.post("/api/logout", authController.logout);

  // Feedback Dashboadr
  app.use("/api", feedbackDashBoardRoutes);

  // Feedback Template
  app.use("/api", feedbackTemplateRoutes);
};
