const router = require("express").Router();
const videogames = require("./Controllers/videogames");

router.route("/").get(videogames.get);

module.exports = router;
