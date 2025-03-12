// Import modules
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises; //NOTE - ajout de .promises pour etre utiliser avec try catch
// Import modèles
const Book = require('../models/book');
// Import fonction
const { delateFile } = require('../functions');

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
    console.log('fichier ajouté');
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
    console.log('folder images crée');

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

    // Si il manque un objet, une erreur est levé
    if (!keyformCheck) {
      throw new Error("la requette n'as pas de formulaire complet");
    }
  } else {
    throw new Error("la requette n'as pas de formulaire book");
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
      console.log('une image est envoyé !');
      break;

    default:
      throw new Error('Format du fichier non supporté');
  }
}

/** Ajoute un fichier au memoryStorage, vérifie sa présence, l'enregistre et retourne les erreurs.
 * @param {Object} req - Informations du livre envoyées par l'utilisateur.
 * @param {Object} res - Erreur survenue depuis la base de données ou créée.
 * @param {function} next - Passage au middleware suivant.
 *
 * @function deleteFile - Supprime un fichier de la base de données.
 * @function testFile - Vérifie si le fichier est bien une image.
 * @function addImage - Ajoute une image sur le serveur.
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
      console.log('Aucun fichier envoyé !');
      return next();
    }

    // Vérifie que toutes les données du formulaire sont présentes avant d'enregistrer le fichier sur le serveur
    testBookData(req);

    // Si la requête possède un paramètre, c'est une modification, donc suppression du fichier précédent
    if (req.params.id) {
      const book = await Book.findOne({ _id: req.params.id });
      await delateFile(book, req);
    }

    // Test si le fichier envoyer est une image, puis l'enregistre sur le serveur
    testFile(req);
    await addImage(req);
    next();
  } catch (error) {
    console.error('Erreur:', error);
    res.status(400).json({ message: error.message });
  }
};
