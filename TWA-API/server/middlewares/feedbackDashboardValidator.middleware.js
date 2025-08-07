const { query, validationResult } = require('express-validator');


exports.validateGenricReqParams = [
    query('date')
        .exists({ checkFalsy: true }).withMessage('Date is required')
        .notEmpty().withMessage('Date cannot be empty')
        .isISO8601().withMessage('Date must be a valid date'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(e => e.msg)
            });
        }
        next();
    }
];

exports.validateGenricOptParams = [
    query('line')
        .optional()
        .notEmpty().withMessage('Line cannot be empty')
        .isNumeric().withMessage('Line must be a number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(e => e.msg)
            });
        }
        next();
    }
];

exports.validateFeedbackSeveritySummaryParams = [
    query('line')
        .exists({ checkFalsy: true }).withMessage('Line is required')
        .notEmpty().withMessage('Line cannot be empty')
        .isNumeric().withMessage('Line must be a number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(e => e.msg)
            });
        }
        next();
    }
];
