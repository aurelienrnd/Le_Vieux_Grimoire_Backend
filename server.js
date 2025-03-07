// import modules
const http = require('http');

// Importation du fichier de configuration
const app = require('./app');

/** Vérifie la validité du port.
 * @param {string} val - Une chaîne de caractères que l'on essaie de convertir en nombre.
 * 
 * @returns {string} - Si la valeur ne peut pas être convertie en nombre.
 * @returns {number} - Si la valeur est un nombre valide (supérieur ou égal à 0).
 * @returns {false} - Dans tous les autres cas.
 */
const normalizePort = val => {
  // Convertit la valeur du port en entier
  const port = parseInt(val, 10); 

  // Si ce n'est pas un nombre, on retourne la valeur initiale
  if (isNaN(port)) { 
    return val;
  }

  // Si le nombre est valide (supérieur ou égal à 0), on le retourne
  if (port >= 0) { 
    return port;
  }

  // Sinon, on retourne `false` pour signaler une erreur
  return false; 
};

// Détermine le port à utiliser puis assigne la valeur du port à l'application Express
const port = normalizePort(process.env.PORT ||'4000'); 
app.set('port', port);

/** Gestion des erreurs du serveur.
 * @param {Object} error - Objet représentant l'erreur générée.
 */
const errorHandler = error => {

  // Si l'erreur n'est pas liée au serveur, on la relance
  if (error.syscall !== 'listen') { 
    throw error;
  }

  // Récupère l'adresse du serveur puis détermine le mode d'écoute du serveur
  const address = server.address(); 
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  // Pour chaque erreur
  switch (error.code) {

    // Si le processus n'a pas les permissions nécessaires pour accéder au port, arrêt du programme 
    case 'EACCES': 
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
    break;

    // Dans le cas ou le port est déjà utilisée par un autre processus, arrêt du programme
    case 'EADDRINUSE': 
      console.error(bind + ' is already in use.');
      process.exit(1);
    break;

    // Dans les autres cas, on relance l'erreur
    default:
    throw error; 
  }
};

//Crée un serveur HTTP en utilisant app.js
const server = http.createServer(app); 

// Ecoute ci une erreur ce produit et lance la fonction errorHandler
server.on('error', errorHandler); 

// Ecoute le server
server.on('listening', () => { 
  // Retourne l’adresse et le port puis déterminer la manière dont le serveur écoute les connexions.
  const address = server.address(); 
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; 
  console.log('Listening on ' + bind);
});

// Démarre le serveur et écoute les requêtes entrantes sur le port spécifié.
server.listen(port); 