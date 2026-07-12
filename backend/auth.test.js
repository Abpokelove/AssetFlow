const test = require('node:test');
const assert = require('node:assert/strict');
const { registerUser, loginUser } = require('./auth');

test('register and login flow works', async () => {
  const user = await registerUser({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });

  assert.equal(user.email, 'test@example.com');

  const result = await loginUser({
    email: 'test@example.com',
    password: 'password123',
  });

  assert.ok(result.token);
  assert.equal(result.user.email, 'test@example.com');
});
