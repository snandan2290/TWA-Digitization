const userService = require("./../services/user.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();
const jwtConfigFile = require("./../config/jwtConfig.json");

exports.saveUserDetails = async function(req, res) {
  try {
    logger.debug("Executing saveUserDetails method in user controller");
    let result = null;
    if (req.body.id !== undefined && req.body.id !== null) {
      if (
        req.body.uniqueUserId != undefined &&
        (await userService.isEmpCodeExists(req.body.uniqueUserId, req.body.id))
      ) {
        baseController.sendFailure(res, null, "Employee Code already exists");
      } else if (
        req.body.email != "" &&
        req.body.email != undefined &&
        (await userService.isUserEmailExists(req.body.email, req.body.id))
      ) {
        baseController.sendFailure(res, null, "User Email already exists");
      } else {
        result = await userService.update(req.body);
        baseController.sendSuccess(res, result, null);
      }
    } else {
      if (await userService.isEmpCodeExists(req.body.uniqueUserId, null)) {
        baseController.sendFailure(res, null, "Employee Code already exists");
      } else if (
        req.body.email != "" &&
        (await userService.isUserEmailExists(req.body.email, null))
      ) {
        baseController.sendFailure(res, null, "User Email already exists");
      } else {
        //In case of create set default password from config file
        let user = req.body;
        user["password"] = jwtConfigFile.defaultPassword;
        result = await userService.create(user);
        baseController.sendSuccess(res, result, null);
      }
    }
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.resetPassword = async function(req, res) {
  try {
    logger.debug("Executing resetPassword method in user controller");
    let user = req.body;
    user["password"] = jwtConfigFile.defaultPassword;
    let result = await userService.update(user);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getById = async function(req, res) {
  try {
    logger.debug("Executing getById method in user controller");
    let result = await userService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getAllUserListByPagination = async function(req, res) {
  try {
    logger.debug(
      "Executing getAllUserListByPagination method in user controller"
    );
    let result = await userService.getAllUserListByPagination(
      req.params.page,
      req.params.pageSize,
      req.params.searchParam
    );
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getUserListByLocation = async function(req, res) {
  try {
    logger.debug("Executing getUserListByLocation method in user controller");
    let result = await userService.getUserListByLocation(req.params.locationId);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.userLogin = async function(req, res) {
  try {
    logger.debug("Executing userLogin method in user controller");
    let result = await userService.authenticate(
      req.body.username,
      req.body.password
    );
    if (result != null) {
      baseController.sendSuccess(res, null, "Login Successful");
    } else {
      baseController.sendFailure(res, null, "Authentication Failed");
    }
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};
