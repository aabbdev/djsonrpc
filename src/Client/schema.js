const Ajv = require('Ajv');
const ajv = new Ajv({allowUnionTypes: true});

module.exports = ajv.compile({
  description: "A JSON RPC 2.0 response",
  oneOf: [
    {
      $ref: "#/definitions/success"
    },
    {
      $ref: "#/definitions/error"
    },
    {
      type: "array",
      items: {
        oneOf: [
          {
            $ref: "#/definitions/success"
          },
          {
            $ref: "#/definitions/error"
          }
        ]
      }
    }
  ],
  definitions: {
    common: {
      required: [
        "id",
        "jsonrpc"
      ],
      not: {
        description: "cannot have result and error at the same time",
        required: [
          "result",
          "error"
        ]
      },
      type: "object",
      properties: {
        id: {
          type: [
            "string",
            "integer",
            "null"
          ]
        },
        jsonrpc: {
          enum: [
            "2.0"
          ]
        }
      }
    },
    success: {
      description: "A success. The result member is then required and can be anything.",
      allOf: [
        {
          $ref: "#/definitions/common"
        },
        {
          type: "object",
          required: [
            "result"
          ]
        }
      ]
    },
    error: {
      allOf: [
        {
          $ref: "#/definitions/common"
        },
        {
          required: [
            "error"
          ],
          type: "object",
          properties: {
            error: {
              type: "object",
              required: [
                "code",
                "message"
              ],
              properties: {
                code: {
                  type: "integer"
                },
                message: {
                  type: "string"
                },
                data: {
                  description: "optional, can be anything"
                }
              }
            }
          }
        }
      ]
    }
  }
});