const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async(req, res, next) => {
  try {
    // Recuperation du Token et envoie d'une rep 401 ci non trouvé
    const token = req.headers.authorization.split(' ')[1];
    if(!token) {
      return res.status(401).json( 'Token manquant' )
    }

    // Decodage du Token en userId
    const decodedToken = jwt.verify(token, 'TOKEN-DE-TEST');
    const userId = decodedToken.userId;

    // Recherche du userId dans la base de données et envoie d'une rep si l'utilisateur n'est pas trouvé
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(401).json( {error : "Utilisateur non trouvé" }  )
    }

    //Ajout de userId a la requette
    req.auth = { userId: userId };
    next()

   } catch(error) {
    res.status(401).json( error.message );
   }
};