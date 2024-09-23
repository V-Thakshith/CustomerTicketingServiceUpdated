const request = require('supertest');
const startServer = require('./startTestServer');
const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
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

  await mongoose.connection.dropDatabase();

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
    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 1',
      signupEmail: 'agent1@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    const res = await request(server)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerUser.token}`)
      .field('title', 'Test Ticket')
      .field('description', 'Test Description')
      .field('customerId', customerUser.user._id)
      .field('category', 'General')
    
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
    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 1',
      signupEmail: 'agent1@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
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

  it('should return a list of agents for a manager', async () => {

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 1',
      signupEmail: 'agent1@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 2',
      signupEmail: 'agent2@example.com',
      signupPassword: 'password123',
      dob: '1980-05-05',
      country: 'USA',
      gender: 'female',
    });

    const res = await request(server)
      .get('/api/users/allAgentsDetails')
      .set('Authorization', `Bearer ${customerUser.token}`)
      
    expect(res.status).toBe(200);
  });

  it('should not return a list of agents for a manager', async () => {

    const res = await request(server)
      .get('/api/users/allAgentsDetails')
      .set('Authorization', `Bearer ${customerUser.token}`)
      

    expect(res.status).toBe(404);
  });
});

describe('GET /api/auth/me', () => {

  it('should return user details for an authenticated user', async () => {
    const res = await request(server)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${customerUser.token}`);

    expect(res.status).toBe(200);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(server).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('should return 500 if the user is not found', async () => {
    await User.deleteMany({}); // Delete all users
    const res = await request(server)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${customerUser.token}`);

    console.log(res.body)
    expect(res.status).toBe(500);
  });

  it('should return the tickets assigned, resolved, and in progress for the agent today', async () => {
    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 3',
      signupEmail: 'agent3@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    const Agent3=await request(server).post('/api/auth/login')
    .send({
      email: 'agent3@example.com',
      password: 'password123'
    });

    console.log(Agent3)

    const today = new Date();
    await Ticket.create(
      {
        title: 'Ticket 1',
        description: 'Test ticket 1',
        assignedTo: Agent3.body.user._id,
        category:'General',
        customer:customerUser.user._id,
        status: 'Open',
        createdAt: today,
        updatedAt: today
      })

    const response = await request(server)
      .get(`/api/users/ticketsByAgentToday/${Agent3.body.user._id}`)
      .set('Authorization', `Bearer ${Agent3.body.token}`);

    expect(response.status).toBe(200);
  });

  it('should return the total counts of tickets for each status', async () => {

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 3',
      signupEmail: 'agent3@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    const Agent3=await request(server).post('/api/auth/login')
    .send({
      email: 'agent3@example.com',
      password: 'password123'
    });

    console.log(Agent3)
    const today = new Date();
    await Ticket.create(
      {
        title: 'Ticket 1',
        description: 'Test ticket 1',
        assignedTo: Agent3.body.user._id,
        category:'General',
        customer:customerUser.user._id,
        status: 'Open',
        createdAt: today,
        updatedAt: today
      })

      await Ticket.create(
        {
          title: 'Ticket 2',
          description: 'Test ticket 2',
          assignedTo: Agent3.body.user._id,
          category:'General',
          customer:customerUser.user._id,
          status: 'Open',
          createdAt: today,
          updatedAt: today
        })

    const response = await request(server)
      .get('/api/users/getAllTicketsCounts')
      .set('Authorization', `Bearer ${Agent3.body.token}`); // Replace with actual auth token

    expect(response.status).toBe(200);
  });

  it('should return the total counts of tickets created today for each status', async () => {

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 3',
      signupEmail: 'agent3@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    const Agent3=await request(server).post('/api/auth/login')
    .send({
      email: 'agent3@example.com',
      password: 'password123'
    });

    console.log(Agent3)
    const today = new Date();
    await Ticket.create(
      {
        title: 'Ticket 1',
        description: 'Test ticket 1',
        assignedTo: Agent3.body.user._id,
        category:'General',
        customer:customerUser.user._id,
        status: 'Open',
        createdAt: today,
        updatedAt: today
      })

      await Ticket.create(
        {
          title: 'Ticket 2',
          description: 'Test ticket 2',
          assignedTo: Agent3.body.user._id,
          category:'General',
          customer:customerUser.user._id,
          status: 'Open',
          createdAt: today,
          updatedAt: today
        })

    const response = await request(server)
      .get('/api/users/getAllTicketsCountsToday')
      .set('Authorization', `Bearer ${Agent3.body.token}`); // Replace with actual auth token

    expect(response.status).toBe(200);
  });

  it('should return the total counts of tickets created today for each status', async () => {

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 3',
      signupEmail: 'agent3@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    const Agent3=await request(server).post('/api/auth/login')
    .send({
      email: 'agent3@example.com',
      password: 'password123'
    });

    console.log(Agent3)
    const today = new Date();
    await Ticket.create(
      {
        title: 'Ticket 1',
        description: 'Test ticket 1',
        assignedTo: Agent3.body.user._id,
        category:'General',
        customer:customerUser.user._id,
        status: 'Open',
        createdAt: today,
        updatedAt: today
      })

      const ticket=await Ticket.create(
        {
          title: 'Ticket 2',
          description: 'Test ticket 2',
          assignedTo: Agent3.body.user._id,
          category:'General',
          customer:customerUser.user._id,
          status: 'Open',
          createdAt: today,
          updatedAt: today
        })

    const response = await request(server)
      .get(`/api/tickets/${ticket._id}`)
      .set('Authorization', `Bearer ${Agent3.body.token}`); // Replace with actual auth token

    expect(response.status).toBe(200);
  });

  it('should return the total counts of tickets created today for each status', async () => {

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 3',
      signupEmail: 'agent3@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    const Agent3=await request(server).post('/api/auth/login')
    .send({
      email: 'agent3@example.com',
      password: 'password123'
    });

    console.log(Agent3)
    const today = new Date();
    await Ticket.create(
      {
        title: 'Ticket 1',
        description: 'Test ticket 1',
        assignedTo: Agent3.body.user._id,
        category:'General',
        customer:customerUser.user._id,
        status: 'Open',
        createdAt: today,
        updatedAt: today
      })

      await Ticket.create(
        {
          title: 'Ticket 2',
          description: 'Test ticket 2',
          assignedTo: Agent3.body.user._id,
          category:'General',
          customer:customerUser.user._id,
          status: 'Open',
          createdAt: today,
          updatedAt: today
        })

    const response = await request(server)
      .get(`/api/tickets/assigned/${Agent3.body.user._id}`)
      .set('Authorization', `Bearer ${Agent3.body.token}`); // Replace with actual auth token

    expect(response.status).toBe(200);
  });

  it('should return the total counts of tickets created today for each status', async () => {

    await request(server).post('/api/auth/registerAgent')
    .set('Authorization', `Bearer ${customerUser.token}`)
    .send({
      fullName: 'Agent 3',
      signupEmail: 'agent3@example.com',
      signupPassword: 'password123',
      dob: '1985-01-01',
      country: 'USA',
      gender: 'male',
    });

    const Agent3=await request(server).post('/api/auth/login')
    .send({
      email: 'agent3@example.com',
      password: 'password123'
    });

    console.log(Agent3)
    const today = new Date();
    await Ticket.create(
      {
        title: 'Ticket 1',
        description: 'Test ticket 1',
        assignedTo: Agent3.body.user._id,
        category:'General',
        customer:customerUser.user._id,
        status: 'Open',
        createdAt: today,
        updatedAt: today
      })

      await Ticket.create(
        {
          title: 'Ticket 2',
          description: 'Test ticket 2',
          assignedTo: Agent3.body.user._id,
          category:'General',
          customer:customerUser.user._id,
          status: 'Open',
          createdAt: today,
          updatedAt: today
        })

    const response = await request(server)
      .get(`/api/tickets/customer/${customerUser.user._id}`)
      .set('Authorization', `Bearer ${customerUser.token}`); // Replace with actual auth token

    expect(response.status).toBe(200);
  });
});