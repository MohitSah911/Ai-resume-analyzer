const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

// Note: Ensure your environment defines MONGO_URI, or replace it with an in-memory db.
// For basic testing, we'll just test non-authenticated routes or mock auth.

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

describe('Basic API Tests', () => {
  jest.setTimeout(30000);
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('GET /health', () => {
    it('should return a welcome message', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/auth/login with invalid data', () => {
    it('should return 400 or 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('API Contracts', () => {
    it('should have a /api/resumes/upload endpoint', async () => {
      const res = await request(app).post('/api/resumes/upload');
      // Should fail auth since no token is provided
      expect(res.status).toBe(401);
    });

    it('should have a /api/analyses endpoint', async () => {
      const res = await request(app).post('/api/analyses');
      expect(res.status).toBe(401);
    });
  });
});
