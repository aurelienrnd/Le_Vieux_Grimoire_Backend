// Import modules
const mongoose = require('mongoose');

// Définition du schéma
const bookSchema = mongoose.Schema({
  userId:{type: String, required: true}, 
  title: { type: String, required: true }, 
  author: {type: String, required: true}, 
  imageUrl:{type: String, required: true}, 
  year:{type: Number, required: true}, 
  genre:{type: String, required: true}, 
  ratings: [
    {
      userId:{type: String}, 
      grade: {type: Number} 
    }
  ],
  averageRating: {type: Number} 
});

// Crée un modèle basé sur le schéma et l'exporte
module.exports = mongoose.model('Book', bookSchema); 