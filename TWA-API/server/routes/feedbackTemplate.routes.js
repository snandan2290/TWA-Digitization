const express = require("express");
const router = express.Router();
const feedbackTemplateController = require("../controllers/feedbackTemplate.controller");

router.get(
  "/getFeedbackTemplate/:feedbackId",
  feedbackTemplateController.getFeedbackTemplate
);
router.put(
  "/saveFeedbackTemplate/:feedbackId",
  feedbackTemplateController.saveFeedbackTemplate
);

module.exports = router;