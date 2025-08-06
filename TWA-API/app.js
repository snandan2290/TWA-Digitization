const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var path = require("path");

// Set up the express app
const app = express();
const configFile = require("./server/config/jwtConfig.json");
const pathConfigFile = require("./server/config/config.json");

// Log requests to the console.
app.use(logger("dev"));

// Parse incoming requests data
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

app.use(cors());

function checkForSkipURLS(req) {
  var skipURLs = ["/api/login", "/api", "/api/getDeviceByUUID"];
  var skipFileExtensions = [".jpeg", ".png", ".jpg"];
  return (
    skipURLs.indexOf(req.path) == -1 &&
    req.path.indexOf("/api/getUserListByLocation") == -1 &&
    skipFileExtensions.indexOf(path.extname(req.path)) == -1
  );
}

var urlInterceptor = function (req, res, next) {
  //Skip interceptors for URLs listed in skipURLs variable
  if (checkForSkipURLS(req)) {
    var token = req.headers["access-token"];
    if (!token)
      return res
        .status(401)
        .send({ auth: false, message: "No token provided." });

    jwt.verify(token, configFile.secret, function (err, decoded) {
      if (err)
        return res
          .status(500)
          .send({ auth: false, message: "Failed to authenticate token." });
      next();
    });
  } else {
    next();
  }
};
app.use(
  pathConfigFile.feedbackBaseUrl,
  express.static(pathConfigFile.feedbackFilePath)
);
app.use(urlInterceptor);

app.use(pathConfigFile.instructionsBaseUrl, [
  urlInterceptor,
  express.static(pathConfigFile.instructionsPath),
]);
app.use(pathConfigFile.componentBaseUrl, [
  urlInterceptor,
  express.static(pathConfigFile.componentFilePath),
]);
app.use(pathConfigFile.variantBaseUrl, [
  urlInterceptor,
  express.static(pathConfigFile.variantFilePath),
]);


require("./server/routes")(app);

app.use(express.static(path.join(__dirname, 'build')));

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get("/{*splat}", (req, res) =>
  // res.status(200).send({
  //   message:
  //     "Titan Watch Assembly Digitiization APIs are up and running!!!. Please reach out to Admin",
  // })
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
);

module.exports = app;
