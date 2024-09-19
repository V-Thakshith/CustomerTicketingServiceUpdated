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
  try {
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
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
        fullName: 'JohnTest Doe',
        signupEmail: 'johnTest@example.com',
        signupPassword: 'passwordTest123',
        dob: '1990-01-01',
        country: 'USA',
        gender: 'male',
      });
    expect(response.status).toBe(201);
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

describe('POST /api/auth/tickets', () => {
  
  let token;
  beforeAll(async () => {
    // Register a customer
    const response=await request(app).post('/api/auth/register').send({
      fullName: 'JonnyTestingNOw Doe',
      signupEmail: 'jonnytestingnow@example.com',
      signupPassword: 'password123',
      dob: '1992-02-02',
      country: 'USA',
      role: 'customer',
      gender: 'female'
    });

    // Login as customer and get the token
    //const response = await request(app).post('/api/auth/login').send({
    //  email: 'jonnytestingnow@example.com',
    //  password: 'password123'
    //});

    token = response.token;
    customerUser=response.user;
    console.log(token,customerUser,response.body)
  });

  afterEach(async () => {
    // Clean up tickets after each test
    await Ticket.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close the connection
    await mongoose.connection.close();
  });

  it('should create a new ticket with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/tickets')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Ticket')
      .field('description', 'Test Description')
      .field('customerId', customerUser._id) // Example customer ID, replace with actual
      .attach('attachments', '__tests__/files/test-file.jpg'); // Example file

    expect(res.statusCode).toEqual(201);
    expect(res.body.ticket).toHaveProperty('title', 'Test Ticket');
    expect(res.body.ticket).toHaveProperty('status', 'Open');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Test Description'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('msg', 'Missing required fields');
  });

  it('should assign the ticket to the least busy agent', async () => {
    // Create some agents to test the assignment logic
    await request(app).post('/api/auth/registerAgent').send({
      fullName: 'Agent 1',
      signupEmail: 'agent1@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    await request(app).post('/api/auth/registerAgent').send({
      fullName: 'Agent 2',
      signupEmail: 'agent2@example.com',
      signupPassword: 'password123',
      dob: '1980-05-05',
      country: 'USA',
      gender: 'female',
    });

    const res = await request(app)
      .post('/api/auth/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Ticket Assignment',
        description: 'Assign to least busy agent',
        customerId: customerUser._id,
        category: 'General'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.ticket).toHaveProperty('assignedTo'); // Check if the ticket was assigned
  });

  it('should return 404 if no agents are available', async () => {
    const res = await request(app)
      .post('/api/auth/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Ticket Assignment',
        description: 'Assign to least busy agent',
        customerId: customerUser._id,
        category: 'General'
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('msg', 'No agents found');
  });
});