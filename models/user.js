//import modules
const mongoose = require('mongoose');

// Définition du schenma
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    //NOTE - Utilisation de la fonction Validator, car uniqueValidator n'est plus supporté par la dernière version de Mongoose.
    validate: {
      validator: async function (value) {
        const existingUser = await this.constructor.findOne({ email: value });
        return !existingUser;
      },
    },
  },
  password: { type: String, required: true },
});

// Crée un modèle basé sur le schéma et l'exporte
module.exports = mongoose.model('User', userSchema);
