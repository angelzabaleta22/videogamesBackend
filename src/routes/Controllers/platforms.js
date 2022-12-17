require("dotenv").config();
const { API } = process.env;
const axios = require("axios");
const { Platform } = require("../../db.js");

module.exports = {
  async get(req, res) {
    try {
      const platformsDB = await Platform.findAll();
      if (platformsDB.length === 0) {
        //prettier-ignore
        async function getPlatforms(url = `https://api.rawg.io/api/platforms?key=${API}`){
        try{
          const platformAPI = await axios.get(url);
          const {next, results} = platformAPI.data;
          
          const platforms = results.map((e) => {
            return { id: e.id, name: e.name };
          });

          if(next === null){
            return platforms
          }else{
            const result = await getPlatforms(next);
            result.forEach(element => {
              platforms.push(element)
            });
          }
          return platforms
        }catch(err){
          return err
        }
      }

        getPlatforms()
          .then((data) => Platform.bulkCreate(data))
          .then((result) => res.send(result))
          .catch((err) => res.status(500).send(err));
      } else {
        res.send(platformsDB);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
