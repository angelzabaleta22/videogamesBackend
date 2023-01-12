module.exports = {
  get(req, res) {
    res.status(404).send("<h1>¡Woops! No existe esta página.</h1>");
  },
};
//Manejo de error. Si buscamos una ruta que no existe
