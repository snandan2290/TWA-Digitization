const locationService = require("./../services/location.service");
const processService = require("./../services/process.service");
const assemblyLineService = require("./../services/assemblyLine.service");
const baseController = require("./base.controller");
const logger = require("./../utils/log4j.config").getLogger();

exports.saveLocationDetails = async function(req, res) {
  try {
    logger.debug("Executing saveLocationDetails method in location controller");
    saveLocaAndALDetails(req, res);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.deleteLocation = async function(req, res) {
  try {
    logger.debug("Executing deleteLocation method in location controller");
    deleteLocAndALDetails(req, res);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getById = async function(req, res) {
  try {
    logger.debug("Executing getById method in location controller");
    let result = await locationService.getById(req.params.id);
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getAllLocations = async function(req, res) {
  try {
    logger.debug("Executing getAllLocations method in location controller");
    let result = await locationService.getLocations(
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

exports.getLocationList = async function(req, res) {
  try {
    logger.debug("Executing getLocationList method in location controller");
    let result = await locationService.getAllLocations();
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

exports.getDeviceMasterData = async function(req, res) {
  try {
    logger.debug("Executing getDeviceMasterData method in location controller");
    let locationList = await locationService.getAllLocations();
    let processList = await processService.getAllProcessesList();
    let result = {
      locations: locationList,
      processes: processList
    };
    baseController.sendSuccess(res, result, null);
  } catch (exception) {
    logger.error("ERROR: ", exception);
    baseController.sendFailure(res, exception, null);
  }
};

async function deleteLocAndALDetails(req, res) {
  let assemblyLine = {
    locationId: req.body.id,
    isActive: false
  };
  await assemblyLineService.updateByLocationId(assemblyLine);
  result = await locationService.update(req.body);
  baseController.sendSuccess(res, result, null);
}

async function saveLocaAndALDetails(req, res) {
  if (req.body.id !== undefined && req.body.id !== "") {
    updateData(req, res);
  } else {
    createData(req, res);
  }
}

async function createData(req, res) {
  let location = {
    code: req.body.name,
    name: req.body.description
  };
  let result = await locationService.create(location);
  req.body.assemblyLine.forEach(element => {
    if (element.code != "") {
      let assemblyLine = {
        code: element.code.toUpperCase(),
        name: element.name,
        locationId: result.id
      };
      assemblyLineService.create(assemblyLine);
    }
  });
  baseController.sendSuccess(res, result, null);
}

async function updateData(req, res) {
  let location = {
    id: req.body.id,
    code: req.body.name,
    name: req.body.description
  };
  let result = await locationService.update(location);
  req.body.assemblyLine.forEach(element => {
    if (element.deleted === true) {
      //Deleted Assembly Line
      let assemblyLine = {
        id: element.id,
        isActive: false
      };
      assemblyLineService.update(assemblyLine);
    } else if (element.id !== undefined && element.id !== null) {
      //Updated Assembly Line
      if (element.code != "") {
        let assemblyLine = {
          code: element.code.toUpperCase(),
          name: element.name,
          id: element.id,
          locationId: result.id
        };
        assemblyLineService.update(assemblyLine);
      }
    } else {
      //CReate Assembly Line
      if (element.code != "") {
        let assemblyLine = {
          code: element.code.toUpperCase(),
          name: element.name,
          locationId: result.id
        };
        assemblyLineService.create(assemblyLine);
      }
    }
  });
  baseController.sendSuccess(res, result, null);
}
