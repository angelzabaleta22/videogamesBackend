const router = require("express").Router();
const platforms = require("./controllers/platforms.js");

router.route("/").get(platforms.get);

module.exports = router;
