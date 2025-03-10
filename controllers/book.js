// Import modèles
const Book = require('../models/book');
// Import fonction
const { findBook, userAuthorization, delateFile } = require('../functions.js');

/** Renvoie un tableau de tous les livres de la base de données.
 * @param {Objet} req - Body: Undefined
 * @param {Array} res - Un tableau de livres ou { error } en cas d'erreur.
 */
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    console.log('La listes des livres a etait recuperé');
    res.status(200).json(books);
  } catch (error) {
    console.log("La listes des livres n'a pas etait trouvée");
    res.status(404).json({ error: error.message });
  }
};

/** Renvoie le livre avec l’_id fourni.
 * @param {Undefined} req - Body: Undefined
 * @param {Object} res - Un livre unique ou { message: String } en cas d'erreur.
 *
 * @function findOne - Verifie que le livre existe dans la base de donnée
 */
exports.getOneBook = async (req, res) => {
  try {
    // Utilisation du paramètre de la requête pour retrouver un livre, si il n'existe pas, on retourne une erreur
    const book = await Book.findOne({ _id: req.params.id });
    findBook(book);

    console.log('Le livre a etait recuperé');
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/** Ajoute un livre a la base de donnée
 * @param {Object} req - Body: {book: string et number , image: file},  UrlParam
 * @param {Object} res - { message: String } Verb
 *
 * @function findOne - Verifie que le livre existe dans la base de donnée
 */
exports.addOneBook = async (req, res) => {
  try {
    // Ont la transforme en objet JS car la requette est passé par Multer
    const reqData = JSON.parse(req.body.book);

    //TODO A rajouter sur toute les requettes qui ecrive dans la dataBase?
    //  Suppression des _id possiblement ajoutés dans la requête
    delete reqData._id;
    delete reqData._userId;

    //TODO Le créateur du livre peut-il noter le livre qu'il vient de créer ?

    // Crée un nouvel objet book avec userId et imageUrl à jour
    const book = new Book({
      ...reqData,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    // Sauvegarde le livre dans la data base
    await book.save();
    console.log('Le livre a etait ajouté');
    res.status(201).json({ message: 'Livre ajouté' });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

/** Met à jour le livre avec l'_id fourni.
 * @param {Object} req - Body: { book: string, image: file }, UrlParam
 * @param {Object} res - { message: String }
 *
 * @function findBook - Verifie que le livre existe dans la base de donnée
 * @function userAuthorization - Verifie que l'utilisateur qui envoie la requette est le meme que celui qui creer le livre
 */
exports.updateOneBook = async (req, res) => {
  try {
    // Si la requête est passée par Multer, ont la transforme en objet JS et ajoute le lien du fichier
    const dataUpdate = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : {
          ...req.body,
        };

    // Récupère le livre correspondant à params.id dans la base de données
    const book = await Book.findOne({ _id: req.params.id });

    // Vérifie ci le livre existe puis ci sont utilisateur en est le createur
    findBook(book);
    userAuthorization(book, req);

    // Modification des données contenues dans book
    await book.updateOne({ ...dataUpdate });

    res.status(200).json({ message: 'Livre modifié' });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

/** Supprime le livre avec l'_id fourni ainsi que l’image associée.
 * @param {Object} req - Body: Undefined, UrlParam
 * @param {Object} res - { message: string } ou { error }
 *
 * @function delateFile Supprime un fichier sur le serveur
 */
exports.delateOneBook = async (req, res) => {
  try {
    // Utilisation du paramètre de la requête pour retrouver un livre
    const book = await Book.findOne({ _id: req.params.id });

    // Supprime l'image du serveur
    delateFile(book, req);

    // Supprime le livre de la base de données
    await book.deleteOne();

    console.log('Le livre a etait supprimé');
    res.status(200).json('Suppression réussie');
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

/** Définit la note pour l'user ID fourni.
 * @param {Object} req - { "userId": "String", "rating": "Number" }, UrlParam
 * @param {Object} res - Un livre unique ou { error } en cas d'erreur.
 *
 */
exports.postRatting = async (req, res) => {
  try {
    // Utilisation du paramètre de la requête pour retrouver un livre
    const book = await Book.findOne({ _id: req.params.id });

    // Si le livre n'existe pas, retourner une erreur 404
    findBook(book);

    // Comparaison de chaque userId du tableau ratings avec le userId de la requête
    book.ratings.forEach((rating) => {
      if (rating.userId === req.auth.userId) {
        console.log("l'utilisateur a deja note ce livre");
        throw new Error("L'utilisateur a deja noté ce livre");
      }
    });

    // Si la note est comprise entre 0 et 5, alors on l'ajoute à book //TODO faut'il inclure ce cas?
    if (req.body.rating >= 0 && req.body.rating <= 5) {
      book.ratings.push({ userId: req.body.userId, grade: req.body.rating });
    } else {
      console.log("la note n'est pas comprise entre 0 et 5");
      throw new Error('La note doit être comprise entre 0 et 5'); //TODO - pb affichage de mon erreur dans le front end
    }

    // Récupère chaque note des livres pour en faire la moyenne et l'arrondir
    let index = 0;
    book.ratings.forEach((rating) => {
      index += rating.grade;
    });
    book.averageRating = parseFloat((index / book.ratings.length).toFixed(2));

    await book.save();

    console.log('la note a etait ajoutée');
    res.status(201).json(book);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

/** Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
 * @param {Object} req - Body: Undefined
 * @param {Object} res - Un tableaux des trois meuilleurs livres ou { error }
 */
exports.getBestRatting = async (req, res) => {
  try {
    // Récupère la liste des livres
    const book = await Book.find();

    // Trie la liste des livres et découpe les 3 premiers éléments
    const booksList = [...books]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);

    console.log('les livres les mieux notés on etait recuperé');
    res.status(200).json(booksList);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
