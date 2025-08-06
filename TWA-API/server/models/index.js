"use strict";

const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/dbconfig.json")[env];
const pg = require("pg");
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      dialectModule: pg,
    }
    // config
  );
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.user = require("./user")(sequelize, DataTypes);
db.assemblyLine = require("./assemblyLine")(sequelize, DataTypes);
db.billOfMaterial = require("./billOfMaterial")(sequelize, DataTypes);
db.component = require("./component")(sequelize, DataTypes);
db.device = require("./device")(sequelize, DataTypes);
db.feedback = require("./feedback")(sequelize, DataTypes);
db.instruction = require("./instruction")(sequelize, DataTypes);
db.location = require("./location")(sequelize, DataTypes);
db.process = require("./process")(sequelize, DataTypes);
db.variant = require("./variant")(sequelize, DataTypes);
db.workOrder = require("./workOrder")(sequelize, DataTypes);
db.feedbackTemplate = require("./feedbackTemplate")(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize
  .authenticate()
  .then(() => {
    console.log("DB connection successfull!");
  })
  .catch((error) => console.log("DB connection error:", error));

module.exports = db;
