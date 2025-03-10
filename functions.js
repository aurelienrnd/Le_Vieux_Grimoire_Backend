// Import modules
const fs = require('fs').promises; //NOTE - ajout de .promises pour etre utiliser avec try catch

/** Verifie que le livre existe dans la base de donnée
 * @param {Objet} book - Les diférente information (String et Number) d'un livres
 */
function findBook(book) {
  if (!book) {
    console.log("Le livre n'a pas etait trouvé dans la base de donnée");
    throw new Error("Ce livre n'existe pas");
  }
}

/** Verifie que l'utilisateur qui envoie la requette est le meme que celui qui creer le livre
 * @param {Objet} book - Les diférente information (String et Number) d'un livres
 * @param {Object} req - Informations du livre envoyées par l'utilisateur
 */
function userAuthorization(book, req) {
  if (book.userId != req.auth.userId) {
    console.log('Le userId du livre nest pas le meme que celui de la requete');
    throw new Error('Not authorized');
  }
}

/** Supprime un fichier sur le serveur
 * @param {Objet} book - Les diférente information (String et Number) d'un livres
 * @param {Object} req - Informations du livre envoyées par l'utilisateur
 *
 * @function findBook Verifie que le livre existe dans la base de donnée
 * @function userAuthorization Verifie que l'utilisateur qui envoie la requette est le meme que celui qui creer le livre
 */
async function delateFile(book, req) {
  try {
    // Vérifie ci le livre existe puis ci sont utilisateur en est le createur
    findBook(book);
    userAuthorization(book, req);

    // Supprime le fichier du serveur
    const delateFile = book.imageUrl.split('/images/')[1];
    await fs.unlink(`images/${delateFile}`);

    console.log('Le fichier a etait supprimé');
  } catch (error) {
    throw error;
  }
}

module.exports = { findBook, userAuthorization, delateFile };
