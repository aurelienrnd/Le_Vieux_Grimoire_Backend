//import module
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

// Définition du schenma
const userSchema = mongoose.Schema({ 
  email: {type: String, required: true, unique: true}, // Adresse e-mail de l’utilisateur [unique]
  password: {type: String, required: true}// Mot de passe haché de l’utilisateur
});

userSchema.plugin(uniqueValidator) // utilisation de uniqueValidator

module.exports = mongoose.model('User', userSchema); // Crée un modèle basé sur le schéma et l'export