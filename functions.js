// Import modules
const fs = require('fs').promises; //NOTE - ajout de .promises pour etre utiliser avec try catch

// Vérifie si erreur.message egale CastError, l'objectId présent dans l'URL n'est pas un object valide de MongoDB
function castError(error) {
  if (error.name === 'CastError') {
    console.log('The parameter Id in the URL is not a valid MongoDB object');
    error.status = 404;
    error.message = 'Not Found';
  }
}

/** Verifie que le livre existe dans la base de donnée
 * @param {Objet} book - Les diférente information (String et Number) d'un livres
 */
function findBook(book) {
  if (!book) {
    console.log('The book not found in the database');
    const error = new Error('Not Found');
    error.status = 404;
    throw error;
  }
}

/** Verifie que l'utilisateur qui envoie la requette est le meme que celui qui creer le livre
 * @param {Objet} book - Les diférente information (String et Number) d'un livres
 * @param {Object} req - Informations du livre envoyées par l'utilisateur
 */
function userAuthorization(book, req) {
  if (book.userId != req.auth.userId) {
    console.log(
      'The userId of the book is not the same as the one in the request'
    );
    const error = new Error('unauthorized request');
    error.status = 403;
    throw error;
  }
}

/** Supprime un fichier sur le serveur
 * @param {Objet} book - Les diférente information (String et Number) d'un livres
 * @param {Object} req - Informations du livre envoyées par l'utilisateur
 *
 * @function findBook Verifie que le livre existe dans la base de donnée
 * @function userAuthorization Verifie que l'utilisateur qui envoie la requette est le meme que celui qui creer le livre
 */
async function delateFile(book) {
  try {
    // Supprime le fichier du serveur
    const delateFile = book.imageUrl.split('/images/')[1];
    await fs.unlink(`images/${delateFile}`);

    console.log('File deleted');
  } catch (error) {
    throw error;
  }
}

/** Supprime les espaces avant et après les chaînes de caractères
 * @param {Object} reqData - Les informations envoyées par l'utilisateur
 */
function trimRequest(reqData) {
  for (const key in reqData) {
    if (typeof reqData[key] === 'string') {
      reqData[key] = reqData[key].trim();
    }
  }
}

module.exports = {
  castError,
  findBook,
  userAuthorization,
  delateFile,
  trimRequest,
};
