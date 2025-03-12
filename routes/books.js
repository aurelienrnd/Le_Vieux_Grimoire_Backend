// import modules
const express = require('express');
// import controleurs
const bookControl = require('../controllers/book');
// import middlewares
const auth = require('../middleware/auth');
const uploadFile = require('../middleware/upload_file');

// Creation du routeur
const router = express.Router();

/** Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
 * Méthode : GET
 * Point d'accès : /api/books/bestrating
 * Authentification : Non requise
 * Body :
 * Réponse : Array of books
 */
router.get('/bestrating', bookControl.getBestRatting);

/** Renvoie un tableau de tous les livres de la base de données.
 * Méthode : GET
 * Point d'accès : /api/books
 * Authentification : Non requise
 * Body :
 * Réponse : Array of books
 */
router.get('/', bookControl.getAllBooks);

/** Renvoie le livre avec l’_id fourni.
 * Méthode : GET
 * Point d'accès : /api/books/:id
 * Authentification : Non requise
 * Body :
 * Réponse : Livre unique
 */
router.get('/:id', bookControl.getOneBook);

/** Capture et enregistre l'images, analyse le livre transformé en chaîne de caractères, 
  l'enregistre dans la base de données en définissant correctement son imageUrl.
  Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. 
 * Méthode : POST
 * Point d'accès : /api/books 
 * Authentification : Requise
 * Body : { book: string, image: file }
 * Réponse : { message: String }
 */
router.post('/', auth, uploadFile, bookControl.addOneBook);

/** Met à jour le livre avec l'_id fourni. Si une image est téléchargée, 
  elle est capturée et l’imageUrl du livre est mise à jour. 
  Si aucun fichier n'est fourni, les informations du livre se trouvent directement
  dans le corps de la requête (req.body.title, req.body.author, etc.). 
  Si un fichier est fourni, le livre transformé en chaîne de caractères se trouve dans req.body.book.
 * Méthode : PUT
 * Point d'accès : /api/books/:id
 * Authentification : Requise
 * Body : Soit un livre en JSON, soit { book: string, image: file }
 * Réponse : { message: string }
 */
router.put('/:id', auth, uploadFile, bookControl.updateOneBook);

/** Supprime le livre avec l'_id fourni ainsi que l’image associée.
 * Méthode : DELETE
 * Point d'accès : /api/books/:id
 * Authentification : Requise
 * Body :
 * Réponse : { message: String }
 */
router.delete('/:id', auth, bookControl.delateOneBook);

/** Définit la note pour l'user ID fourni. La note doit être comprise entre 0 et 5.
 * L'ID de l'utilisateur et la note doivent être ajoutés au tableau "rating".
 * Afin d'empêcher un utilisateur de noter deux fois le même livre,
 * il n’est pas possible de modifier une note existante.
 * La note moyenne "averageRating" doit être tenue à jour,
 * et le livre doit être renvoyé en réponse à la requête.
 * Méthode : POST
 * Point d'accès : /api/books/:id/rating
 * Authentification : Requise
 * Body : { "userId": "String", "rating": "Number" }
 * Réponse : Single book
 */
router.post('/:id/rating', auth, bookControl.postRatting);

module.exports = router;
