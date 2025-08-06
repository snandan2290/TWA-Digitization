'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('workOrder', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('workOrder', 'cluster', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('workOrder', 'UCP', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workOrder', 'type');
    await queryInterface.removeColumn('workOrder', 'cluster');
    await queryInterface.removeColumn('workOrder', 'UCP');
  }
};