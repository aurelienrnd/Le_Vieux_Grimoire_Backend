// Importation des modules nécessaires
const http = require('http');
// Importation du fichier de configuration
const app = require('./app');

/** Vérifie la validité du port
 * @param {string} val - Une chaîne de caractères que l'on essaie de convertir en nombre
 * 
 * @returns {string} - Si la valeur ne peut pas être convertie en nombre
 * @returns {number} - Si la valeur est un nombre valide (supérieur ou égal à 0)
 * @returns {false} - Dans tous les autres cas
 */
const normalizePort = val => {
  const port = parseInt(val, 10); // Convertit la valeur en entier

  if (isNaN(port)) { // Si ce n'est pas un nombre, on retourne la valeur initiale
    return val;
  }
  if (port >= 0) { // // Si le nombre est valide (supérieur ou égal à 0), on le retourne
    return port;
  }
  return false; // Sinon, on retourne `false` pour signaler une erreur
};
// Détermine le port à utiliser (variable d'environnement ou 3000 par défaut)
const port = normalizePort(process.env.PORT ||'4000'); 
app.set('port', port); // Assigne la valeur du port à l'application Express

/** Gestion des erreurs du serveur
 * @param {Object} error - Objet représentant l'erreur générée
 */
const errorHandler = error => {
  if (error.syscall !== 'listen') { // Si l'erreur n'est pas liée au serveur, on la relance
    throw error;
  }

  const address = server.address(); // Récupère l'adresse/port du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // Détermine le mode d'écoute du serveur


  switch (error.code) {
    case 'EACCES': // Dans le cas ou le processus n'a pas les permissions nécessaires pour accéder au port
      console.error(bind + ' requires elevated privileges.'); // Affiche un message d'erreur dans la console.
      process.exit(1); // Arrête immédiatement le programme 
      break;

    case 'EADDRINUSE': // Dans le cas ou le port est déjà utilisée par un autre processus.
      console.error(bind + ' is already in use.'); // Affiche un message d'erreur dans la console.
      process.exit(1); // Arrête immédiatement le programme
      break;

    default:
      throw error; // Dans les autres cas, on relance l'erreur
  }
};

const server = http.createServer(app); //Crée un serveur HTTP en utilisant le fichier de fichier config app
server.on('error', errorHandler); // Ecoute ci une erreur ce produit et lance la fonction errorHandler
server.on('listening', () => { // Ecoute le server
  const address = server.address(); // Retourne l’adresse et le port sur lesquels le serveur écoute.
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; //Déterminer la manière dont le serveur écoute les connexions
  console.log('Listening on ' + bind); //Affiche dans la console où le serveur écoute.
});

server.listen(port); // Démarre le serveur et écoute les requêtes entrantes sur le port spécifié.