const express = require("express");
const { getPartByNo, upsertPart } = require("../controllers/part.controller");

const router = express.Router();

router.get("/:partNo", getPartByNo);
router.post("/", upsertPart);

module.exports = router;