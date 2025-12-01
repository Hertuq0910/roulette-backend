const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Roulette API',
    version: '1.0.0',
    description:
      'API para gestionar ruletas, aperturas de juego y apuestas a número o color. La documentación facilita las pruebas desde Swagger UI.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local'
    }
  ],
  components: {
    securitySchemes: {
      userIdHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'user-id',
        description: 'Identificador del usuario que realiza la apuesta.'
      }
    },
    schemas: {
      RouletteIdResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Identificador único de la ruleta creada.'
          }
        },
        example: { id: '6658dddfa4d889db18395f30' }
      },
      StatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        },
        example: { success: true, message: 'Roulette opened successfully' }
      },
      BetRequest: {
        type: 'object',
        required: ['betType', 'amount'],
        properties: {
          betType: {
            type: 'string',
            enum: ['number', 'color']
          },
          number: {
            type: 'integer',
            minimum: 0,
            maximum: 36,
            description: 'Obligatorio si betType es number.'
          },
          color: {
            type: 'string',
            enum: ['red', 'black'],
            description: 'Obligatorio si betType es color.'
          },
          amount: {
            type: 'integer',
            minimum: 1,
            maximum: 10000
          }
        },
        example: {
          betType: 'color',
          color: 'red',
          amount: 500
        }
      },
      BetResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          bet: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              rouletteId: { type: 'string' },
              userId: { type: 'string' },
              betType: { type: 'string', enum: ['number', 'color'] },
              number: { type: 'integer', nullable: true },
              color: {
                type: 'string',
                enum: ['red', 'black'],
                nullable: true
              },
              amount: { type: 'integer' }
            }
          }
        }
      },
      CloseRouletteResponse: {
        type: 'object',
        properties: {
          winningNumber: {
            type: 'integer',
            description: 'Número ganador entre 0 y 36.'
          },
          winningColor: {
            type: 'string',
            enum: ['red', 'black']
          },
          bets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                betType: { type: 'string', enum: ['number', 'color'] },
                number: { type: 'integer', nullable: true },
                color: { type: 'string', enum: ['red', 'black'], nullable: true },
                amount: { type: 'integer' },
                isWinner: { type: 'boolean' },
                payout: { type: 'number' }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        },
        example: { message: 'Roulette not found' }
      }
    }
  },
  tags: [
    {
      name: 'Roulettes',
      description: 'Operaciones para crear, abrir y cerrar ruletas.'
    },
    {
      name: 'Bets',
      description: 'Gestión de apuestas en ruletas abiertas.'
    }
  ],
  paths: {
    '/api/roulettes': {
      post: {
        tags: ['Roulettes'],
        summary: 'Crear una ruleta',
        description: 'Crea una nueva ruleta en estado created.',
        responses: {
          201: {
            description: 'Ruleta creada correctamente.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouletteIdResponse' }
              }
            }
          },
          500: {
            description: 'Error del servidor.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/roulettes/{id}/open': {
      patch: {
        tags: ['Roulettes'],
        summary: 'Abrir ruleta',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Identificador de la ruleta.'
          }
        ],
        responses: {
          200: {
            description: 'Estado de apertura de la ruleta.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponse' }
              }
            }
          },
          404: {
            description: 'Ruleta no encontrada.'
          },
          500: {
            description: 'Error del servidor.'
          }
        }
      }
    },
    '/api/roulettes/{id}/bets': {
      post: {
        tags: ['Bets'],
        summary: 'Crear apuesta',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        security: [{ userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BetRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Apuesta creada.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BetResponse' }
              }
            }
          },
          400: {
            description: 'Datos inválidos.'
          },
          404: {
            description: 'Ruleta no encontrada.'
          },
          500: {
            description: 'Error del servidor.'
          }
        }
      }
    },
    '/api/roulettes/{id}/close': {
      post: {
        tags: ['Roulettes'],
        summary: 'Cerrar ruleta y calcular resultados',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Resultados de la ruleta cerrada.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CloseRouletteResponse' }
              }
            }
          },
          400: {
            description: 'La ruleta no está abierta.'
          },
          404: {
            description: 'Ruleta no encontrada.'
          },
          500: {
            description: 'Error del servidor.'
          }
        }
      }
    }
  }
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: []
});

module.exports = swaggerSpec;
