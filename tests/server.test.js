const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const path = require('path');

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
  await mongoose.connection.close(); // Ferme proprement la connexion
  await mongoose.disconnect(); // Ajouté pour être sûr que tout est bien stoppé
});

describe('GET /api/books', () => {
  it('should response status 200', async () => {
    const response = await request(app).get('/api/books');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /api/books/:id', () => {
  it('should response status 200', async () => {
    const urlParam = '67cee5e63221ad37de4ebcaa';
    const response = await request(app).get(`/api/books/${urlParam}`);
    expect(response.statusCode).toBe(200);
  });

  it('should response status 404 becaise id no conforme for mongoDB', async () => {
    const urlParam = 'id_Non_Conforme_A_MongoDb';
    const response = await request(app).get(`/api/books/${urlParam}`);
    const errorMessage = 'error generer par mongoDB';
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
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2NlZTViYjMyMjFhZDM3ZGU0ZWJjYTIiLCJpYXQiOjE3NDE2NzgwMzAsImV4cCI6MTc0MTc2NDQzMH0.Pl6GWon_r103Bx9DcaSV52Wgdyw0IdTJlK_oXHXbAPo';

  const newBook = {
    userId: '67cee5bb3221ad37de4ebca2',
    title: 'TEST API',
    author: 'TEST API',
    imageUrl: 'https://via.placeholder.com/206x260',
    year: '2021',
    genre: 'TEST API',
  };

  const req = request(app).post('/api/books');
  req.field('book', JSON.stringify(newBook));

  // TODO - le test fonctione mais les image generer ne peuvent pas etre lus par l'aplication
  it('should response status 201', async () => {
    const response = await req
      .attach('image', path.join(__dirname, 'test_api.jpg'))
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(expect(response.body).toEqual({ message: 'Livre ajouté' }));
  });

  it('', async () => {});
});
