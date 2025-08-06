'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('workOrder', 'priority', {
      type: Sequelize.ENUM,
      values: ["FWS1", "FWS2", "NPPL", "FWS4", "FWE4", "OTHER"],
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workOrder', 'priority');
  }
};