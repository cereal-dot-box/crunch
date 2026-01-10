import type { FastifyInstance } from 'fastify';
import { registerUser, login } from '../services/auth.service';

export async function authRoutes(app: FastifyInstance) {
  // Check if user is authenticated
  app.get('/status', async (request, reply) => {
    return {
      isSetup: true, // Always true for multi-user
      isAuthenticated: !!request.session.userId
    };
  });

  // User registration
  app.post<{ Body: { email: string; password: string } }>('/register', async (request, reply) => {
    try {
      const { email, password } = request.body;

      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      if (!password) {
        return reply.status(400).send({ error: 'Password is required' });
      }

      const result = await registerUser(email, password);

      // Store userId in session (cookie handled by @fastify/session)
      request.session.userId = result.userId;
      await request.session.save();

      return { message: 'Registration successful', userId: result.userId };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Login
  app.post<{ Body: { email: string; password: string } }>('/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      if (!password) {
        return reply.status(400).send({ error: 'Password is required' });
      }

      const result = await login(email, password);

      // Store userId in session (cookie handled by @fastify/session)
      request.session.userId = result.userId;
      await request.session.save();

      return { message: 'Login successful', userId: result.userId };
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  });

  // Logout
  app.post('/logout', async (request, reply) => {
    request.session.destroy((err) => {
      if (err) {
        return reply.status(500).send({ error: 'Logout failed' });
      }
      // Clear the session cookie
      reply.clearCookie('sessionId');
      return reply.send({ message: 'Logged out' });
    });
  });
}
