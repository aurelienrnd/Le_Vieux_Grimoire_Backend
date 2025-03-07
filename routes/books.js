// import modules
const express = require('express');
const router = express.Router() // creation du routeur
// import controleurs
const bookControl = require('../controllers/book')
// import middlewares
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

// Liste des routes
router.get('/bestrating', bookControl.getBestRatting);
router.get('/', bookControl.getAllBooks);
router.get('/:id', bookControl.getOneBook);
router.post('/',auth, multer.uploadMiddleware, multer.uploadImage ,bookControl.addOneBook);
router.put('/:id',auth, multer.uploadMiddleware, multer.uploadImage, bookControl.updateOneBook);
router.delete('/:id',auth, bookControl.delateOneBook);
router.post('/:id/rating', auth, bookControl.postRatting);

module.exports = router;