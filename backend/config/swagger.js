const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      description: 'API documentation for the user management backend.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {},
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phonenumber: { type: 'string', nullable: true, example: '+15551234567' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
            photo: { type: 'string', nullable: true, example: '/uploads/photo.jpg' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstname', 'lastname', 'email', 'password'],
          properties: {
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phonenumber: { type: 'string', example: '+15551234567' },
            password: { type: 'string', minLength: 4, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        UserUpdateRequest: {
          type: 'object',
          required: ['firstname', 'lastname', 'email'],
          properties: {
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phonenumber: { type: 'string', example: '+15551234567' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Check server health',
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Log in a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            400: { description: 'Validation error' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get the authenticated user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile fetched' },
            401: { description: 'Authentication required' },
          },
        },
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List users',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Users fetched successfully' },
            401: { description: 'Authentication required' },
            403: { description: 'Admin access required' },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get a user by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'User fetched successfully' },
            401: { description: 'Authentication required' },
            403: { description: 'Admin access required' },
            404: { description: 'User not found' },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update a user',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserUpdateRequest' },
              },
            },
          },
          responses: {
            200: { description: 'User updated successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Authentication required' },
            403: { description: 'Admin access required' },
            404: { description: 'User not found' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete a user',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'User deleted successfully' },
            401: { description: 'Authentication required' },
            403: { description: 'Admin access required' },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/users/profile/photo': {
        put: {
          tags: ['Users'],
          summary: 'Update authenticated user profile photo',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['photo'],
                  properties: {
                    photo: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Profile photo updated' },
            400: { description: 'No file uploaded' },
            401: { description: 'Authentication required' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
