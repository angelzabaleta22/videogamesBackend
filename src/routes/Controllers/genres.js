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
          return {
            id: e.id,
            name: e.name,
            image_background: e.image_background,
          };
        });
        Genre.bulkCreate(results).then((result) => res.send(result));
      } else {
        res.send(genresDB);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
