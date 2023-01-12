const { DataTypes } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define("videogame", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //La propiedad allowNull en este caso indica que el valor de la columna name no puede ser nulo (null) cuando se agregue una fila a la tabla en la base de datos. Si se intenta agregar una fila con un valor nulo en la columna name, se generará un error. Esto se debe a que la propiedad allowNull está establecida en false.
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    released: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    rating: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    background_image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
