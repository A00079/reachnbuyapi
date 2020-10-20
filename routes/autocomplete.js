const router = require("express").Router();
const autocompleteController = require("../controller/autocomplete");
const { auth } = require("../middlewares/apikeyAuth");

router.get("/search", autocompleteController.autocomplete);

module.exports = router;
