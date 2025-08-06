'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feedback_component_type') THEN
          CREATE TYPE "enum_feedback_component_type" AS ENUM ('Crown', 'Movement', 'Hands', 'Dial', 'Case');
        END IF;
      END$$;
    `);

    await queryInterface.addColumn('feedback', 'component_type', {
      type: Sequelize.ENUM('Crown', 'Movement', 'Hands', 'Dial', 'Case'),
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('feedback', 'component_type');
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feedback_component_type') THEN
          DROP TYPE "enum_feedback_component_type";
        END IF;
      END$$;
    `);
  }
};
