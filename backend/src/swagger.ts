import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flavours From Home - Main API',
      version: '1.0.0',
      description: 'API documentation for Flavours From Home e-commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@flavoursfromhome.com'
      }
    },
    servers: [
      {
        url: 'https://flavours-from-home.co.uk',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
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
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            weight: { type: 'string' },
            image_url: { type: 'string' },
            category_id: { type: 'integer' },
            inventory: { type: 'integer' },
            is_active: { type: 'boolean' },
            has_limit: { type: 'boolean' },
            max_per_order: { type: 'integer', nullable: true },
            average_rating: { type: 'number', nullable: true },
            rating_count: { type: 'integer' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            first_name: { type: 'string' },
            email: { type: 'string' },
            phone_number: { type: 'string' },
            address: { type: 'string' },
            total_amount: { type: 'number' },
            payment_method: { type: 'string', enum: ['CASH', 'ONLINE'] },
            order_date: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'delivered', 'cancelled'] },
            driver_id: { type: 'integer', nullable: true }
          }
        },
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            is_active: { type: 'boolean' },
            is_super_admin: { type: 'boolean' },
            role: { type: 'string', enum: ['admin', 'driver'] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_id: { type: 'integer' },
            overall_rating: { type: 'integer', minimum: 1, maximum: 5 },
            product_ratings: { type: 'object' },
            comments: { type: 'string' },
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
      { name: 'Test', description: 'API health check' },
      { name: 'Products', description: 'Product management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Admin', description: 'Admin user management' },
      { name: 'Delivery', description: 'Delivery route management' },
      { name: 'Payment', description: 'Payment processing' },
      { name: 'Feedback', description: 'Customer feedback' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
