// Importation des modules nécessaires
const express = require('express');
// importation controler
const userControl = require('../controllers/user');


const router = express.Router() // creation du routeur

// liste routes
router.post('/signup', userControl.addOneUser);
router.post('/login', userControl.getOneUser);

module.exports = router;