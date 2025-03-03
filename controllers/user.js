// import modul
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
// importation des models
const User = require('../models/user');

/** Hachage du mot de passe de l'utilisateur et ajout de l'utilisateur à la base de données.
 * Methode : POST 
 * Point d'accès : /api/auth/signup
 * Authentification : Non requis 
 * Body : { "email": "string", "password": "string" }
 * Réponse : { message: string }
 */
exports.addOneUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    })
    user.save()
    .then(() => res.status(201).json({message: "profil creer"}))
    .catch(error => res.status(400).json({error}))
  })
  .catch(error => res.status(400).json({error}))
}

/** Vérification des informations d'identification de l'utilisateur
  renvoie l’_id de l'utilisateur depuis la base de données et un token web JSON signé
  (contenant également l'_id de l'utilisateur).
  * Methode : POST 
  * Point d'accès : /api/auth/login
  * Authentification : Non requis 
  * Body : { "email": "string", "password": "string" }
  * Réponse : { userId: string, token: string }
  */
exports.getOneUser = (req, res, next) => {
  User.findOne({ email: req.body.email })
  .then(user => {
    if (!user) {
      res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
    }

    bcrypt.compare(req.body.password, user.password)
    .then(valid => {
      if (!valid) {
        res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
      }

      res.status(200).json(
        {
          userId: user._id, 
          token: jwt.sign(
            {userId: user._id},
            'TOKEN-DE-TEST',
            {expiresIn: '24h'}
          )
        });
    })
    .catch(error => res.status(402).json(error.message))
  })
  .catch(error => res.status(403).json(error.message))
}



