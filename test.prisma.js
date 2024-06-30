const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function main() {
  try {
    await prisma.$connect();
    console.log('Connection successful!');
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();