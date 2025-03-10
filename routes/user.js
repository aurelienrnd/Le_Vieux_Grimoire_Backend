// import modules
const express = require('express');
// import controleurs
const userControl = require('../controllers/user');

// creation du routeur
const router = express.Router() 

// Liste routes
router.post('/signup', userControl.addOneUser);
router.post('/login', userControl.getOneUser);

module.exports = router;