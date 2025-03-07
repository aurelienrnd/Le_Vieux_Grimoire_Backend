// import modules
const fs = require('fs');
// importation des model
const Book = require('../models/book');
const book = require('../models/book');


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

  // Utilisation du paramaitre de la requette pour retrouver un livre
  Book.findOne({ _id: req.params.id})
  .then(book => {

    /* Si le livre n'existe pas, on retourne une erreur 404*/
    if(!book){
      return res.status(404).json({ error: "Ce livre n'existe pas" });
    }

    res.status(200).json(book)
  })
  .catch(error => res.status(400).json({error}))
}


/** Capture et enregistre l'image analyse le livre transformé en chaîne de caractères, 
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
  const reqData = JSON.parse(req.body.book)
  delete reqData._id // pour le supprimer ci un id est rajouter 
  delete reqData._userId // pour le supprimer ci un id est rajouter

  // Le createur du livre peut t'il notées le livre qu'il vien de creer?
  
  // Creet un nouvelle objet book avec userId et imageUrl a jours
  const book = new Book({ 
    ...reqData,
    userId: req.auth.userId,
    imageUrl:`${req.protocol}://${req.get('host')}/image/${req.file.filename}`
  })
  
  book.save()
  .then(() => res.status(201).json({message:'livre ajouté'}))
  .catch(error => {res.status(400).json( error.message )})
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
  // Recupaire la requette contenant les element a modifier
  const dataUpdate = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/image/${req.file.filename}`,
  } : {
      ...req.body,
  };

  // Recupaire le livre corespondant au params.id dans la base de donnais
  Book.findOne({ _id: req.params.id })
  .then(book => {

    // Si le livre n'est pas trouvé alors je retourne une erreur
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Je modifie les données contenue dans book
    return Book.updateOne({ _id: req.params.id }, { ...dataUpdate })
  })
  .then( res.status(200).json({ message: "Livre modifié" }))
  .catch(error => { res.status(500).json({ error: error.message })});
} 


/** Supprime le livre avec l'_id fourni ainsi que l’image associée.
 * Methode : DELETE
 * Point d'accès : /api/books/:id
 * Authentification : Requis
 * Body : 
 * Réponse : { message: String }
 */
exports.delateOneBook = (req, res, next) => {

  // Utilisation du paramaitre de la requette pour retrouver un livre
  Book.findOne({ _id: req.params.id})
  .then(book => {

    // Si book est null, on renvoie un erreur 400
    if(!book){ 
      res.status(400).json({ error: "Ce livre a deja était supprimer" });
    }

    // verifie que le user Id du livre est le meme que celuis de la requette
    if(book.userId != req.auth.userId) {
      return res.status(401).json('not authorized')
    }

    // Supprime le livre
    const delateFile = book.imageUrl.split('/image/')[1]
    fs.unlink(`image/${delateFile}`, () => {
      book.deleteOne()
      .then(res.status(200).json("Suppression reussie"))
      .catch(error => res.status(400).json({error}))
    })
    
  })
  .catch(error => res.status(400).json({error}))
}


/** Définit la note pour le user ID fourni. La note doit être comprise entre 0 et 5.
 L'ID de l'utilisateur et la note doivent être ajoutés au tableau "rating" 
 Afin de ne pas laisser un utilisateur noter deux fois le même livre il 
 n’est pas possible de modifier une note.
 La note moyenne "averageRating" doit être tenue à jour, et le livre renvoyé en réponse de la requête.
 * Methode : POST
 * Point d'accès : /api/books/:id/rating
 * Authentification : Requis
 * Body : { "userId": "String", "rating": "Number" }
 * Réponse : Single book
 */
exports.postRatting =  (req, res, next) => {

  // Utilisation du paramaitre de la requette pour retrouver un livre 
  Book.findOne({ _id: req.params.id})
  .then(book => {

    // Si le livre n'est pas trouvé alors je retourne une erreur
    if (!book) {
      return res.status(400).json({ message: "Livre non trouvé" });
    }

    // Comparaison chaque userId du tableaux ratings au userId de la requette
    book.ratings.forEach(rating => {
      if(rating.userId === req.auth.userId) {
        return res.status(400).json({ message: "L'utilisateur a deja noté ce livre" });
      }
    })
    
    // Si la note est comprise entre  0 et 5 alors on la rajoute a book
    if(req.body.rating > 0 && req.body.rating < 5){
      book.ratings.push({ userId : req.body.userId, grade : req.body.rating})
    } else {
      return res.status(400).json("La note doit être comprise entre 0 et 5")
    }

    // Recupereration de chaque note du livre pour en faire la moyenne est arondie
    let index = 0
    book.ratings.forEach(rating => {
      index += rating.grade
    });
    book.averageRating = parseFloat((index / book.ratings.length).toFixed(2))

    book.save()
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({error}))
  })
  .catch(error => res.status(401).json({error}))
}


/** Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
 * Methode : GET 
 * Point d'accès : /api/books/bestrating 
 * Authentification : Non requis 
 * Body :
 * Réponse : Array of books
 */
exports.getBestRatting = (req, res, next) => {

  // recupaire la liste de livre
  Book.find()

  // Trie la liste de livre est decoupe les 3 premier elements
  .then(books => {
    const booksList = [...books].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3)
    res.status(200).json(booksList);
  })

  .catch(error => res.status(401).json(error.message))
}






