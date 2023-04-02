require("dotenv").config();
const { API } = process.env;
const axios = require("axios");
const { Platform } = require("../../db.js");

const URL = process.env.APIURL;
module.exports = {
  async get(req, res) {
    try {
      const platformsDB = await Platform.findAll();
      if (platformsDB.length === 0) {
        //prettier-ignore
        async function getPlatforms(url = `${URL}/platforms?key=${API}`) {
          try {
            const platformAPI = await axios.get(url);
            const { next, results } = platformAPI.data;
            //Next es la URL que apunta a la página siguiente de resultados de la API, mientras que results es un array con los resultados de la página actual.

            const platforms = results.map((e) => {
              return { id: e.id, name: e.name };
            });

            if (next === null) {
              return platforms;
            } else {
              const result = await getPlatforms(next); //Llamo recursivamente de nuevo a getPlatforms pasándole la página siguiente de la api obtenida en el resultado anterior.
              result.forEach((element) => {
                // Los resultados devueltos por la llamada recursiva se añaden al array platforms usando el método forEach del objeto Array.
                platforms.push(element);
              });
            }
            return platforms;
          } catch (err) {
            return err;
          }
        }

        getPlatforms()
          .then((data) => Platform.bulkCreate(data)) //El método bulkCreate crea una serie de instancias del modelo Platform en la base de datos y devuelve una promesa.
          .then((result) => res.send(result)) //La función de devolución de llamada recibe el resultado de la promesa (el resultado de la operación de creación masiva) como argumento y lo pasa como argumento al método send del objeto res. El método send envía la respuesta de la solicitud HTTP actual al cliente que hizo la solicitud. ///////
          .catch((err) => res.status(500).send(err));
      } else {
        res.send(platformsDB);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
