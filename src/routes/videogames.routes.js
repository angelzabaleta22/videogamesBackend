const router = require("express").Router();
const videogames = require("./controllers/videogames");

//prettier-ignore
router
    .route("/")
    .get(videogames.get)

module.exports = router;
