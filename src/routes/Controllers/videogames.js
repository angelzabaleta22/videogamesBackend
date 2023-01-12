require("dotenv").config();
const { API } = process.env;
const axios = require("axios");
const { Op } = require("sequelize");
const { Videogame, Genre, Platform } = require("../../db.js");

module.exports = {
  async get(req, res) {
    let data = [];
    let videogames = [];
    let url = `https://api.rawg.io/api/games?key=${API}`;

    if (req.query.name) {
      // Si la solicitud incluye un parámetro 'name', extraer el valor del parámetro 'name'
      const { name } = req.query;
      try {
        // Busca videojuegos en la base de datos que coincidan con el nombre especificado -->
        let videogamesFromDb = await Videogame.findAll({
          where: {
            name: {
              [Op.like]: req.query.name.toLowerCase(), //convierto a minus antes de hacer la comparación
              //LIKE es un operador de comparación que se utiliza en consultas de bases de datos para buscar patrones en una columna de datos.
            },
          },
          attributes: [
            //Esta línea especifica las columnas que se deben incluir en el resultado de la consulta
            "id",
            "name",
            "description",
            "released",
            "rating",
            "background_image",
          ],
          include: [
            //Esta línea especifica los modelos relacionados que se deben incluir en el resultado de la consulta.
            {
              model: Genre,
              attributes: ["id", "name"],
              through: {
                attributes: [],
              },
            },
            {
              model: Platform,
              attributes: ["id", "name"],
              through: {
                attributes: [], //indica que no deseo incluir datos del modelo intermedio en el resultado.
              },
            },
          ],
        });
        // Busca videojuegos en la API de RAWG.io que coincidan con el nombre especificado -->
        const result = await axios.get(
          `https://api.rawg.io/api/games?search=${name.toLowerCase()}&key=${API}`
        );
        // Crea un objeto para cada videojuego y guarda la información relevante -->
        result.data.results.forEach((element) => {
          const videogame = {
            id: element.id,
            name: element.name,
            released: element.released,
            rating: element.rating,
            background_image: element.background_image,
            genres: element.genres
              ? element.genres.map((genre) => {
                  return { id: genre.id, name: genre.name };
                })
              : element.genres,
            platforms: element.platforms
              ? element.platforms.map((platform) => {
                  return {
                    id: platform.platform.id,
                    name: platform.platform.name,
                  };
                })
              : element.platforms,
          };
          videogames.push(videogame);
        });
        // Si se encontraron videojuegos en la base de datos y en la API, concateno los resultados y envía los 15 primeros en la respuesta -->
        if (videogames && videogamesFromDb) {
          const videogameTotal = videogamesFromDb.concat(videogames);
          res.send(videogameTotal.slice(0, 15));
        }
      } catch (err) {
        res.status(500).send(`error: ${err}`);
      }
    } else {
      try {
        let videogamesFromDb = await Videogame.findAll({
          //Buscar todos los videojuegos en la base de datos y devolver ciertos atributos de cada uno
          attributes: [
            "id",
            "name",
            "description",
            "released",
            "rating",
            "background_image",
          ],
          include: [
            //Incluir datos relacionados con cada videojuego, como géneros y plataformas
            {
              model: Genre,
              attributes: ["id", "name"],
              through: {
                attributes: [],
              },
            },
            {
              model: Platform,
              attributes: ["id", "name"],
              through: {
                attributes: [],
              },
            },
          ],
        });

        for (let i = 0; i < 5; i++) {
          // Iterar sobre los datos obtenidos y realizar una operación en cada elemento
          const result = await axios.get(url);
          url = result.data.next;

          data.push(result.data.results);
        }

        data.flat().forEach((element) => {
          // Iterar sobre los datos obtenidos y realizar una operación en cada elemento
          const videogame = {
            // Crear un objeto que representa un videojuego y asignarle valores de ciertos atributos obtenidos de los datos de la petición
            id: element.id,
            name: element.name,
            released: element.released,
            rating: element.rating,
            background_image: element.background_image,

            // Crear objetos que representan los géneros y plataformas del videojuego y asignarles valores de ciertos atributos obtenidos de los datos de la petición
            genres: element.genres.map((genre) => {
              return { id: genre.id, name: genre.name };
            }),
            platforms: element.platforms.map((platform) => {
              return { id: platform.platform.id, name: platform.platform.name };
            }),
          };
          videogames.push(videogame);
        });
        // Si la matriz de videojuegos obtenidos de la base de datos y la matriz de videojuegos obtenidos de la petición contienen datos, concatenarlos en una nueva matriz
        if (videogames && videogamesFromDb) {
          const videogameTotal = videogamesFromDb.concat(videogames);
          res.send(videogameTotal);
        }
      } catch (err) {
        res.status(500).send(err);
      }
    }
  },
};
