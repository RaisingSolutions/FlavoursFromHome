import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flavours From Home - Halfway House API',
      version: '1.0.0',
      description: 'API documentation for Halfway House shift management system',
      contact: {
        name: 'API Support',
        email: 'support@flavoursfromhome.com'
      }
    },
    servers: [
      {
        url: 'https://flavours-from-home.co.uk/halfway',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Shift: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            shift_date: { type: 'string', format: 'date' },
            start_time: { type: 'string', format: 'time' },
            end_time: { type: 'string', format: 'time' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Users', description: 'User management' },
      { name: 'Shifts', description: 'Shift management' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
