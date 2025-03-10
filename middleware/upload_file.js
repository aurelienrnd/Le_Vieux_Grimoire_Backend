// Import modules
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;


// Stockage en mémoire (RAM)
const memoryStorage = multer.memoryStorage(); // Crée un espace de stockage temporaire
const upload = multer({ storage: memoryStorage }); // Indique que Multer doit utiliser le memoryStorage


/* Modifie la taille et le format de l'image puis la sauvegarde sur le serveur */
const saveImage = async(req, res, filePath) => {
  try{
    await sharp(req.file.buffer)
    .resize({ width: 206, height: 260, fit: "contain", background:'transparent' })
    .toFormat("webp")
    .toFile(filePath)
  console.log("fichier ajouté")
  } catch (error) {
    throw error
  }
}

//TODO Es ce un probleme ci j'utilise await sur ce fichier et then catch sur les autres ?

/* Ajoute une image sur le serveur */
const addImage = async(req, res, next) => {
  try{
    // Renomme le nom du nouveau fichier dans la requête pour le réutiliser dans le middleware suivant
    const originaFileName = req.file.originalname.split(" ").join("_").split(".")[0] 
    const newFileName = `${Date.now()}-${originaFileName}.webp`
    req.file.filename = newFileName
    // Puis crée le chemin du fichier
    const uploadDir = path.resolve(__dirname, "../images/")
    const filePath = path.join(uploadDir, newFileName)

    // Vérifie que le dossier où enregistrer le fichier existe et le crée si besoin
    await fs.mkdir(uploadDir, { recursive: true })
    console.log("folder images crée")

    // TODO supprime l'encienne image

    // Sauvegarde une image sur le serveur
    await saveImage(req, res, filePath)

  } catch (error) {
    throw error
  }
}

/* Test ci le fichier est bien une image */
const testFile = (req, res, next) => {
  switch (req.file.mimetype) {
    case "image/jpeg":
    case "image/jpg":
    case "image/png":
    case "image/webp":
      console.log("une image est envoyé !")
    break
  
    default:
    throw new Error("Format du fichier non supporté.");
  }
}


module.exports = async (req, res, next) => {
  try{
    // Ajoute le fichier contenant le champ image au memoryStorage
    await new Promise((resolve, reject) => { //NOTE Creation d'une promesse pour recupere les erreur avec try catch 
      upload.single('image')(req, res, (err) => {
        if (err) return reject(err);
          resolve();
      });
    });

    // Test la presence d'un fichier
    if(!req.file){
      console.log("Aucun fichier envoyé !")
      return next()
    }

    // Test ci le fichier envoyer est une image, puis l'enregistre sur le serveur
    testFile(req, res, next)
    await addImage(req, res, next)
    next()

  } catch (error) {
    console.error("Erreur:", error);
    return res.status(401).json({ message: error.message });
  }
}