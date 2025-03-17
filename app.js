// import modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // TODO expliqué

// Import routes
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// Création de l'application avec Express
const app = express();

// Connexion à MongoDB
mongoose
  .connect(
    'mongodb+srv://aurelien:exoOPen@cluster0.qxu0g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Traitement des requêtes avec un body au format JSON
app.use(express.json());

// Création de l'en-tête de chaque requête
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); //Autoriser toutes les origines
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  ); // Liste des headers que le frontend est autorisé à envoyer dans les requêtes.
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  ); //Spécifie les méthodes HTTP que le frontend est autorisé à utiliser
  next();
});

app.use('/api/books', booksRoutes); // Chemin vers le routeur Books
app.use('/api/auth', userRoutes); // Chemin vers le routeur Auth
app.use('/images', express.static(path.join(__dirname, 'images'))); //Chemin vers le dossier images

module.exports = app;
