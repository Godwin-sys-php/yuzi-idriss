function jsonExtraction(chaineConfuse) {
  var debutJSON = chaineConfuse.indexOf('{'); // Recherche de la première accolade ouvrante
  var finJSON = chaineConfuse.lastIndexOf('}'); // Recherche de la dernière accolade fermante

  if (debutJSON !== -1 && finJSON !== -1 && debutJSON < finJSON) {
    var jsonString = chaineConfuse.substring(debutJSON, finJSON + 1); // Extraction de la partie contenant le JSON
    return jsonString;
  } else {
    return null; // Aucun JSON trouvé
  }
}

module.exports = jsonExtraction;