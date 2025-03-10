// Import modules
const bcrypt = require('bcrypt');
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
exports.addOneUser = async (req, res, next) => {
  try {
    // Hachage du mot de passe X10
    const hash = await bcrypt.hash(req.body.password, 10);

    // Création d'un nouvel objet user
    const user = new User({
      email: req.body.email,
      password: hash,
    });

    await user.save();
    console.log('Utilisateur ajouté a la base de données');
    res.status(201).json({ message: 'Profil créé' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/** Vérification des informations d'identification de l'utilisateur.
 * Renvoie l'_id de l'utilisateur depuis la base de données et un token web JSON signé
 * (contenant également l'_id de l'utilisateur).
 * Méthode : POST
 * Point d'accès : /api/auth/login
 * Authentification : Non requise
 * Body : { "email": "string", "password": "string" }
 * Réponse : { userId: string, token: string }
 */
exports.getOneUser = async (req, res, next) => {
  try {
    // Recherche de l'utilisateur avec l'email de la requête, si aucun n'est trouvé, une erreur est levée
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error({ message: 'Paire login/mot de passe incorrecte' });
    }

    // Déchiffrement et comparaison du mot de passe envoyé, si la comparaison echoue, une erreur est levée
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      throw new Error({ message: 'Paire login/mot de passe incorrecte' });
    }

    console.log('utilisateur connecté');
    res.status(200).json({
      userId: user._id,
      token: jwt.sign({ userId: user._id }, 'TOKEN-DE-TEST', {
        expiresIn: '24h',
      }),
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
