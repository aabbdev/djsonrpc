const Ajv = require('Ajv');
const ajv = new Ajv({allowUnionTypes: true});

module.exports = ajv.compile({
	description: "A JSON RPC 2.0 request",
	oneOf: [{
			description: "An individual request",
			$ref: "#/definitions/request"
		},
		{
			description: "An array of requests",
			type: "array",
			items: {
				$ref: "#/definitions/request"
			}
		}
	],
	definitions: {
		request: {
			type: "object",
			required: [
				"jsonrpc",
				"method"
			],
			properties: {
				jsonrpc: {
					enum: [
						"2.0"
					]
				},
				method: {
					type: "string"
				},
				id: {
					type: [
						"string",
						"number",
						"null"
					]
				},
				params: {
					type: [
						"array",
						"object"
					]
				}
			}
		}
	}
});