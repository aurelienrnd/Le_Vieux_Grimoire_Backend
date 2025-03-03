// Importation des modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Importation des routes
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const app = express(); // Création de l'application Express

// connextion a mongodb
mongoose.connect("mongodb+srv://aurelien:exoOPen@cluster0.qxu0g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true,
  useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json()); // Traiter des requêtes avec un body JSON

// Creation de l'entet de chaque requette 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); //Autoriser toutes les origines 
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Liste des headers que le frontend est autorisé à envoyer dans les requêtes.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //Spécifie les méthodes HTTP que le frontend est autorisé à utiliser
  next();
});

app.use('/api/books', booksRoutes); // chemin vers le router Books
app.use('/api/auth', userRoutes) // chemin vers le router Auth
app.use('/image', express.static(path.join(__dirname, 'image'))); //chemin vers le dossier

module.exports = app;