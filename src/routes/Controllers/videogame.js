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
      //Verificar si el parámetro es un UUID válido
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
          {
            model: Genre,
            attributes: ["id", "name"],
            through: { attributes: [] },
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
    const { name, description, released, rating, genres, background_image, platforms } = req.body;
    // Creamos dos nuevas listas que contienen sólo los ids de cada género y plataforma
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
      });

      if (checkGenrePlatform) {
        Videogame.create({
          name,
          description,
          released,
          rating,
          background_image,
        })
          .then((videogame) =>
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
          err: "Alguno de los generos no plataformas enviados no fue encontrado",
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },

  //------------------------------------------DELETE------------------------------------------------
  async delete(req, res) {
    const { idVideogame } = req.params;

    try {
      const result = await Videogame.destroy({
        where: { id: idVideogame },
      });

      res.status(201).json({ success: result === 1 ? true : false });
    } catch (err) {
      res.send(err);
    }
  },

  //-------------------------------------------------PUT----------------------------------------------
  async put(req, res) {
    const { idVideogame } = req.params;
    const videogame = await Videogame.findByPk(idVideogame);
    // Modificar videojuego en la base de datos
    //prettier-ignore
    const { name, description, released, rating, genres, background_image, platforms } = req.body;
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
      });

      if (checkGenrePlatform) {
        videogame
          .update({
            name,
            description,
            released,
            rating,
            background_image,
          })
          .then((videogame) =>
            Promise.allSettled([
              videogame.addGenres(genresId),
              videogame.addPlatforms(platformsId),
            ])
          )
          .then((values) => {
            const [{ status: addgenres }, { status: addplatforms }] = values;
            //prettier-ignore
            const result = addgenres === "fulfilled" && addplatforms === "fulfilled" ? true: false;
            return result;
          })
          .then((result) => res.status(201).json({ success: result }))
          .catch((err) => {
            res.status(500).send(err);
          });
      } else {
        res.send({
          succcess: false,
          err: "Alguno de los generos no plataformas enviados no fue encontrado",
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },

  //------------------------------------------DELETE------------------------------------------------
  async delete(req, res) {
    const { idVideogame } = req.params;

    try {
      const result = await Videogame.destroy({
        where: { id: idVideogame },
      });

      res.status(201).json({ success: result === 1 ? true : false });
    } catch (err) {
      res.send(err);
    }
  },
  //-----------------------------------------end------------------------------------------
};
