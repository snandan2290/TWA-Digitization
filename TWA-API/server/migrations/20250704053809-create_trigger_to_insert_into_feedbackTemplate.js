'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION insert_feedback_template()
        RETURNS TRIGGER AS $$
        DECLARE
          feedback_json JSON;
        BEGIN
          SELECT row_to_json(fb)
          INTO feedback_json
          FROM (
            SELECT 
              DATE("feedback"."createdAt") AS "date", 
              "location"."name" AS "fromAssyUnit",
              CONCAT("location"."code", '/', TO_CHAR("feedback"."createdAt", 'YY'), '-', 
                (TO_CHAR("feedback"."createdAt", 'YY')::int + 1), '/', "feedback"."id"
              ) AS "reportNo",
              'NA' AS "toName",
              "workOrder"."type" AS "type",
              'NA' AS "ccName",
              "component"."name" AS "component",
              "component"."code" AS "itemRef",
              'NA' AS "newProduct",
              "feedback"."variant_code" AS "watchModel",
              "feedback"."severity" AS "typeOfCriticality",
              COALESCE("workOrder"."cluster",'') AS "cluster",
              'NA' AS "supplier",
              'NA' AS "assembledQty",
              'NA' AS "repetition",
              'NA' AS "rejn",
              'NA' AS "defect",
              'NA' AS "rejPer",
              "variant"."description" AS "calibre",
              "workOrder"."quantity" AS "assemblyWIP",
              "workOrder"."UCP" AS "ucpInInr",
              'NA' AS "fpsStock",
              "user"."username" AS "reportedBy",
			        'NA' AS "remark",
			        CONCAT(
                "location"."code", ' WA', 
                ' - Quality Feedback Report - ', 
                TO_CHAR("feedback"."createdAt", 'YY'), 
                '-', 
                (TO_CHAR("feedback"."createdAt", 'YY')::int + 1)
              ) AS "title"
            FROM "feedback"
            INNER JOIN "user" ON "user"."id" = "feedback"."operatorId"
            INNER JOIN "location" ON "location"."id" = "user"."locationId"
            INNER JOIN "component" ON "component"."id" = "feedback"."component_id"
            INNER JOIN "workOrder" ON "workOrder"."name" = "feedback"."workorder_no"
            INNER JOIN "variant" ON "variant"."code" = "feedback"."variant_code" 
            WHERE "feedback"."id" = NEW.id
          ) fb;

          INSERT INTO "feedbackTemplate" ("feedbackId", "template", "createdAt", "updatedAt")
          VALUES (NEW.id, feedback_json, NOW(), NOW());

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      await queryInterface.sequelize.query(`
        CREATE TRIGGER trg_create_feedback_template
        AFTER INSERT ON "feedback"
        FOR EACH ROW
        EXECUTE FUNCTION insert_feedback_template();
      `, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS trg_create_feedback_template ON "feedback";
      `, { transaction });

      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS insert_feedback_template();
      `, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
