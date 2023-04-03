const router = require("express").Router();
const platforms = require("./Controllers/platforms");

router.route("/").get(platforms.get);

module.exports = router;
