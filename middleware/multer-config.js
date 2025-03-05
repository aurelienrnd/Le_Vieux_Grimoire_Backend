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
    if (!req.file) {
      return res.status(400).send("Aucun fichier envoyé !");
    }

    const uploadDir = path.resolve(__dirname, "../image/")
    const originaFileName = req.file.originalname.split(" ").join("_").split(".")[0]
    const newFileName = `${Date.now()}-${originaFileName}.webp`
    req.file.filename = newFileName
    const filePath = path.join(uploadDir, newFileName)

    fs.mkdir(uploadDir, { recursive: true }, (error) => {
      if (error){
        return console.error(error);
      }
      console.log("dossier crée")
    })

    await sharp(req.file.buffer)
      // TODO sizing
      .toFormat("webp")
      .toFile(filePath)
    next()

  } catch (error) {
    res.status(500).send(error.message );
  }
};cd 
