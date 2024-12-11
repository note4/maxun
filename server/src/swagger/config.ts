import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Website to API',
      version: '1.0.0',
      description: 'Maxun lets you get the data your robot extracted and run robots via API. All you need to do is input the Maxun API key by clicking Authorize below.',
    },
    components: {
      securitySchemes: {
        api_key: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authorization. You can find your API key in the "API Key" section on Maxun Dashboard.',
        },
      },
    },
    security: [
      {
        api_key: [], // Apply this security scheme globally
      },
    ],
  },
  apis: process.env.NODE_ENV === 'production' ? [path.join(__dirname, '../api/*.js')] : [path.join(__dirname, '../api/*.ts')]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
