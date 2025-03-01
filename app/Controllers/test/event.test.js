const request = require('supertest');
const Event = require('../../Models/Events'); 
const {app} = require('../../../index');
const sequelize  = require('../../Middleware/database').sequelize;

describe('Event Controller Tests', () => {
  let adminToken;
  let userToken;
  let eventId;

  beforeAll(async () => {
    const adminResponse = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin_password' });

    adminToken = adminResponse.body.token;
    const userResponse = await request(app)
      .post('/api/login')
      .send({ username: 'user', password: 'user_password' });

    userToken = userResponse.body.token; 
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create an event successfully with admin privileges', async () => {
    const newEventData = {
      name: 'Sample Event',
      date: '2025-03-10',
      totalTickets: 100,
    };

    const response = await request(app)
      .post('/api/events') 
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newEventData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Event created successfully!');
    expect(response.body.event).toHaveProperty('name', 'Sample Event');
    eventId = response.body.event.id; 
  });

  it('should return all events', async () => {
    const response = await request(app)
      .get('/api/events') 
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.events).toBeInstanceOf(Array);
    expect(response.body.events.length).toBeGreaterThan(0); 
  });

  it('should prevent non-admin from creating an event', async () => {
    const newEventData = {
      name: 'Unauthorized Event',
      date: '2025-03-10',
      totalTickets: 50,
    };

    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newEventData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Forbidden: Only Admin can create events');
  });

  it('should mark event as deleted instead of deleting it', async () => {
    const response = await request(app)
      .delete(`/api/events/${eventId}`) 
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Event marked as deleted successfully!');

    const updatedEvent = await Event.findByPk(eventId);
    expect(updatedEvent.status).toBe(0); 
  });

  it('should return error if event not found on delete', async () => {
    const nonExistentEventId = 999999;

    const response = await request(app)
      .delete(`/api/events/${nonExistentEventId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Event not found');
  });
});
