const router = require("express").Router();
const genres = require("./controllers/genres");

router.route("/").get(genres.get);

module.exports = router;
