const request = require('supertest');
const startServer = require('./startTestServer');
const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');

// Variables for server, token, and user
let server;
let customerUser;

beforeAll(async () => {
  // Start the server
  server = await startServer();
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        fullName: 'JohnTest Doe',
        signupEmail: 'johnTest@example.com',
        signupPassword: 'passwordTest123',
        dob: '1990-01-01',
        country: 'USA',
        gender: 'male',
      });
    expect(response.status).toBe(201);
  });

  it('should not register existing user', async () => {

    await request(server)
      .post('/api/auth/register')
      .send({
        fullName: 'JohnTest Doe',
        signupEmail: 'johnTest@example.com',
        signupPassword: 'passwordTest123',
        dob: '1990-01-01',
        country: 'USA',
        gender: 'male',
      });

    const response = await request(server)
      .post('/api/auth/register')
      .send({
        fullName: 'JohnTest Doe',
        signupEmail: 'johnTest@example.com',
        signupPassword: 'passwordTest123',
        dob: '1990-01-01',
        country: 'USA',
        gender: 'male',
      });
    expect(response.status).toBe(400);
  });

  it('should not register user with missing attributes', async () => {

    const response = await request(server)
      .post('/api/auth/register')
      .send({
        signupEmail: 'johnTest@example.com',
        signupPassword: 'passwordTest123',
        dob: '1990-01-01',
        country: 'USA',
        gender: 'male',
      });
    expect(response.status).toBe(400);
  });

});



describe('POST /api/auth/login', () => {
  it('should log in a user and return a token', async () => {     
    await request(server)
    .post('/api/auth/register')
    .send({
      fullName: 'Jane Doe',
      signupEmail: 'jane@example.com',
      signupPassword: 'password123',
      dob: '1992-02-02',
      country: 'USA',
      role: 'customer',
      gender: 'female',
    });

  const response = await request(server)
    .post('/api/auth/login')
    .send({
      'email': 'jane@example.com',
      'password': 'password123',
    });
   
    expect(response.status).toBe(200);
  });

  it('should return 400 for invalid credentials', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Invalid credentials');
  });
  
  it('should return 400 for incorrect password', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'customer@gmail.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Invalid credentials');
  });
});

beforeEach(async () => {
  // Clear the database before each test
  await mongoose.connection.dropDatabase();
  // Create a customer and get the token
  customerUser = await createUserAndGetToken({
    fullName: 'JohnTestTicket Doe',
    signupEmail: 'johnTestTicket@example.com',
    signupPassword: 'passwordTestTicket123',
    dob: '1990-01-01',
    country: 'USA',
    gender: 'male',
  });
});

afterAll(async () => {
  // Clean up and close the database connection and server
  await mongoose.connection.close();
  server.close();
});

// Utility function to create a user and return token and user info
const createUserAndGetToken = async (userData) => {
  const res = await request(server)
    .post('/api/auth/register')
    .send(userData);

  return { token: res.body.token, user: res.body.user };
};

describe('POST /api/auth/tickets', () => {
  it('should create a new ticket with valid data', async () => {
    const res = await request(server)
      .post('/api/auth/tickets')
      .set('Authorization', `Bearer ${customerUser.token}`)
      .field('title', 'Test Ticket')
      .field('description', 'Test Description')
      .field('customerId', customerUser.user._id)
      .attach('attachments', 'C:/Users/e039571/Downloads/Components-1726207339825.jpg'); // Example file

    expect(res.statusCode).toEqual(201);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(server)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerUser.token}`)
      .send({
        description: 'Test Description',
      });

    expect(res.statusCode).toEqual(400);
  });

  it('should assign the ticket to the least busy agent', async () => {
    // Create some agents to test the assignment logic
    await request(server).post('/api/auth/registerAgent').send({
      fullName: 'Agent 1',
      signupEmail: 'agent1@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    await request(server).post('/api/auth/registerAgent').send({
      fullName: 'Agent 2',
      signupEmail: 'agent2@example.com',
      signupPassword: 'password123',
      dob: '1980-05-05',
      country: 'USA',
      gender: 'female',
    });

    const res = await request(server)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerUser.token}`)
      .send({
        title: 'Test Ticket Assignment',
        description: 'Assign to least busy agent',
        customerId: customerUser.user._id,
        category: 'General',
      });
      console.log(res.body)
    expect(res.statusCode).toEqual(201);

  });

  it('should return 404 if no agents are available', async () => {
    const res = await request(server)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerUser.token}`)
      .send({
        title: 'Test Ticket Assignment',
        description: 'Assign to least busy agent',
        customerId: customerUser.user._id,
        category: 'General',
      });

    expect(res.statusCode).toEqual(404);
  });
});
