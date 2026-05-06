const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admiralty Club API",
      version: "1.0.0",
      description: "API documentation for Admiralty Club Golf Simulator",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Simulator: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Bay 1" },
            locationId: { type: "integer", example: 1 },
            status: { type: "string", example: "ACTIVE" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Location: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Downtown Golf Hub" },
            address: { type: "string", example: "123 Main St, New York, NY 10001" },
            createdAt: { type: "string", format: "date-time" },
            simulators: {
              type: "array",
              items: { $ref: "#/components/schemas/Simulator" },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
