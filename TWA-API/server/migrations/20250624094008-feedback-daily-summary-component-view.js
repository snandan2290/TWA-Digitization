'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Create Materialized View
    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS feedback_daily_summary_component AS
      SELECT
        DATE("createdAt") AS day,
        "assemblyLineId" AS line,
        "component_id",
        COUNT(*) AS count
      FROM
        public.feedback
      GROUP BY
        DATE("createdAt"), "assemblyLineId", "component_id"
      ORDER BY
        day DESC;
    `);

    // Create trigger function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION refresh_feedback_daily_summary_component()
      RETURNS TRIGGER AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY feedback_daily_summary_component;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create unique index
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS feedback_daily_summary_component_day_line_component_idx
      ON feedback_daily_summary_component(day, line, component_id);
    `);

    // Create AFTER INSERT/UPDATE trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_refresh_feedback_component ON public.feedback;

      CREATE TRIGGER trg_refresh_feedback_component
      AFTER INSERT OR UPDATE
      ON public.feedback
      FOR EACH STATEMENT
      EXECUTE FUNCTION refresh_feedback_daily_summary_component();
    `);
  },

  async down (queryInterface, Sequelize) {
    // Rollback

    // Drop trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_refresh_feedback_component ON public.feedback;
    `);

    // Drop function
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS refresh_feedback_daily_summary_component();
    `);

    // Drop index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS feedback_daily_summary_component_day_line_idx;
    `);

    // Drop materialized view
    await queryInterface.sequelize.query(`
      DROP MATERIALIZED VIEW IF EXISTS feedback_daily_summary_component;
    `);
  }
};
