require("dotenv").config();
const { API } = process.env;
const axios = require("axios");
const { Genre } = require("../../db.js");

module.exports = {
  async get(req, res) {
    try {
      const genresDB = await Genre.findAll();

      if (genresDB.length === 0) {
        const genresAPI = await axios.get(
          `https://api.rawg.io/api/genres?key=${API}`
        );
        const results = genresAPI.data.results.map((e) => {
          // Esta es la función anónima que se pasa a map.
          // Se aplica a cada elemento del array y devuelve un objeto con tres propiedades
          return {
            id: e.id,
            name: e.name,
            image_background: e.image_background,
          };
        });
        Genre.bulkCreate(results).then((result) => res.send(result));
      } else {
        //El método bulkCreate permite crear una serie de instancias de un modelo dado en la base de datos de manera eficiente. Acepta un array de objetos como argumento y crea una instancia para cada objeto en el array. Devuelve una promesa que se resuelve con el resultado de la operación de creación masiva.
        res.send(genresDB);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
