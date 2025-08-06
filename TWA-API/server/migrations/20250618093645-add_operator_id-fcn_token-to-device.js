'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(queryInterface, Sequelize) => {

    await queryInterface.addColumn('device', 'operator_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.addColumn('device', 'fcm_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async(queryInterface, Sequelize)  => {
      await queryInterface.removeColumn('device', 'operator_id');
      await queryInterface.removeColumn('device', 'fcm_token');
    }
};
