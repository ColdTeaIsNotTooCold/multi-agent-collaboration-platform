import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Clean up existing data
    console.log('🧹 Cleaning up existing data...');
    await prisma.message.deleteMany();
    await prisma.task.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    });
    console.log(`✅ Admin user created: ${admin.username}`);

    // Create test users
    console.log('👥 Creating test users...');
    const user1Password = await hashPassword('user123');
    const user1 = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: user1Password,
        role: 'USER'
      }
    });
    console.log(`✅ Test user created: ${user1.username}`);

    const user2Password = await hashPassword('user123');
    const user2 = await prisma.user.create({
      data: {
        username: 'developer',
        email: 'dev@example.com',
        password: user2Password,
        role: 'USER'
      }
    });
    console.log(`✅ Developer user created: ${user2.username}`);

    // Create sample agents
    console.log('🤖 Creating sample agents...');
    const aiAgent = await prisma.agent.create({
      data: {
        name: 'AI Assistant',
        type: 'AI',
        capabilities: ['code-generation', 'text-analysis', 'problem-solving'],
        status: 'ACTIVE',
        metadata: {
          model: 'gpt-4',
          version: '1.0.0',
          description: 'General purpose AI assistant'
        }
      }
    });
    console.log(`✅ AI Agent created: ${aiAgent.name}`);

    const humanAgent = await prisma.agent.create({
      data: {
        name: 'Human Expert',
        type: 'HUMAN',
        capabilities: ['code-review', 'architecture-design', 'mentoring'],
        status: 'ACTIVE',
        metadata: {
          expertise: ['software-architecture', 'system-design'],
          experience: '10+ years',
          description: 'Senior software developer and architect'
        }
      }
    });
    console.log(`✅ Human Agent created: ${humanAgent.name}`);

    const botAgent = await prisma.agent.create({
      data: {
        name: 'Build Bot',
        type: 'BOT',
        capabilities: ['build-automation', 'testing', 'deployment'],
        status: 'ACTIVE',
        metadata: {
          version: '2.1.0',
          supportedPlatforms: ['github', 'gitlab', 'bitbucket'],
          description: 'CI/CD automation bot'
        }
      }
    });
    console.log(`✅ Bot Agent created: ${botAgent.name}`);

    // Create sample tasks
    console.log('📋 Creating sample tasks...');
    const task1 = await prisma.task.create({
      data: {
        title: 'Implement user authentication',
        description: 'Create a secure user authentication system with JWT tokens',
        priority: 'HIGH',
        createdBy: admin.id,
        assignedTo: aiAgent.id,
        metadata: {
          estimatedHours: 8,
          tags: ['authentication', 'security', 'backend'],
          complexity: 'medium'
        }
      }
    });
    console.log(`✅ Task created: ${task1.title}`);

    const task2 = await prisma.task.create({
      data: {
        title: 'Code review for payment module',
        description: 'Review the new payment processing module for security and best practices',
        priority: 'MEDIUM',
        createdBy: user1.id,
        assignedTo: humanAgent.id,
        metadata: {
          estimatedHours: 4,
          tags: ['code-review', 'security', 'payment'],
          complexity: 'low'
        }
      }
    });
    console.log(`✅ Task created: ${task2.title}`);

    const task3 = await prisma.task.create({
      data: {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated build and deployment pipeline',
        priority: 'HIGH',
        createdBy: admin.id,
        status: 'IN_PROGRESS',
        assignedTo: botAgent.id,
        metadata: {
          estimatedHours: 12,
          tags: ['ci-cd', 'automation', 'devops'],
          complexity: 'high'
        }
      }
    });
    console.log(`✅ Task created: ${task3.title}`);

    // Create sample messages
    console.log('💬 Creating sample messages...');
    await prisma.message.create({
      data: {
        content: 'Starting work on the authentication module. Will implement JWT-based authentication.',
        senderId: aiAgent.id,
        senderType: 'AGENT',
        receiverId: admin.id,
        receiverType: 'USER',
        taskId: task1.id,
        metadata: {
          messageType: 'status-update',
          priority: 'normal'
        }
      }
    });

    await prisma.message.create({
      data: {
        content: 'Please ensure the payment module follows PCI DSS compliance requirements.',
        senderId: user1.id,
        senderType: 'USER',
        receiverId: humanAgent.id,
        receiverType: 'AGENT',
        taskId: task2.id,
        metadata: {
          messageType: 'requirement',
          priority: 'high'
        }
      }
    });

    await prisma.message.create({
      data: {
        content: 'CI/CD pipeline configuration is 75% complete. Need to configure deployment scripts.',
        senderId: botAgent.id,
        senderType: 'AGENT',
        taskId: task3.id,
        metadata: {
          messageType: 'progress-update',
          priority: 'normal'
        }
      }
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${await prisma.user.count()}`);
    console.log(`   Agents: ${await prisma.agent.count()}`);
    console.log(`   Tasks: ${await prisma.task.count()}`);
    console.log(`   Messages: ${await prisma.message.count()}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });