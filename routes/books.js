// Importation des modules nécessaires
const express = require('express');
// importation controleur
const bookControl = require('../controllers/book')

const router = express.Router() // creation du routeur

// liste des routes
router.get('/', bookControl.getAllBooks);
router.get('/:id', bookControl.getOneBook);
router.post('/', bookControl.addOneBook);
router.put('/:id', bookControl.updateOneBook);
router.delete('/:id', bookControl.delateOneBook);
router.post('/:id/rating', bookControl.postRatting);
router.get('/bestrating', bookControl.getBestRatting);

module.exports = router;