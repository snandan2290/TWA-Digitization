'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First, create the ENUM type
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feedback_severity') THEN
          CREATE TYPE "enum_feedback_severity" AS ENUM ('Critical', 'Major', 'Minor');
        END IF;
      END$$;
    `);

    // Add the `component_id` and `severity` columns
    await Promise.all([
      queryInterface.addColumn('feedback', 'component_id', {
        type: Sequelize.INTEGER,
        allowNull: true, 
      }),
      queryInterface.addColumn('feedback', 'severity', {
        type: Sequelize.ENUM('Critical', 'Major', 'Minor'),
        allowNull: true,
      })
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Remove the columns
    await Promise.all([
      queryInterface.removeColumn('feedback', 'component_id'),
      queryInterface.removeColumn('feedback', 'severity')
    ]);

    // Drop the ENUM type only if it's not used anywhere else
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feedback_severity') THEN
          DROP TYPE "enum_feedback_severity";
        END IF;
      END$$;
    `);
  }
};
