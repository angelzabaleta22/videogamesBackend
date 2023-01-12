const router = require("express").Router();
const videogames = require("./controllers/videogames");

router.route("/").get(videogames.get);

module.exports = router;
