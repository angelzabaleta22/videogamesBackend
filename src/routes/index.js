const { Router } = require("express");
// Importar todos los routers;
const videogame = require("./videogame.routes.js");
const videogames = require("./videogames.routes.js");
const genres = require("./genres.routes.js");
const platforms = require("./platforms.routes.js");
const error404 = require("./controllers/404.js");
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

router.use("/videogame", videogame);
router.use("/videogames", videogames);
router.use("/genres", genres);
router.use("/platforms", platforms);

//prettier-ignore
router.
    route("*")
    .get(error404.get);

module.exports = router;
