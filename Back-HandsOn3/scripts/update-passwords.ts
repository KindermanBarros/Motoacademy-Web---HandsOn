import { prisma } from '../prisma/client';
import { hash } from 'bcrypt';

async function updateExistingUsers() {
  try {
    console.log('Starting password update for existing users...');

    const temporaryPassword = await hash('CHANGE_ME_TEMPORARY', 10);

    const result = await prisma.user.updateMany({
      where: {
        OR: [{ password: undefined }, { password: '' }]
      },
      data: {
        password: temporaryPassword
      }
    });

    console.log(`Successfully updated ${result.count} users`);
    await prisma.$disconnect();
    return result.count;
  } catch (error) {
    console.error('Error updating passwords:', error);
    await prisma.$disconnect();
    throw error;
  }
}

updateExistingUsers()
  .then((count) => {
    console.log(`Migration completed. Updated ${count} users.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
