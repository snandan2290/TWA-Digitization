'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Create Materialized View
    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS feedback_daily_summary_category AS
      SELECT
        DATE("createdAt") AS day,
        "assemblyLineId" AS line,
        COUNT(*) FILTER (WHERE "category" = 'Clarification') AS clarification,
        COUNT(*) FILTER (WHERE "category" = 'Production stoppage') AS production_stoppage,
        COUNT(*) FILTER (WHERE "category" = 'Information') AS information
      FROM
        public.feedback
      GROUP BY
        DATE("createdAt"), "assemblyLineId"
      ORDER BY
        day DESC;
    `);

    // Create trigger function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION refresh_feedback_summary_category()
      RETURNS TRIGGER AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY feedback_daily_summary_category;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create unique index
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS feedback_daily_summary_category_day__line_idx
      ON feedback_daily_summary_category(day, line);
    `);

    // Create AFTER INSERT/UPDATE trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_refresh_feedback_category ON public.feedback;

      CREATE TRIGGER trg_refresh_feedback_category
      AFTER INSERT OR UPDATE
      ON public.feedback
      FOR EACH STATEMENT
      EXECUTE FUNCTION refresh_feedback_summary_category();
    `);
  },

  async down (queryInterface, Sequelize) {
    // Rollback

    // Drop trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_refresh_feedback_category ON public.feedback;
    `);

    // Drop function
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS refresh_feedback_summary_category();
    `);

    // Drop index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS feedback_daily_summary_category_day__line_idx;
    `);

    // Drop materialized view
    await queryInterface.sequelize.query(`
      DROP MATERIALIZED VIEW IF EXISTS feedback_daily_summary_category;
    `);
  }
};
