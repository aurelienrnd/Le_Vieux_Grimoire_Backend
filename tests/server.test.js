const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const path = require('path');

/* info Test */
const userTestId = '67d1064408107fb8711e2f49';
const tokenTest =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2NlZTViYjMyMjFhZDM3ZGU0ZWJjYTIiLCJpYXQiOjE3NDE2NzgwMzAsImV4cCI6MTc0MTc2NDQzMH0.Pl6GWon_r103Bx9DcaSV52Wgdyw0IdTJlK_oXHXbAPo';
const bookTestId = '67d1084808107fb8711e2f58';

// creer une conection a mangoDB
beforeAll(async () => {
  await mongoose.connect(
    'mongodb+srv://aurelien:exoOPen@cluster0.qxu0g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  );
});

/**NOTE - Pour netoyer la base de donner en cas d'utilisation d'une dataBase virtuel
afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); 
});
*/

// Ferme la connection a mongoDB
afterAll(async () => {
  await mongoose.connection.close(); // Ferme la connexion active
  await mongoose.disconnect(); // S'assure que toutes les connexions sont stoppées
});

/* Debut des tests */
describe('GET /api/books', () => {
  it('should response status 200', async () => {
    const response = await request(app).get('/api/books');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /api/books/:id', () => {
  it('should response status 200', async () => {
    const response = await request(app).get(`/api/books/${bookTestId}`);
    expect(response.statusCode).toBe(200);
  });

  it('should response status 404 because id no conforme for mongoDB', async () => {
    const urlParam = 'id_Non_Conforme_A_MongoDb';
    const response = await request(app).get(`/api/books/${urlParam}`);
    expect(response.statusCode).toBe(404);
  });

  it('should response status 400 because id did not existe in dataBase', async () => {
    const urlParam = '67c55c0a9726f458d4a15e01'; // id conforme mais non enregistrer dans la dataBases
    const response = await request(app).get(`/api/books/${urlParam}`);
    expect(response.statusCode).toBe(404);
    expect(expect(response.body).toEqual({ error: "Ce livre n'existe pas" }));
  });
});

describe('POST /api/books', () => {
  const newBook = {
    userId: `${bookTestId}`,
    title: 'TEST API',
    author: 'TEST API',
    year: '2021',
    genre: 'TEST API',
  };

  const req = request(app).post('/api/books');
  req.field('book', JSON.stringify(newBook));

  // TODO - le test fonctione mais les images generer ne peuvent pas etre lus par l'aplication
  it('should response status 201', async () => {
    const response = await req
      .attach('image', path.join(__dirname, 'test_api.jpg'))
      .set('Authorization', `Bearer ${tokenTest}`);

    expect(response.statusCode).toBe(201);
    expect(expect(response.body).toEqual({ message: 'Livre ajouté' }));
  });

  it('should response status 400 because a file is sent without the data book', async () => {
    const response = await request(app)
      .post('/api/books')
      .attach('image', path.join(__dirname, 'test_api.jpg'))
      .set('Authorization', `Bearer ${tokenTest}`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "la requette n'as pas de formulaire book",
    });
  });

  //FIXME - Le test me renvoie une 201
  it('should response status 400 because a file is sent is not an image', async () => {
    const response = await req
      .attach('image', path.join(__dirname, 'image_non_conforme.txt'))
      .set('Authorization', `Bearer ${tokenTest}`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: 'Format du fichier non supporté',
    });
  });

  it('should response status 401 because a file is not sent', async () => {
    const response = await request(app)
      .post('/api/books')
      .send(newBook)
      .set('Authorization', `Bearer ${tokenTest}`);
    expect(response.statusCode).toBe(401);
  });
});

describe.only('PUT/api/books/:id', () => {
  it('should response status 200', async () => {
    const newBook = {
      userId: `${userTestId}`,
      title: 'TEST API',
      author: 'TEST API',
      year: '2021',
      genre: 'TEST API',
    };
    const response = await request(app)
      .put(`/api/books/${bookTestId}`)
      .set('Authorization', `Bearer ${tokenTest}`)
      .send(newBook);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Livre modifié' });
  });

  it('should response status 403 because the bookId and userId are not the same', async () => {
    const newBook = {
      userId: '67cee5bb3221ad37de4ebca2',
      title: 'TEST API',
      author: 'TEST API',
      year: '2021',
      genre: 'TEST API',
    };
  });
});

//NOTE - test sur put effectuer avec reponsse 200 pb message conssole async apres le test, faire les autre reponsse 400
