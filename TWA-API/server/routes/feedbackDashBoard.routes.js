const express = require("express");
const router = express.Router();
const feedbackDashBoardController = require("../controllers/feedbackDashBoard.controller");
const {validateFeedbackSeveritySummaryParams, validateGenricReqParams, validateGenricOptParams} = require("../middlewares/feedbackDashboardValidator");

router.get(
  "/getFeedbackSummary", validateGenricReqParams, validateGenricOptParams,
  feedbackDashBoardController.getFeedbackSummary
);
router.get(
  "/getFeedbackCategorySummary", validateGenricReqParams, validateGenricOptParams,
  feedbackDashBoardController.getFeedbackCategorySummary
);
router.get(
  "/getFeedbackLineSummary", validateGenricReqParams,
  feedbackDashBoardController.getFeedbackLineSummary
);
router.get(
  "/getFeedbackSeveritySummary", validateGenricReqParams, validateFeedbackSeveritySummaryParams, 
  feedbackDashBoardController.getFeedbackSeveritySummary
);

module.exports = router;