// ─────────────────────────────────────────────────────────────
// seed.js — Creates the initial admin user in the database
//
// Run once after setting up:
//   npm run seed
//
// Safe to run multiple times — findOrCreate() skips insertion
// if admin@test.com already exists.
//
// Login credentials after seeding:
//   Email:    admin@test.com
//   Password: 1234
// ─────────────────────────────────────────────────────────────

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const User = require('./models/User');

async function seed() {
  try {
    // Make sure the users table exists before inserting
    await sequelize.sync({ alter: true });

    // Hash the password before storing (even seed data should be hashed)
    const hashedPassword = await bcrypt.hash('1234', 10);

    // findOrCreate:
    //   - Finds a user where email = 'admin@test.com'
    //   - If found → do nothing, return [user, false]
    //   - If not found → create with 'defaults', return [user, true]
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@test.com',
        phonenumber: '0000000000',
        password: hashedPassword,
        role: 'admin',
      },
    });

    if (created) {
      console.log('Seed complete! Login: admin@test.com / 1234');
    } else {
      console.log('Admin user already exists. Skipped.');
    }

    process.exit(0);

  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
