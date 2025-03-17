// Import modèles
const Book = require('../models/book');
// Import fonction
const {
  castError,
  findBook,
  userAuthorization,
  delateFile,
  trimRequest,
  ratingValidation,
} = require('../functions.js');

/** Renvoie un tableau de tous les livres de la base de données.
 * @param {Objet} req - Body: Undefined
 * @param {Array} res - Un tableau de livres ou { error }
 */
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/** Renvoie le livre avec l’_id fourni.
 * @param {Undefined} req - Body: Undefined
 * @param {Object} res - Un livre unique ou { error }
 *
 * @function findOne - Verifie que le livre existe dans la base de donnée
 * @function castError - Vérifie si erreur.message egale CastError, l'objectId présent dans l'URL n'est pas un object valide de MongoDB
 */
exports.getOneBook = async (req, res) => {
  try {
    // Utilisation du paramètre de la requête pour retrouver un livre, si il n'existe pas, on retourne une erreur
    const book = await Book.findOne({ _id: req.params.id });
    findBook(book);

    res.status(200).json(book);
  } catch (error) {
    castError(error);
    res.status(error.status || 400).json({ error: error.message });
  }
};

/** Ajoute un livre a la base de donnée
 * @param {Object} req - Body: {book: string et number , image: file},  UrlParam
 * @param {Object} res - { message: String } ou { error }
 *
 * @function trimRequest - Supprime les espaces avant et après les données envoyées par l'utilisateur
 */
exports.addOneBook = async (req, res) => {
  try {
    // Transforme en objet JS car la requette est passé par Multer
    const reqData = JSON.parse(req.body.book);

    //  Suppression des _id possiblement ajoutés dans la requête
    delete reqData._id;
    delete reqData.userId;

    //Supprime les espaces avant et après les données envoyées par l'utilisateur
    trimRequest(reqData);

    // Si l'utilasateur n'as pas renseigner de note alors averageRating = 0, autrement on ajoute la note et l'user Id
    if (!reqData.ratings) {
      reqData.ratings = [];
      reqData.averageRating = 0;
    } else {
      reqData.averageRating = reqData.ratings[0].grade;
      reqData.ratings[0].userId = req.auth.userId;
    }

    // Crée un nouvel objet book avec userId et imageUrl à jour
    const book = new Book({
      ...reqData,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    // Sauvegarde le livre dans la data base
    await book.save();
    res.status(201).json({ message: 'Book added' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/** Met à jour le livre avec l'_id fourni.
 * @param {Object} req - Body: { book: string, image: file }, UrlParam
 * @param {Object} res - { message: String }
 *
 * @function findBook - Verifie que le livre existe dans la base de donnée
 * @function userAuthorization - Verifie que l'utilisateur qui envoie la requette est le meme que celui qui creer le livre
 * @function castError - Vérifie si erreur.message egale CastError, l'objectId présent dans l'URL n'est pas un object valide de MongoDB
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

    //  Suppression des _id possiblement ajoutés dans la requête et du ratting pour que l'utilisateur ne puisse pas le modifier
    delete dataUpdate._id;
    delete dataUpdate.userId;
    delete dataUpdate.ratings;

    //Supprime les espaces avant et après les données envoyées par l'utilisateur
    trimRequest(dataUpdate);

    console.log(dataUpdate);

    // Modification des données contenues dans book
    await book.updateOne({ ...dataUpdate });

    res.status(200).json({ message: 'Book updated' });
  } catch (error) {
    castError(error);
    res.status(error.status || 400).json({ error: error.message });
  }
};

/** Supprime le livre avec l'_id fourni ainsi que l’image associée.
 * @param {Object} req - Body: Undefined, UrlParam
 * @param {Object} res - { message: string } ou { error }
 *
 * @function delateFile Supprime un fichier sur le serveur
 * @function findBook - Verifie que le livre existe dans la base de donnée
 * @function userAuthorization - Verifie que l'utilisateur qui envoie la requette est le meme que celui qui creer le livre
 * @function castError - Vérifie si erreur.message egale CastError, l'objectId présent dans l'URL n'est pas un object valide de MongoDB
 */
exports.delateOneBook = async (req, res) => {
  try {
    // Utilisation du paramètre de la requête pour retrouver un livre
    const book = await Book.findOne({ _id: req.params.id });

    // Vérifie que le livre existe et que l'utilisateur est autorisé, puis supprime l'image du serveur.
    findBook(book);
    userAuthorization(book, req);
    await delateFile(book);

    // Supprime le livre de la base de données
    await book.deleteOne();

    res.status(200).json('Book delated');
  } catch (error) {
    castError(error);
    res.status(error.status || 400).json({ error: error.message });
  }
};

/** Définit la note pour l'user ID fourni.
 * @param {Object} req - Body: { "userId": "String", "rating": "Number" }, UrlParam
 * @param {Object} res - Un livre unique ou { error }.
 *
 * @function findBook - Verifie que le livre existe dans la base de donnée
 * @function castError - Vérifie si erreur.message egale CastError, l'objectId présent dans l'URL n'est pas un object valide de MongoDB
 */
exports.postRatting = async (req, res) => {
  try {
    // Utilisation du paramètre de la requête pour retrouver un livre
    const book = await Book.findOne({ _id: req.params.id });

    // Si le livre n'existe pas, retourner une erreur
    findBook(book);

    // Comparaison de chaque userId du tableau ratings avec le userId de la requête
    book.ratings.forEach((rating) => {
      if (rating.userId === req.auth.userId) {
        console.log('User has already rated this book');
        const error = new Error('unauthorized request');
        error.status = 403;
        throw error;
      }
    });

    // Si l'utilisateur n'as pas renseigner de note alors on l'init a 0
    if (req.body.rating === '') {
      req.body.rating = 0;
    }

    // Vérifie que la note est comprise entre 0 et 5 et ajoute la note et l'user Id
    ratingValidation(req.body.rating);
    book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });

    // Récupère chaque note des livres pour en faire la moyenne et l'arrondir
    let index = 0;
    book.ratings.forEach((rating) => {
      index += rating.grade;
    });
    book.averageRating = parseFloat((index / book.ratings.length).toFixed(2));

    await book.save();

    res.status(201).json(book);
  } catch (error) {
    castError(error);
    res.status(error.status || 400).json({ error: error.message });
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
    const booksList = [...book]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);

    res.status(200).json(booksList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//TODO - Vérifier les vulnérabilités avec npm audi
