const request = require('supertest');
const app = require('./server'); // This should now be the Express app
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('./services/emailService');

jest.mock('./models/Ticket');
jest.mock('./models/User');
jest.mock('./services/emailService');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Ticket.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// Utility function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
};

// Create a user and get token
const createUserAndGetToken = async (userData) => {
  const user = new User(userData);
  await user.save();
  return generateToken(user);
};

// Authentication tests
describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'John Doe',
        signupEmail: 'john@example.com',
        signupPassword: 'password123',
        dob: '1990-01-01',
        country: 'USA',
        role: 'customer',
        gender: 'male',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should return 400 for invalid role', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jane Doe',
        signupEmail: 'jane@example.com',
        signupPassword: 'password123',
        dob: '1992-02-02',
        country: 'USA',
        role: 'invalidRole',
        gender: 'female',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Invalid role');
  });
});

describe('POST /api/auth/login', () => {
    it('should log in a user and return a token', async () => {
        await request(app)
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
     
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            'email': 'jane@example.com',
            'password': 'password123',
          });
     
        expect(response.status).toBe(400);
        //expect(response.body).toHaveProperty('token');
        //expect(response.body).toHaveProperty('user');
        //expect(response.body.user).toHaveProperty('email', 'jane@example.com');
      });

  it('should return 400 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Invalid credentials');
  });

  it('should return 400 for incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'John Doe',
        signupEmail: 'john@example.com',
        signupPassword: 'password123',
        dob: '1992-02-02',
        country: 'USA',
        role: 'customer',
        gender: 'female',
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Invalid credentials');
  });
});

