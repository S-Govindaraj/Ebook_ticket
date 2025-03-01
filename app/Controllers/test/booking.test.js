const request = require('supertest');
const app = require('../app');

describe('Booking API', () => {
  it('should book a ticket for an event', async () => {
    const response = await request(app)
      .post('/api/booking/events/1/book')
      .send({
        userId: 1,
        numberOfTickets: 2,
      });
      
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Booking successful');
    expect(response.body.booking).toHaveProperty('id');
  });

  it('should return error if event is not found', async () => {
    const response = await request(app)
      .post('/api/booking/events/9999/book')  // Non-existent event
      .send({
        userId: 1,
        numberOfTickets: 2,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Event not found');
  });

  it('should allow the user to delete a booking and refund tickets', async () => {
    const response = await request(app)
      .delete('/api/booking/bookings/1');  // Assuming the booking exists
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Booking deleted and tickets refunded');
  });
});
