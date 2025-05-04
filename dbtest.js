// Simple script to test database connection and inspect schema
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Connect to the database
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully');
    
    // Get the database schema information
    console.log('\nDatabase tables and structure:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('Tables:', tables);
    
    // Try to get a list of all users
    console.log('\nAttempting to list all users:');
    const users = await prisma.user.findMany();
    console.log('Users found:', users);
    
    // Try to create a test user
    console.log('\nAttempting to create a test user:');
    try {
      const newUser = await prisma.user.create({
        data: {
          username: 'testuser123',
          email: 'test@example.com',
          auth: {
            create: {
              identities: {
                create: {
                  providerName: 'usernameAndPassword',
                  providerUserId: 'testuser123',
                  providerData: '{}'
                }
              }
            }
          }
        },
        include: {
          auth: true
        }
      });
      console.log('User created successfully:', newUser);
    } catch (createError) {
      console.error('Error creating user:', createError);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 