'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(queryInterface, Sequelize) => {

    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.addColumn('feedback', 'isNew', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        default: true
      }, { transaction });

      await queryInterface.sequelize.query(`
      UPDATE feedback
      SET "isNew" = false
      `, { transaction });

      await queryInterface.changeColumn('feedback', 'isNew', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }, { transaction
      })

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async(queryInterface, Sequelize) => {
    await queryInterface.removeColumn('feedback', 'isNew');
  }
};
