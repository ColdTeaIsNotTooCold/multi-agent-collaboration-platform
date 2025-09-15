import { prisma } from '../utils/database';

// Test database setup
beforeAll(async () => {
  try {
    // Try to connect to the database for tests
    await prisma.$connect();
    console.log('Test database connected');
  } catch (error) {
    console.warn('Database not available for tests, using mock behavior');
  }
});

afterAll(async () => {
  try {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: { contains: 'test' } },
          { email: { contains: 'test' } }
        ]
      }
    });

    await prisma.agent.deleteMany({
      where: {
        name: { contains: 'test' }
      }
    });

    await prisma.task.deleteMany({
      where: {
        title: { contains: 'test' }
      }
    });

    await prisma.$disconnect();
    console.log('Test database cleaned up and disconnected');
  } catch (error) {
    console.warn('Error cleaning up test database:', error);
  }
});

// Clear database before each test
beforeEach(async () => {
  try {
    // Clean up test data before each test
    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: { contains: 'test' } },
          { email: { contains: 'test' } }
        ]
      }
    });

    await prisma.agent.deleteMany({
      where: {
        name: { contains: 'test' }
      }
    });

    await prisma.task.deleteMany({
      where: {
        title: { contains: 'test' }
      }
    });
  } catch (error) {
    // Ignore database errors in setup
  }
});