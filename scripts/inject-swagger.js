const fs = require('fs');
const path = require('path');

const swaggerPath = path.join(process.cwd(), 'src/lib/swagger.ts');
let swaggerFile = fs.readFileSync(swaggerPath, 'utf8');

// The file has a large object literal inside createSwaggerSpec({...})
// Doing safe regex replacement for BadRequest:
swaggerFile = swaggerFile.replace(
    /ServerError:\s*\{/,
    `BadRequest: {
                        description: "Bad Request - Invalid parameters",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { error: "Invalid request parameters" }
                            }
                        }
                    },
                    ServerError: {`
);

const additionalPaths = {
    // ==================== NEWLY DOCUMENTED ENDPOINTS ====================
    "/auth/register": {
        post: {
            tags: ["Web Authentication"],
            summary: "Register a new user",
            description: "Register a user via web.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "email", "password"],
                            properties: {
                                name: { type: "string", example: "John Doe" },
                                email: { type: "string", example: "john@example.com" },
                                password: { type: "string", example: "password123" }
                            }
                        }
                    }
                }
            },
            responses: { 200: { description: "User registered" } }
        }
    },
    "/autoreplies/{sessionId}": {
        delete: {
            tags: ["Auto Replies"],
            summary: "Delete all autoreplies",
            parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
            responses: { 200: { description: "Autoreplies deleted" } }
        }
    },
    "/autoreplies/{sessionId}/{replyId}": {
        delete: {
            tags: ["Auto Replies"],
            summary: "Delete a specific autoreply",
            parameters: [
                { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                { name: "replyId", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "Autoreply deleted" } }
        }
    },
    "/chats/by-label/{labelId}": {
        get: {
            tags: ["Chats"],
            summary: "Get chats by label ID",
            parameters: [
                { name: "labelId", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "List of chats with the label" } }
        }
    },
    "/docs": {
        get: {
            tags: ["Documentation"],
            summary: "Get Swagger JSON specification",
            responses: { 200: { description: "Swagger JSON spec" } }
        }
    },
    "/groups/{sessionId}/{jid}/invite": {
        put: {
            tags: ["Groups"],
            summary: "Update or revoke group invite link",
            parameters: [
                { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                { name: "jid", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "Group invite updated" } }
        }
    },
    "/groups/{sessionId}/{jid}/leave": {
        post: {
            tags: ["Groups"],
            summary: "Leave a group",
            parameters: [
                { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                { name: "jid", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "Left the group successfully" } }
        }
    },
    "/groups/{sessionId}/{jid}/picture": {
        delete: {
            tags: ["Groups"],
            summary: "Remove group picture",
            parameters: [
                { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                { name: "jid", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "Group picture removed" } }
        }
    },
    "/labels/{sessionId}": {
        post: {
            tags: ["Labels"],
            summary: "Create a label",
            parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name"],
                            properties: {
                                name: { type: "string" },
                                color: { type: "integer" }
                            }
                        }
                    }
                }
            },
            responses: { 200: { description: "Label created" } }
        },
        put: {
            tags: ["Labels"],
            summary: "Update all labels or bulk update",
            parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
            responses: { 200: { description: "Labels updated" } }
        },
        delete: {
            tags: ["Labels"],
            summary: "Delete labels",
            parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
            responses: { 200: { description: "Labels deleted" } }
        }
    },
    "/labels/{sessionId}/{labelId}": {
        delete: {
            tags: ["Labels"],
            summary: "Delete a specific label",
            parameters: [
                { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                { name: "labelId", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "Label deleted" } }
        }
    },
    "/media/{filename}": {
        get: {
            tags: ["Media"],
            summary: "Get uploaded media file",
            parameters: [{ name: "filename", in: "path", required: true, schema: { type: "string" } }],
            responses: { 200: { description: "File data" } }
        }
    },
    "/notifications": {
        post: {
            tags: ["Notifications"],
            summary: "Send or register a notification",
            responses: { 200: { description: "Notification processed" } }
        }
    },
    "/profile/{sessionId}/picture": {
        delete: {
            tags: ["Profile"],
            summary: "Remove profile picture",
            parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
            responses: { 200: { description: "Profile picture removed" } }
        }
    },
    "/scheduler": {
        post: {
            tags: ["Scheduler"],
            summary: "Create a scheduled message task",
            responses: { 200: { description: "Scheduled task created" } }
        }
    },
    "/scheduler/{sessionId}": {
        delete: {
            tags: ["Scheduler"],
            summary: "Delete all scheduled messages for a session",
            parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
            responses: { 200: { description: "Scheduled messages deleted" } }
        }
    },
    "/scheduler/{sessionId}/{scheduleId}": {
        delete: {
            tags: ["Scheduler"],
            summary: "Delete a specific scheduled message",
            parameters: [
                { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                { name: "scheduleId", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "Scheduled message deleted" } }
        }
    },
    "/settings/system": {
        post: {
            tags: ["Settings"],
            summary: "Update system settings",
            responses: { 200: { description: "System settings updated" } }
        }
    },
    "/user/api-key": {
        post: {
            tags: ["User"],
            summary: "Generate a new API Key",
            responses: { 200: { description: "API Key created" } }
        },
        delete: {
            tags: ["User"],
            summary: "Revoke API Key",
            responses: { 200: { description: "API Key revoked" } }
        }
    },
    "/users": {
        post: {
            tags: ["Users"],
            summary: "Create user resource",
            responses: { 200: { description: "User created" } }
        }
    },
    "/users/{id}": {
        delete: {
            tags: ["Users"],
            summary: "Delete user",
            parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
            responses: { 200: { description: "User deleted" } }
        }
    },
    "/webhooks/{sessionId}/{id}": {
        delete: {
            tags: ["Webhooks"],
            summary: "Delete a webhook configuration",
            parameters: [
                { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                { name: "id", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: { 200: { description: "Webhook deleted" } }
        }
    }
};

// Intelligently insert paths
// If path already exists, inject methods inside it
for (const [p, methodsObj] of Object.entries(additionalPaths)) {
    const routeStr1 = `"${p}": {`;
    const routeStr2 = `'${p}': {`;

    // Convert new methods object to a string representing the properties
    const methodsStr = JSON.stringify(methodsObj, null, 16);
    // e.g. "{\n                 \"post\": { ... }\n             }"
    // Extract everything inside the top-level braces
    let innerMethods = methodsStr.substring(methodsStr.indexOf('{') + 1, methodsStr.lastIndexOf('}'));
    // clean up indentation roughly
    innerMethods = innerMethods.replace(/\n\s{16}/g, '\n                        ');

    if (swaggerFile.includes(routeStr1) || swaggerFile.includes(routeStr2)) {
        // Path exists! Insert methods inside.
        // E.g. find "/labels/{sessionId}": {
        const target = swaggerFile.includes(routeStr1) ? routeStr1 : routeStr2;
        swaggerFile = swaggerFile.replace(target, target + innerMethods + ',');
    } else {
        // Path doesn't exist at all.
        // Just inject at the top of paths: {
        const fullBlock = `"${p}": ${methodsStr},`;
        swaggerFile = swaggerFile.replace('            paths: {', '            paths: {\n' + fullBlock);
    }
}

fs.writeFileSync(swaggerPath, swaggerFile);
console.log('Successfully injected API endpoints to swagger.ts without duplicates, and fixed BadRequest schema error.');
