// importation des model
const Book = require('../models/book');

/** Renvoie un tableau de tous les livres de la base de données.
 * Methode : GET 
 * Point d'accès : /api/books 
 * Authentification : Non requis 
 * Body :
 * Réponse : Array of books 
 */
exports.getAllBooks = (req, res, next) => {
  Book.find()

  .then(books => res.status(200).json(books))
  .catch(error => res.status(400).json({error}))
}

/** Renvoie le livre avec l’_id fourni.
 * Methode : GET 
 * Point d'accès : /api/books/:id 
 * Authentification : Non requis 
 * Body :
 * Réponse : Single book 
 */
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then(book => {
      /* mongoose renvoie null avec status 200 quand on tente de recupere un livre supprimer.
      Solution: tester book*/
      if(!book){ // Si book est null, on renvoie un erreur 404
        res.status(404).json({ error: "Ce livre a était supprimer" });

      } else { // Autrement on le renvoie avec un status 200
        res.status(200).json(book)
      }
    })
    .catch(error => res.status(400).json({error}))
}

/** Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, 
  l'enregistre dans la base de données en définissant correctement son ImageUrl.
  Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. 
  Remarquez que le corps de la demande initiale est vide ; lorsque Multer est ajouté, 
  il renvoie une chaîne pour le corps de la demande en fonction des données soumises avec le fichier.
 * Methode : POST
 * Point d'accès : /api/books 
 * Authentification : Requis
 * Body : { book: string, image: file }
 * Réponse : { message: String } Verb
 */
exports.addOneBook = (req, res, next) => {
    delete req.body._id;
    const book = new Book({
      ...req.body
    })
    book.save()
    .then(() => res.status(201).json({ message: "Livre ajouté !" }) )
    .catch(error => res.status(400).json({error}))
}

/** Met à jour le livre avec l'_id fourni. Si une image est téléchargée, 
  elle est capturée, et l’ImageUrl du livre est mise à jour. 
  Si aucun fichier n'est fourni, les informations sur le livre se trouvent directement
  dans le corps de la requête (req.body.title, req.body.author, etc.). 
  Si un fichier est fourni, le livre transformé en chaîne de caractères se trouve dans req.body.book.
  Notez que le corps de la demande initiale est vide ; lorsque Multer est ajouté, 
  il renvoie une chaîne du corps de la demande basée sur les données soumises avec le fichier.
 * Methode : PUT
 * Point d'accès : /api/books/:id
 * Authentification : Requis
 * Body : EITHER Book as JSON OR { book: string, image: file }
 * Réponse : { message: String }
 */
exports.updateOneBook = (req, res, next) => {
    Book.updateOne({ _id: req.params.id}, {...req.body, _id:req.params.id})
    .then(book => res.status(200).json("Modificaction reussie"))
    .catch(error => res.status(400).json({error}))
}

/** Supprime le livre avec l'_id fourni ainsi que l’image associée.
 * Methode : DELETE
 * Point d'accès : /api/books/:id
 * Authentification : Requis
 * Body : 
 * Réponse : { message: String }
 */
exports.delateOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
  .then(book => {
    if(!book){ // Si book est null, on renvoie un erreur 400
      res.status(400).json({ error: "Ce livre a deja était supprimer" });
    }
    book.deleteOne()
    .then(book => res.status(200).json("Suppression reussie"))
    .catch(error => res.status(400).json({error}))

  })
  .catch(error => res.status(400).json({error}))
}

/** Définit la note pour le user ID fourni. La note doit être comprise entre 0 et 5.
  L'ID de l'utilisateur et la note doivent être ajoutés au tableau "rating" 
  afin de ne pas laisser un utilisateur noter deux fois le même livre.
  Il n’est pas possible de modifier une note.
  La note moyenne "averageRating" doit être tenue à jour, et le livre renvoyé en réponse de la requête.
 * Methode : POST
 * Point d'accès : /api/books/:id/rating
 * Authentification : Requis
 * Body : { "userId": "String", "rating": "Number" }
 * Réponse : Single book
 */
exports.postRatting =  (req, res, next) => {
    console.log('requette envoyer')
    console.log(req.body);
          
    res.status(200).json("Single book");
}

/** Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
 * Methode : GET 
 * Point d'accès : /api/books/bestrating 
 * Authentification : Non requis 
 * Body :
 * Réponse : Array of books
 */
exports.getBestRatting = (req, res, next) => {
    console.log('requette envoyer')
    res.status(200).json(["Array of books"]);
}