const express = require("express");
const router = express.Router();
const { getPlaceDetails } = require("../controllers/aiController");

// 🔥 GET route (refresh-safe)
router.get("/place-details/:place", getPlaceDetails);

module.exports = router;