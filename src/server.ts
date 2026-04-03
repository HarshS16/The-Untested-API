import { PrismaClient } from '@prisma/client';
import app from './app';
import { config } from './config';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start HTTP server
    app.listen(config.port, () => {
      console.log(`\n🚀 Finance Dashboard API is running`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Server:      http://localhost:${config.port}`);
      console.log(`   API Docs:    http://localhost:${config.port}/api/docs`);
      console.log(`   Health:      http://localhost:${config.port}/api/health`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
