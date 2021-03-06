const router = require("express").Router();
const autocompleteController = require("../controller/autocomplete");
const { auth } = require("../middlewares/apikeyAuth");

router.get("/",auth, autocompleteController.autocomplete);

module.exports = router;
