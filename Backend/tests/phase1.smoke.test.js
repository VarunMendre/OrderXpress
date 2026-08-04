const request = require('supertest');
const { createApp } = require('../src/app');

describe('Phase 1 smoke tests', () => {
  const app = createApp();

  it('returns health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('returns ready status', async () => {
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ready');
  });

  it('protects admin-only table generation', async () => {
    const response = await request(app).post('/api/v1/tables/generate').send({ tableCount: 1 });
    expect(response.status).toBe(401);
  });

  it('protects admin-only menu list', async () => {
    const response = await request(app).get('/api/v1/menu-items');
    expect(response.status).toBe(401);
  });

  it('protects admin-only order list', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.status).toBe(401);
  });

  it('accepts customer session scan payload shape', async () => {
    const response = await request(app).post('/api/v1/customer/session/scan').send({
      restaurantId: '000000000000000000000000',
      tableId: '000000000000000000000000',
      signature: 'invalid',
      expiry: new Date().toISOString(),
      nonce: 'nonce'
    });
    expect([401, 404, 500]).toContain(response.status);
  });

  it('protects payment order creation from missing auth', async () => {
    const response = await request(app).post('/api/v1/payments/razorpay/order').send({
      orderId: '000000000000000000000000',
      amount: 100,
      currency: 'INR'
    });
    expect(response.status).toBe(401);
  });
});
