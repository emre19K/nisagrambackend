// swaggerConfig.js
//SWAGGER AUFRUFEN UNTER: http://localhost:8000/api-docs
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Nisagram API',
      description: 'API documentation for Nisagram project',
      version: '1.0.0',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:8000',
      },
    ],
  },
  apis: ['./endpoints/routes/*.js'], // Path to  API route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
