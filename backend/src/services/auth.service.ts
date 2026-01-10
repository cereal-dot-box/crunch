import bcrypt from 'bcrypt';
import { User } from '../models/user';
import { BudgetBucket } from '../models/budget-bucket';

const SALT_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(
  email: string,
  password: string
): Promise<{ userId: number }> {
  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email format');
  }

  // Check if email already exists
  if (await User.emailExists(email)) {
    throw new Error('Email already registered');
  }

  // Validate password strength
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash });

  // Initialize default budget buckets for new user
  await BudgetBucket.initializeDefaults(user.id);

  return { userId: user.id };
}

export async function login(email: string, password: string): Promise<{ userId: number }> {
  const user = await User.getByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  return { userId: user.id };
}
