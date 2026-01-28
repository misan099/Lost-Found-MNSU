const express = require("express");
const router = express.Router();

const {
  searchItems,
} = require("../../controllers/search/search.controller");

router.get("/", searchItems);

module.exports = router;
