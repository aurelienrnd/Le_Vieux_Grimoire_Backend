// import modules
const express = require('express');
// import controleurs
const userControl = require('../controllers/user');

// creation du routeur
const router = express.Router();

/** Hachage du mot de passe de l'utilisateur et ajout de l'utilisateur à la base de données.
 * Méthode : POST
 * Point d'accès : /api/auth/signup
 * Authentification : Non requise
 * Body : { "email": "string", "password": "string" }
 * Réponse : { message: string }
 */
router.post('/signup', userControl.addOneUser);

/** Vérification des informations d'identification de l'utilisateur.
 Renvoie l'_id de l'utilisateur depuis la base de données et un token web JSON signé
 (contenant également l'_id de l'utilisateur).
 * Méthode : POST
 * Point d'accès : /api/auth/login
 * Authentification : Non requise
 * Body : { "email": "string", "password": "string" }
 * Réponse : { userId: string, token: string }
 */
router.post('/login', userControl.getOneUser);

module.exports = router;
