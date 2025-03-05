// Importation des modules nécessaires
const express = require('express');
const router = express.Router() // creation du routeur
// importation controleur
const bookControl = require('../controllers/book')
// importation middleware
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')


// liste des routes
router.get('/', bookControl.getAllBooks);
router.get('/:id', bookControl.getOneBook);

router.post('/',auth, multer.uploadMiddleware, multer.uploadImage ,bookControl.addOneBook);
router.put('/:id',auth, multer.uploadMiddleware, multer.uploadImage, bookControl.updateOneBook);
router.delete('/:id',auth, bookControl.delateOneBook);
router.post('/:id/rating', auth, bookControl.postRatting);

router.get('/bestrating', bookControl.getBestRatting);

module.exports = router;