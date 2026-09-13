# Vertical Slice Tutorial — Register Endpoint Only

Build just enough of the project to make `POST /api/auth/register` work end-to-end: model → service → controller → route → app → server.

## 1. Init project

```bash
mkdir backend && cd backend
npm init -y
npm install express dotenv mysql2 sequelize bcryptjs
npm install --save-dev nodemon
```

```
backend/
  src/
    config/
    controllers/
    models/
    routes/
    services/
    utils/
  .env
  .env.example
  package.json
  package-lock.json
```

`package.json`
```json
{
  "name": "user-management-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "sequelize": "^6.35.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 2. Env config

`.env`
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=miniapp1
```

## 3. DB connection

`src/config/db.js`
```js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
```

## 4. Model

`src/models/User.js`
```js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  firstname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  lastname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },

  phonenumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  },

}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
```

## 5. Utilities

`src/utils/response.js`
```js
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = 'Internal Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { success, error };
```

`src/utils/logger.js`
```js
const log = (level, message) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level.toUpperCase()}] ${message}`);
};

module.exports = {
  info:  (msg) => log('info', msg),
  error: (msg) => log('error', msg),
  warn:  (msg) => log('warn', msg),
};
```

## 6. Service

`src/services/authService.js`
```js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const register = async ({ firstname, lastname, email, phonenumber, password }) => {
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname,
    lastname,
    email,
    phonenumber: phonenumber || null,
    password: hashedPassword,
    role: 'user',
  });

  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  };
};

module.exports = { register };
```

## 7. Controller

`src/controllers/authController.js`
```js
const authService = require('../services/authService');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res, next) => {
  try {
    const { firstname, lastname, email, phonenumber, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return error(res, 'firstname, lastname, email, and password are required', 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      return error(res, 'Invalid email format', 400);
    }
    if (password.length < 4) {
      return error(res, 'Password must be at least 4 characters', 400);
    }

    const result = await authService.register({ firstname, lastname, email, phonenumber, password });
    logger.info(`New user registered: ${email}`);
    return success(res, result, 'User registered successfully', 201);

  } catch (err) {
    next(err);
  }
};

module.exports = { register };
```

## 8. Route

`src/routes/authRoutes.js`
```js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);

module.exports = router;
```

## 9. App

`src/app.js`
```js
const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
```

## 10. Server

`src/server.js`
```js
require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    logger.info('Database synced successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Database sync failed: ${err.message}`);
    process.exit(1);
  });
```

## 11. Run and test

```bash
npm run dev
```

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@test.com","password":"1234"}'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@test.com"
  }
}
```
