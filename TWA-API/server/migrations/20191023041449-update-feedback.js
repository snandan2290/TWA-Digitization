"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("feedback", "escalateMessage", {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn("feedback", "escalatedTo", {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn("feedback", "category", {
        type: Sequelize.ENUM,
        values: ["Production stoppage", "Clarification", "Information"]
      }),
      queryInterface.addColumn("feedback", "imagePath", {
        type: Sequelize.ARRAY(Sequelize.STRING)
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("feedback", "escalateMessage"),
      queryInterface.removeColumn("feedback", "escalatedTo"),
      queryInterface.removeColumn("feedback", "category"),
      queryInterface.removeColumn("feedback", "imagePath")
    ]);
  }
};
