// Import modules
const fs = require('fs');
// Import modèles
const Book = require('../models/book');
// Import fonction
const {findBook, userAuthorization, delateFile} = require('../functions.js')

/** Renvoie un tableau de tous les livres de la base de données.
 * Méthode : GET 
 * Point d'accès : /api/books 
 * Authentification : Non requise 
 * Body :
 * Réponse : Tableau de livres
 */
exports.getAllBooks = (req, res, next) => {
  Book.find()
  .then(books => {
    console.log("La listes des livres a etait recuperé")
    res.status(200).json(books)
  })
  .catch(error => {
    console.log("La listes des n'a pas etait trouvée")
    res.status(400).json({error})
  })
}


/** Renvoie le livre avec l’_id fourni.
 * Méthode : GET 
 * Point d'accès : /api/books/:id 
 * Authentification : Non requise 
 * Body :
 * Réponse : Livre unique
 */
exports.getOneBook = (req, res, next) => {

  // Utilisation du paramètre de la requête pour retrouver un livre
  Book.findOne({ _id: req.params.id})
  .then(book => {

    // Si le livre n'existe pas, retourner une erreur 404
    findBook(book)

    console.log('Le livre a etait recuperé');
    res.status(200).json(book)
  })
  .catch(error => {
    res.status(409).json(error.message)
  })
}


/** Capture et enregistre l'images, analyse le livre transformé en chaîne de caractères, 
  l'enregistre dans la base de données en définissant correctement son imageUrl.
  Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. 
  Remarquez que le corps de la requête initiale est vide ; lorsque Multer est ajouté, 
  il renvoie une chaîne pour le corps de la requête en fonction des données soumises avec le fichier.
 * Méthode : POST
 * Point d'accès : /api/books 
 * Authentification : Requise
 * Body : { book: string, image: file }
 * Réponse : { message: String }
 */
exports.addOneBook = (req, res, next) => {
  // Ont la transforme en objet JS car la requette est passé par Multer
  const reqData = JSON.parse(req.body.book)

  //TODO A rajouter sur toute les requettes qui ecrive dans la dataBase?
  //  Suppression des _id possiblement ajoutés dans la requête
  delete reqData._id
  delete reqData._userId

  //TODO Le créateur du livre peut-il noter le livre qu'il vient de créer ?
  
  // Crée un nouvel objet book avec userId et imageUrl à jour
  const book = new Book({ 
    ...reqData,
    userId: req.auth.userId,
    imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  
  book.save()
  .then(() => {
    console.log('Le livre a etait ajouté')
    res.status(201).json({message:'Livre ajouté'})
  })
  .catch(error => {
    res.status(400).json( error.message )
  })
}


/** Met à jour le livre avec l'_id fourni. Si une image est téléchargée, 
  elle est capturée et l’imageUrl du livre est mise à jour. 
  Si aucun fichier n'est fourni, les informations du livre se trouvent directement
  dans le corps de la requête (req.body.title, req.body.author, etc.). 
  Si un fichier est fourni, le livre transformé en chaîne de caractères se trouve dans req.body.book.
  Notez que le corps de la requête initiale est vide ; lorsque Multer est ajouté, 
  il renvoie une chaîne du corps de la requête basée sur les données soumises avec le fichier.
 * Méthode : PUT
 * Point d'accès : /api/books/:id
 * Authentification : Requise
 * Body : Soit un livre en JSON, soit { book: string, image: file }
 * Réponse : { message: String }
 */
exports.updateOneBook = (req, res, next) => {

  // Si la requête est passée par Multer, ont la transforme en objet JS et ajoute le lien du fichier 
  const dataUpdate = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : {
    ...req.body,
  };

  // Récupère le livre correspondant à params.id dans la base de données
  Book.findOne({ _id: req.params.id })
  .then(book => {

    // Vérifie ci le livre existe puis ci sont utilisateur en est le createur
    findBook(book)
    userAuthorization(book, req)

    // Modification des données contenues dans book
    return Book.updateOne({ _id: req.params.id }, { ...dataUpdate })
  })
  .then( () => {
    res.status(200).json({ message: "Livre modifié" })
  })
  .catch(error => {
    res.status(500).json({ error: error.message })
  });
} 


/** Supprime le livre avec l'_id fourni ainsi que l’image associée.
 * Méthode : DELETE
 * Point d'accès : /api/books/:id
 * Authentification : Requise
 * Body : 
 * Réponse : { message: String }
 */
exports.delateOneBook = (req, res, next) => {

  // Utilisation du paramètre de la requête pour retrouver un livre
  Book.findOne({ _id: req.params.id})
  .then(book => {

    // Supprime l'image du serveur
    delateFile(book,req)

    // Supprime le livre de la base de données
    book.deleteOne()
    .then(() => {
      console.log('Le livre a etait supprimé')
      res.status(200).json("Suppression réussie")
    })
    .catch(error => res.status(400).json({error}))
    
  })
  .catch(error => res.status(400).json({error}))
}


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
 * Réponse : Livre unique
 */
exports.postRatting =  (req, res, next) => {

  // Utilisation du paramètre de la requête pour retrouver un livre 
  Book.findOne({ _id: req.params.id})
  .then(book => {

    // Si le livre n'existe pas, retourner une erreur 404
    findBook(book)

    // Comparaison de chaque userId du tableau ratings avec le userId de la requête
    book.ratings.forEach(rating => {
      if(rating.userId === req.auth.userId) {
        console.log("l'utilisateur a deja note ce livre");
        return res.status(400).json({ message: "L'utilisateur a deja noté ce livre" });
      }
    })
    
    // Si la note est comprise entre 0 et 5, alors on l'ajoute à book //TODO faut'il inclure ce cas?
    if(req.body.rating >= 0 && req.body.rating <= 5){
      book.ratings.push({ userId : req.body.userId, grade : req.body.rating})
    } else {
      console.log("la note n'est pas comprise entre 0 et 5");
      return res.status(400).json("La note doit être comprise entre 0 et 5")
    }

    // Récupère chaque note des livres pour en faire la moyenne et l'arrondir
    let index = 0
    book.ratings.forEach(rating => {
      index += rating.grade
    });
    book.averageRating = parseFloat((index / book.ratings.length).toFixed(2))

    book.save()
    .then(book => {
      console.log("la note a etait ajoutée");
      res.status(200).json(book)
    })
    .catch(error => res.status(400).json({error}))
  })
  .catch(error => res.status(401).json({error}))
}


/** Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
 * Méthode : GET 
 * Point d'accès : /api/books/bestrating 
 * Authentification : Non requise 
 * Body :
 * Réponse : Tableau de livres
 */
exports.getBestRatting = (req, res, next) => {

  // Récupère la liste des livres
  Book.find()
  .then(books => {

    // Trie la liste des livres et découpe les 3 premiers éléments
    const booksList = [...books].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3)

    console.log("les livres les mieux notés on etait recuperé");
    res.status(200).json(booksList);
  })
  .catch(error => res.status(401).json(error.message)) //TODO - pb affichage de mon erreur dans le front end
}