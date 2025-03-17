// Import modules
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises; //NOTE - ajout de .promises pour etre utiliser avec try catch
// Import modèles
const Book = require('../models/book');
// Import fonction
const {
  castError,
  findBook,
  userAuthorization,
  delateFile,
} = require('../functions');

// Stockage en mémoire (RAM)
const memoryStorage = multer.memoryStorage(); // Crée un espace de stockage temporaire
const upload = multer({ storage: memoryStorage }); // Indique que Multer doit utiliser le memoryStorage

/** Modifie la taille et le format de l'image, puis la sauvegarde sur le serveur
 * @param {Objet} req - Informations du livre envoyées par l'utilisateur
 * @param {String} filePath - Chemin d'accès vers l'image stockée sur le serveur
 */
async function saveImage(req, filePath) {
  try {
    await sharp(req.file.buffer)
      .resize({
        width: 206,
        height: 260,
        fit: 'contain',
        background: 'transparent',
      })
      .toFormat('webp')
      .toFile(filePath);
  } catch (error) {
    throw error;
  }
}

/** Ajoute une image sur le serveur
 * @param {Objet} req - Informations du livre envoyées par l'utilisateur
 * @function saveImage : Modifie la taille et le format de l'image, puis la sauvegarde sur le serveur
 * */
async function addImage(req) {
  try {
    // Renomme le nom du nouveau fichier dans la requête pour le réutiliser dans le middleware suivant
    const originaFileName = req.file.originalname
      .split(' ')
      .join('_')
      .split('.')[0];
    const newFileName = `${Date.now()}-${originaFileName}.webp`;
    req.file.filename = newFileName;
    // Puis crée le chemin du fichier
    const uploadDir = path.resolve(__dirname, '../images/');
    const filePath = path.join(uploadDir, newFileName);

    // Vérifie que le dossier où enregistrer le fichier existe et le crée si besoin
    await fs.mkdir(uploadDir, { recursive: true });

    // Sauvegarde une image sur le serveur
    await saveImage(req, filePath);
  } catch (error) {
    throw error;
  }
}

/** Test si les données du formulaire sont complettes
 * @param {Objet} req - Informations du livre envoyées par l'utilisateur
 */
function testBookData(req) {
  // Verifie si la requette possaide le formulaire autrement une erreur est levé
  if (req.body.book) {
    const FormBook = JSON.parse(req.body.book);

    // Verifie que chaque objet du formulaire est present
    const keyFormBook = ['userId', 'title', 'author', 'year', 'genre'];
    const keyformCheck = keyFormBook.every((key) =>
      FormBook.hasOwnProperty(key)
    );

    // Si il manque un objet ou si year n'est pas un nombre, une erreur est levé
    if (!keyformCheck || Number(req.body.book.year) === NaN) {
      console.log('The request is not comforme');
      const error = new Error('Bad Request');
      error.status = 400;
      throw error;
    }
  } else {
    console.log('the request is empty');
    const error = new Error('Bad Request');
    error.status = 400;
    throw error;
  }
}

/** Vérifie si le fichier est bien une image
 * @param {Object} req - Informations du fichier envoyées par l'utilisateur
 */
function testFile(req) {
  switch (req.file.mimetype) {
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/png':
    case 'image/webp':
      console.log('Image sent');
      break;

    default:
      console.log('Unsupported file');
      const error = new Error('Bad Request');
      error.status = 400;
      throw error;
  }
}

/** Ajoute un fichier au memoryStorage, vérifie sa présence, l'enregistre et retourne les erreurs.
 * @param {Object} req - Informations du livre envoyées par l'utilisateur.
 * @param {Object} res - Erreur survenue depuis la base de données ou créée.
 * @param {function} next - Passage au middleware suivant.
 *
 * @function testBookData - Test si les données du formulaire sont complettes.
 * @function findBook - Vérifie que le livre existe dans la base de données.
 * @function userAuthorization - Vérifie que l'utilisateur qui envoie la requête est le même que celui qui crée le livre.
 * @function deleteFile - Supprime un fichier de la base de données.
 * @function testFile - Vérifie si le fichier est bien une image.
 * @function addImage - Ajoute une image sur le serveur.
 * @function castError - Vérifie si erreur.message egale CastError, l'objectId présent dans l'URL n'est pas un object valide de MongoDB
 */
module.exports = async (req, res, next) => {
  try {
    // Ajoute le fichier contenant le champ image au memoryStorage
    await new Promise((resolve, reject) => {
      //NOTE Creation d'une promesse pour recupere les erreur avec try catch
      upload.single('image')(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Test la presence d'un fichier
    if (!req.file) {
      console.log('No file sent');
      return next();
    }

    // Test si le fichier envoyer est une image puis vérifie que toutes les données du formulaire sont présentes
    testFile(req);
    testBookData(req);

    // Si la requête possède un paramètre, c'est une modification donc:
    if (req.params.id) {
      // Vérifie que le livre existe et que l'utilisateur est autorisé, puis supprime l'image precedente du serveur.
      const book = await Book.findOne({ _id: req.params.id });
      findBook(book);
      userAuthorization(book, req);
      await delateFile(book);
    }

    // Enregistre l'image sur le serveur
    await addImage(req);
    next();
  } catch (error) {
    castError(error);
    res.status(error.status || 400).json({ message: error.message });
  }
};
