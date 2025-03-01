const request = require('supertest');
const {app} = require('../../../index');
const sequelize  = require('../../Middleware/database').sequelize;
const  User = require('../../Models/User');
const  Role  = require('../../Models/Role');

// Setup: Add a user before testing
beforeAll(async () => {
  await sequelize.sync({ force: true });

  await User.create({
    username: 'testUser',
    email: 'test@user.com',
    password: 'password123',
  });
});

afterEach(async () => {
  await Role.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe('Role API', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'test@user.com',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
    testUserId = loginResponse.body.user.id;
  });

  it('should create a new role', async () => {
    const response = await request(app)
      .post('/api/role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Admin',
        status: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Role created successfully.');
    expect(response.body.role.name).toBe('Admin');
  });

  it('should return 400 when role name is less than 3 characters', async () => {
    const response = await request(app)
      .post('/api/role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Ad', 
        status: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Role name is required and should be at least 3 characters long.');
  });

  it('should get all role', async () => {
    await Role.create({
      name: 'Admin',
      status: 1,
      createdBy: testUserId,
      updatedBy: testUserId,
    });

    const response = await request(app)
      .get('/api/role')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.role.length).toBeGreaterThan(0);
    expect(response.body.message).toBe('Role Shared successfully.');
  });

  it('should get role by ID', async () => {
    const role = await Role.create({
      name: 'Admin',
      status: 1,
      createdBy: testUserId,
      updatedBy: testUserId,
    });

    const response = await request(app)
      .get(`/api/role/${role.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Role Shared successfully.');
  });

  it('should return 404 if role not found', async () => {
    const response = await request(app)
      .get('/api/role/9999') 
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Role not found.');
  });

  it('should update a role', async () => {
    const role = await Role.create({
      name: 'User',
      status: 1,
      createdBy: testUserId,
      updatedBy: testUserId,
    });

    const response = await request(app)
      .put(`/api/role/${role.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Super User',
        status: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Role updated successfully.');
    expect(response.body.role.name).toBe('Super User');
  });

  it('should return 400 if role name is less than 3 characters while updating', async () => {
    const role = await Role.create({
      name: 'User',
      status: 1,
      createdBy: testUserId,
      updatedBy: testUserId,
    });

    const response = await request(app)
      .put(`/api/role/${role.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Su',
        status: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Role name should be at least 3 characters long.');
  });

  it('should soft-delete a role', async () => {
    const role = await Role.create({
      name: 'User',
      status: 1,
      createdBy: testUserId,
      updatedBy: testUserId,
    });

    const response = await request(app)
      .delete(`/api/role/${role.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Role soft-deleted successfully.');
    expect(response.body.role.status).toBe(0);
  });

  it('should return 404 if trying to delete a non-existent role', async () => {
    const response = await request(app)
      .delete('/api/role/9999') 
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Role not found.');
  });
});
