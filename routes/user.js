// import modules
const express = require('express');
// import controleurs
const userControl = require('../controllers/user');


const router = express.Router() // creation du routeur

// Liste routes
router.post('/signup', userControl.addOneUser);
router.post('/login', userControl.getOneUser);

module.exports = router;