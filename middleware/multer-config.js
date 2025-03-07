// Import modules
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Stockage en mémoire (RAM)
const memoryStorage = multer.memoryStorage(); // Crée un espace de stockage temporaire
const upload = multer({ storage: memoryStorage }); // Indique que Multer doit utiliser le memoryStorage
exports.uploadMiddleware = upload.single('image') // Ajoute le fichier contenant le champ image au memoryStorage

/* Sauvegarde une image sur le serveur */
exports.uploadImage = async (req, res, next) => {
  try {
    // Si la requête ne possède pas de fichier, on passe directement au middleware suivant
    if (!req.file) {
      console.log("Aucun fichier envoyé !")
      return next()
    } else{ console.log("Un fichier est envoyé !") }

    // Renomme le nom du nouveau fichier dans la requête pour le réutiliser dans le middleware suivant
    const originaFileName = req.file.originalname.split(" ").join("_").split(".")[0] 
    const newFileName = `${Date.now()}-${originaFileName}.webp`
    req.file.filename = newFileName
    // Puis crée le chemin du fichier
    const uploadDir = path.resolve(__dirname, "../image/")
    const filePath = path.join(uploadDir, newFileName)

    // Vérifie que le dossier où enregistrer le fichier existe et le crée si besoin
    fs.mkdir(uploadDir, { recursive: true }, (error) => {
      if (error){
        return console.error(error);
      }
      console.log("folder image crée")
    })

    // Modifie la taille et le format du fichier
    await sharp(req.file.buffer)
      .resize({ width: 206, height: 260, fit: "contain", background:'transparent' })
      .toFormat("webp")
      .toFile(filePath)
    console.log("fichier ajouté");

    //TODO Supprime le fichier précédent

    next()

  } catch (error) {
    res.status(500).send(error.message );
  }
};
