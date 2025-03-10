// Import modules
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
// Import modèles
const User = require('../models/user');

/** Hachage du mot de passe de l'utilisateur et ajout de l'utilisateur à la base de données.
 * Méthode : POST 
 * Point d'accès : /api/auth/signup
 * Authentification : Non requise 
 * Body : { "email": "string", "password": "string" }
 * Réponse : { message: string }
 */
exports.addOneUser = (req, res, next) => {
  // Hachage du mot de passe X10
  bcrypt.hash(req.body.password, 10)
  .then(hash => {

    // Création d'un nouvel objet user
    const user = new User({
      email: req.body.email,
      password: hash
    })

    user.save()
    .then(() => {
      console.log('Utilisateur ajouté a la base de données');
      res.status(201).json({message: "Profil créé"})
    })
    .catch(error => res.status(400).json({error}))
  })
  .catch(error => res.status(400).json({error}))
}

/** Vérification des informations d'identification de l'utilisateur.
 * Renvoie l'_id de l'utilisateur depuis la base de données et un token web JSON signé
 * (contenant également l'_id de l'utilisateur).
 * Méthode : POST 
 * Point d'accès : /api/auth/login
 * Authentification : Non requise 
 * Body : { "email": "string", "password": "string" }
 * Réponse : { userId: string, token: string }
 */
exports.getOneUser = (req, res, next) => {

  // Recherche de l'utilisateur correspondant à l'email de la requête
  User.findOne({ email: req.body.email })
  .then(user => {

    // Si aucun utilisateur n'est trouvé, envoi d'une réponse 401 (non autorisé)
    if (!user) {
      return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
    }

    // Déchiffrement et comparaison du mot de passe envoyé par la requête avec celui de l'utilisateur 
    bcrypt.compare(req.body.password, user.password)
    .then(valid => {

      // Si le déchiffrement n'est pas valide, envoi d'une réponse 401
      if (!valid) {
        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
      }

      console.log('utilisateur connecté')
      res.status(200).json(
        {
          userId: user._id, 
          token: jwt.sign({userId: user._id}, 'TOKEN-DE-TEST', {expiresIn: '24h'})
        }
      )
    })
    .catch(error => res.status(402).json(error.message))
  })
  .catch(error => res.status(403).json(error.message))
}




