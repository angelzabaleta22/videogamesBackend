const { Router } = require("express");
// Importar todos los routers;
const videogame = require("./videogame.routes");
const videogames = require("./videogames.routes");
const genres = require("./genres.routes");
const platforms = require("./platforms.routes");
const error404 = require("./controllers/404");
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
