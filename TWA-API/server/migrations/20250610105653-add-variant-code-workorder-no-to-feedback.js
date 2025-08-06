'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('feedback', 'variant_code', {
      type: Sequelize.STRING,
      allowNull: true
 
    });
    await queryInterface.addColumn('feedback', 'workorder_no', {
      type: Sequelize.STRING,
      allowNull: true
 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('feedback', 'variant_code');
    await queryInterface.removeColumn('feedback', 'workorder_no');
  }
};
