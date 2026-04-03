import { PrismaClient, Role, Status, RecordType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@finance.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      status: Status.ACTIVE,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@finance.com',
      name: 'Analyst User',
      password: hashedPassword,
      role: Role.ANALYST,
      status: Status.ACTIVE,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@finance.com',
      name: 'Viewer User',
      password: hashedPassword,
      role: Role.VIEWER,
      status: Status.ACTIVE,
    },
  });

  console.log('✅ Users created:', { admin: admin.email, analyst: analyst.email, viewer: viewer.email });

  // Create financial records
  const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Consulting'],
    expense: ['Rent', 'Utilities', 'Groceries', 'Transportation', 'Office Supplies', 'Software', 'Marketing', 'Insurance'],
  };

  const records = [];

  // Generate records for the last 6 months
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);

    // Income records
    for (const category of categories.income) {
      const amount = Math.round((Math.random() * 5000 + 1000) * 100) / 100;
      records.push({
        amount,
        type: RecordType.INCOME,
        category,
        date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1),
        description: `${category} payment for ${date.toLocaleString('default', { month: 'long' })}`,
        userId: admin.id,
      });
    }

    // Expense records
    for (const category of categories.expense) {
      const amount = Math.round((Math.random() * 2000 + 100) * 100) / 100;
      records.push({
        amount,
        type: RecordType.EXPENSE,
        category,
        date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1),
        description: `${category} expense for ${date.toLocaleString('default', { month: 'long' })}`,
        userId: admin.id,
      });
    }
  }

  await prisma.financialRecord.createMany({ data: records });
  console.log(`✅ Created ${records.length} financial records`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:   admin@finance.com   / password123');
  console.log('   Analyst: analyst@finance.com / password123');
  console.log('   Viewer:  viewer@finance.com  / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
