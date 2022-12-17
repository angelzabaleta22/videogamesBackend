const router = require("express").Router();
const videogame = require("./controllers/videogame");

router
  .route("/:idVideogame")
  .get(videogame.get)
  .delete(videogame.delete)
  .put(videogame.put);

router.route("/").post(videogame.post);

module.exports = router;
