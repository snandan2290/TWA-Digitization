const sequelize = require("sequelize");
const db = require('../models');

exports.getFeedbackSummary = async (params) => {
    let query = `
        SELECT
            "day", 
            SUM("total_feedbacks") AS "total_feedbacks",
            SUM("resolved_count") AS "resolved_count", 
            SUM("total_feedbacks" - "resolved_count") as pending_count
        FROM "feedback_daily_summary"
        WHERE "day" = :date
    `;

    const replacements = {
        date: params.date
    };

    if (params.line !== undefined && params.line !== null && params.line.trim() !== "") {
        query += ` AND "line" = ANY(ARRAY[:line]) `;
        replacements.line = params.line.split(',').map(line => parseInt(line.trim(), 10));
    }

    query += ` GROUP BY "day"`
    const result = await db.sequelize.query(
        query,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result
}

exports.getFeedbackCategorySummary = async (params) => {
    let query = `
        SELECT
            "day", 
            SUM("clarification") AS "clarification",
            SUM("production_stoppage") AS "production_stoppage", 
            SUM("information") AS "information"
        FROM "feedback_daily_summary_category"
        WHERE "day" = :date
    `;

    const replacements = {
        date: params.date
    };

    if (params.line) {
        query += ` AND "line" = ANY(ARRAY[:line]) `;
        replacements.line = params.line.split(',').map(line => parseInt(line.trim(), 10));
    }

    query += ` GROUP BY "day"`
    const result = await db.sequelize.query(
        query,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result
}

exports.getFeedbackLineSummary = async (params) => {
    let query = `
        SELECT
            "day", 
            "code",
            "total_feedbacks"
        FROM "feedback_daily_summary"
        INNER JOIN "assemblyLine" ON "assemblyLine"."id" = "feedback_daily_summary"."line"
        WHERE "day" = :date
        GROUP BY "day", "code","total_feedbacks"
    `;

    const result = await db.sequelize.query(
        query,
        {
            replacements: {
                date: params.date
            },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result
}

exports.getFeedbackSeveritySummary = async (params) => {
    let query = `
        SELECT
            "day", 
            "critical",
            "major",
            "minor"
        FROM "feedback_daily_summary_severity"
        WHERE "day" = :date
        AND "line" = ANY(ARRAY[:line])
    `;

    const result = await db.sequelize.query(
        query,
        {
            replacements: {
                date: params.date,
                line: params.line.split(',').map(line => parseInt(line.trim(), 10))
            },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result
}



