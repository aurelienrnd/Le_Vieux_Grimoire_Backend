// Import des modules
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Stocker en mémoire (RAM)
const memoryStorage = multer.memoryStorage(); // crée un espace de stockage temporaire
const upload = multer({ storage: memoryStorage }); // indique multer dois utiliser le memoryStorage
exports.uploadMiddleware = upload.single('image') // ajoute le file contenent le champ image au memoryStorage

exports.uploadImage = async (req, res, next) => {
  try {
    // Si la requette ne possède pas de fichier je passe directement au midelware suivant
    if (!req.file) {
      console.log("Aucun fichier envoyé !")
      return next()
    } else{ console.log("Un fichier est envoyé !") }

    // Renome le non du nouveaux fichier dans la requette pour le reutiliser dans midelware suivant
    const originaFileName = req.file.originalname.split(" ").join("_").split(".")[0] 
    const newFileName = `${Date.now()}-${originaFileName}.webp`
    req.file.filename = newFileName
    // Puis cree le path du fichier
    const uploadDir = path.resolve(__dirname, "../image/")
    const filePath = path.join(uploadDir, newFileName)

    // Verifie que le dossier ou enregistrer le fichier existe et le creer ci besoin
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

    // Supprime le fichier precedent
    next()

  } catch (error) {
    res.status(500).send(error.message );
  }
};
