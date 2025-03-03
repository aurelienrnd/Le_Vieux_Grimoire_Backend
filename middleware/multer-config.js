//Import modules
const multer = require('multer');

//tableaux des diférente extention pour les images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// config multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'image'); // indique ou enregistrer les fichiers
  },

  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); //supression des espace dans le non du fichier
    const extension = MIME_TYPES[file.mimetype]; // determine l'extenssion a utiliser
    callback(null, name + Date.now() + '.' + extension); // ccreation du nom du fichier
  }
});

module.exports = multer({storage: storage}).single('image');
