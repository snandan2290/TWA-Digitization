const userService = require("./../services/user.service");
const baseController = require("./base.controller");
var jwt = require("jsonwebtoken");
const configFile = require("./../config/jwtConfig.json");
const jwtConfigFile = require("./../config/jwtConfig.json");

exports.userLogin = async function(req, res) {
  if (req.body.username != undefined && req.body.username != "") {
    let result = await userService.authenticate(
      req.body.username,
      req.body.password
    );
    if (result != null) {
      var token = jwt.sign({ username: req.body.username }, configFile.secret, {
        expiresIn: "43200s" // expires in 12 hours
      });
      let checkValue = await checkForDefaultPassword(req.body.password);
      result[0].dataValues["changePasswordFlag"] = checkValue;
      res.status(200).send({ auth: true, token: token, data: result });
    } else {
      baseController.sendFailure(res, null, "Authentication Failed");
    }
  } else {
    baseController.sendFailure(res, null, "Username is required");
  }
};

exports.logout = async function(req, res) {
  res.status(200).send({ auth: false, token: null }); //TODO: Need to invalidate the JWT token
};

function checkForDefaultPassword(passwordVal) {
  if (jwtConfigFile.defaultPassword === passwordVal) {
    return true;
  } else {
    return false;
  }
}
