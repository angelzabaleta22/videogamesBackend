require("dotenv").config();
const { API } = process.env;
const axios = require("axios");
const { Videogame, Genre, Platform } = require("../../db");
const { checkIfValidUUID, getIdName } = require("./utils");

module.exports = {
  //-------------------------------------------GET-------------------------------------------
  async get(req, res) {
    const { idVideogame } = req.params;

    if (checkIfValidUUID(idVideogame)) {
      //Verificar si el parámetro es un UUID válido devuelve true o false
      Videogame.findByPk(idVideogame, {
        // Buscar un videogame con ese ID en la base de datos
        attributes: [
          "id",
          "name",
          "description",
          "released",
          "rating",
          "background_image",
        ],
        include: [
          //aqui incluyo las relaciones de otros modelos en el resultado de la busqueda.
          {
            model: Genre,
            attributes: ["id", "name"],
            through: { attributes: [] }, //Esta opción especifica que no se deben incluir columnas de la tabla de unión que se utiliza para relacionar el modelo Videogame y el modelo Genre.
          },
          {
            model: Platform,
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
      })
        .then((videogame) => res.send(videogame)) // Enviar el videojuego encontrado en la respuesta
        .catch((err) => res.status(500).send(err));
    } else {
      try {
        //Si no es un UUID válido, buscar el videojuego en la API externa
        const gameFromApi = await axios.get(
          `https://api.rawg.io/api/games/${idVideogame}?key=${API}`
        );
        /* console.log("hola des aquí desde la petición API", gameFromApi); */
        const {
          id,
          name,
          description_raw,
          released,
          background_image,
          rating,
        } = gameFromApi.data;

        const genres = getIdName(gameFromApi.data.genres);
        const platforms = getIdName(gameFromApi.data.platforms, "platform");
        /* console.log("Hola, soy genres desde controller videogame", genres);
        console.log("Hola, soy platform desde controller videogame", platforms); */

        const videogameFromApi = {
          id,
          name,
          description: description_raw,
          released,
          rating,
          background_image,
          genres,
          platforms,
        };
        res.json(videogameFromApi);
      } catch (err) {
        res.send({ success: false, err: err.message });
      }
    }
  },

  //--------------------------------------------------POST---------------------------------------------

  async post(req, res) {
    // Crear videojuego en la base de datos
    //prettier-ignore
    const {
      name,
      description,
      released,
      rating,
      genres,
      background_image,
      platforms,
    } = req.body;
    // Creamos dos nuevas listas que contienen sólo los ids de cada género y plataforma selecciobados para crear el nuevo juego
    const genresId = genres.map((genre) => genre.id);
    const platformsId = platforms.map((platform) => platform.id);

    try {
      // Ejecutamos dos operaciones de búsqueda en paralelo
      const checkGenrePlatform = await Promise.allSettled([
        Genre.findAndCountAll({ where: { id: genresId } }).then(
          (result) => result.count // Cuando la promesa se resuelva, devolveremos el valor de la propiedad count del resultado
        ),
        Platform.findAndCountAll({ where: { id: platformsId } }).then(
          (result) => result.count // Cuando la promesa se resuelva, devolveremos el valor de la propiedad count del resultado
        ),
      ]).then((values) => {
        // Destructuramos los resultados y comparamos el número de géneros y plataformas encontrados con el número de ids en cada lista
        const [{ value: countGenres }, { value: countPlatforms }] = values;

        //prettier-ignore
        const result = countGenres === genresId.length && countPlatforms === platformsId.length ? true : false;
        return result;
      }); //Todo esto resuelve true o false y luego se lo paos al if de aquí abajo

      if (checkGenrePlatform) {
        Videogame.create({
          name,
          description,
          released,
          rating,
          background_image,
        })
          .then(
            (
              videogame //Después que se crea el objeto videogame ejecuto dos promesas simultaneas para agregarle los generos y o plataformas escogidos mediante una función de devolución de llamada.
            ) =>
              Promise.allSettled([
                videogame.addGenres(genresId),
                videogame.addPlatforms(platformsId),
              ])
          )
          .then((values) => {
            const [{ status: addgenres }, { status: addplatforms }] = values;
            //prettier-ignore
            const result = addgenres === "fulfilled" && addplatforms === "fulfilled" ? true : false;
            return result;
          })
          .then((result) => res.status(201).json({ success: result }))
          .catch((err) => {
            res.status(500).send(err);
          });
      } else {
        res.send({
          succcess: false,
          err: "Alguno de los generos o plataformas enviados no fue encontrado",
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },

  //------------------------------------------DELETE------------------------------------------------
  async delete(req, res) {
    const { idVideogame } = req.params;
    console.log("Hola desde DELETE", idVideogame);

    try {
      const result = await Videogame.destroy({
        //Esta promesa devuelve un resultado con el número de filas eliminadas y se asignará a la variable "result"
        where: { id: idVideogame }, //Elimininrá la fila que concuerde con le valor de id asignado a idVideogame.
      });
      console.log("Hola desde DELETE", result);

      res.status(201).json({ success: result === 1 ? true : false });
    } catch (err) {
      res.send(err);
    }
  },
};
