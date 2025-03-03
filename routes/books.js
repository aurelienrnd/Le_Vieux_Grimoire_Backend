// Importation des modules nécessaires
const express = require('express');
const router = express.Router() // creation du routeur
// importation controleur
const bookControl = require('../controllers/book')
const auth = require('../middleware/auth')



// liste des routes
router.get('/', bookControl.getAllBooks);
router.get('/:id', bookControl.getOneBook);

router.post('/',auth, bookControl.addOneBook);
router.put('/:id',auth, bookControl.updateOneBook);
router.delete('/:id',auth, bookControl.delateOneBook);
router.post('/:id/rating', auth, bookControl.postRatting);

router.get('/bestrating', bookControl.getBestRatting);

module.exports = router;