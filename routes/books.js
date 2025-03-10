// import modules
const express = require('express');
// import controleurs
const bookControl = require('../controllers/book')
// import middlewares
const auth = require('../middleware/auth')
const uploadFile = require('../middleware/upload_file')

// Creation du routeur
const router = express.Router() 

// Liste des routes
router.get('/bestrating', bookControl.getBestRatting);
router.get('/', bookControl.getAllBooks);
router.get('/:id', bookControl.getOneBook);
router.post('/',auth, uploadFile ,bookControl.addOneBook);
router.put('/:id',auth, uploadFile, bookControl.updateOneBook);
router.delete('/:id',auth, bookControl.delateOneBook);
router.post('/:id/rating', auth, bookControl.postRatting);

module.exports = router;