function checkIfValidUUID(str) {
  const regexExp = // Crear una expresión regular que represente el formato de un UUID
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
  return regexExp.test(str); // Devolver true si la cadena cumple con el formato de un UUID, false en caso contrario
}

function getIdName(array, subprop = "") {
  // Si no se especifica una propiedad, devolver una nueva matriz en la que cada elemento es un objeto que contiene los valores de los atributos id y name del elemento correspondiente en la matriz original
  if (subprop.length === 0) {
    //esta función me ayuda a extraer el id y el nombre del genero y plataforma
    return array.map((object) => {
      return {
        id: object.id,
        name: object.name,
      };
    });
  } else {
    return array.map((object) => {
      // Si se especifica una propiedad, devolver un nuevo arreglo en la que cada elemento es un objeto que contiene los valores de los atributos id y name de la propiedad especificada del elemento correspondiente en la matriz original
      return {
        id: object[subprop].id,
        name: object[subprop].name,
      };
    });
  }
}
module.exports = {
  checkIfValidUUID,
  getIdName,
};
