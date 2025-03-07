//import modules
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

// Définition du schenma
const userSchema = mongoose.Schema({ 
  email: {type: String, required: true, unique: true}, 
  password: {type: String, required: true}
});

// Utilisation de uniqueValidator
userSchema.plugin(uniqueValidator) 

// Crée un modèle basé sur le schéma et l'exporte
module.exports = mongoose.model('User', userSchema); 