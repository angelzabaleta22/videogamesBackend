const router = require("express").Router();
const genres = require("./Controllers/genres");

router.route("/").get(genres.get);

module.exports = router;
