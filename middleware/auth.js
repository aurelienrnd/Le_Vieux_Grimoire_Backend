// Import modules
const jwt = require('jsonwebtoken');
// Import modèles
const User = require('../models/user');

/** Décode le token en userId, puis l'ajoute à la requête
 * @param {Object} req - Header : authorization
 * @param {Object} res - Erreur survenue depuis la base de données ou créée.
 * @param {function} next - Passage au middleware suivant.
 */
module.exports = async (req, res, next) => {
  try {
    // Récupération du token et envoi d'une erreur si non trouvé
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      console.log('Empty authorization');
      throw new Error();
    }

    // Décodage du token en userId
    const decodedToken = jwt.verify(token, 'TOKEN-DE-TEST');
    const userId = decodedToken.userId;

    // Recherche du userId dans la base de données et envoi d'une réponse si l'utilisateur n'est pas trouvé
    const user = await User.findOne({ _id: userId });
    if (!user) {
      console.log('user not found');
      throw new Error();
    }

    // Ajout de userId à la requête
    req.auth = { userId: userId };
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ error: 'Not authorized' });
  }
};
