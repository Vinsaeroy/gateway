const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

const BASE_URL = swagger.servers?.[0]?.url || 'http://localhost:3000/api';

function resolveRef(ref, root) {
    const parts = ref.replace('#/', '').split('/');
    let obj = root;
    for (const p of parts) obj = obj?.[p];
    return obj;
}

function resolveSchema(schema, root) {
    if (!schema) return schema;
    if (schema.$ref) return resolveRef(schema.$ref, root);
    return schema;
}

function generateExample(schema, root, depth = 0) {
    if (!schema) return null;
    if (schema.$ref) schema = resolveRef(schema.$ref, root);
    if (!schema) return null;
    if (schema.example !== undefined) return schema.example;
    if (schema.type === 'object' && schema.properties) {
        const obj = {};
        for (const [key, val] of Object.entries(schema.properties)) {
            obj[key] = generateExample(val, root, depth + 1);
        }
        return obj;
    }
    if (schema.type === 'array') {
        const item = generateExample(schema.items, root, depth + 1);
        return item !== null ? [item] : [];
    }
    if (schema.allOf) {
        let merged = {};
        for (const sub of schema.allOf) {
            const resolved = sub.$ref ? resolveRef(sub.$ref, root) : sub;
            const ex = generateExample(resolved, root, depth + 1);
            if (ex && typeof ex === 'object') merged = { ...merged, ...ex };
        }
        return merged;
    }
    if (schema.enum) return schema.enum[0];
    switch (schema.type) {
        case 'string': return schema.format === 'date-time' ? '2026-01-15T08:00:00.000Z' : (schema.format === 'binary' ? '(binary)' : 'string');
        case 'number': return 0;
        case 'integer': return 0;
        case 'boolean': return true;
        case 'object': return { text: "Hello from WA-AKG!" };
        default: return null;
    }
}

function paramExample(param) {
    if (param.example) return param.example;
    if (param.schema?.example) return param.schema.example;
    if (param.name === 'sessionId') return 'session-01';
    if (param.name === 'jid') return '628123456789@s.whatsapp.net';
    if (param.name === 'id') return 'abc123';
    if (param.name === 'messageId') return 'MSG_ID_123';
    if (param.name === 'labelId') return 'label_01';
    if (param.name === 'replyId') return 'reply_01';
    if (param.name === 'scheduleId') return 'sched_01';
    if (param.name === 'filename') return 'image.jpg';
    if (param.name === 'action') return 'start';
    return 'value';
}

// Generate a properties table from a schema (shows enum, default, required, description)
function generateFieldsTable(schema, root, requiredFields) {
    if (!schema) return '';
    schema = resolveSchema(schema, root);
    if (!schema || !schema.properties) return '';

    const required = requiredFields || schema.required || [];
    let table = '';
    table += `| Field | Type | Required | Description |\n`;
    table += `| :--- | :--- | :--- | :--- |\n`;

    for (const [name, prop] of Object.entries(schema.properties)) {
        let resolved = resolveSchema(prop, root);
        let type = resolved.type || 'any';
        let desc = resolved.description || '';
        const isRequired = required.includes(name) ? '✅ Yes' : 'No';

        // Show enum options
        if (resolved.enum) {
            desc += (desc ? ' ' : '') + '**Options:** `' + resolved.enum.join('`, `') + '`';
        }

        // Show default value
        if (resolved.default !== undefined) {
            desc += (desc ? ' ' : '') + '**Default:** `' + resolved.default + '`';
        }

        // Show nullable
        if (resolved.nullable) {
            type += ', nullable';
        }

        // Show array item type
        if (resolved.type === 'array' && resolved.items) {
            const itemSchema = resolveSchema(resolved.items, root);
            const itemType = itemSchema?.type || 'object';
            type = `array of ${itemType}`;
        }

        // Show format
        if (resolved.format) {
            type += ` (${resolved.format})`;
        }

        table += `| \`${name}\` | ${type} | ${isRequired} | ${desc || '—'} |\n`;
    }
    return table + '\n';
}

let md = '';
md += `# WA-AKG API Documentation\n\n`;
md += `# WhatsApp AI Gateway — Complete API Reference\n\n`;
md += `Professional WhatsApp Gateway REST API with **${Object.keys(swagger.paths).length} routes** for complete WhatsApp automation.\n\n`;

// Auth section
md += `## 🔐 Authentication\n\n`;
md += `All endpoints require one of the following authentication methods:\n\n`;
md += `| Method | Header / Cookie | Example |\n`;
md += `| :--- | :--- | :--- |\n`;
md += `| **API Key** | \`X-API-Key\` (header) | \`X-API-Key: your-api-key-here\` |\n`;
md += `| **Session Cookie** | \`next-auth.session-token\` (cookie) | Automatically managed by browser |\n\n`;

md += `## 📋 Common Parameters\n\n`;
md += `| Parameter | Format | Example |\n`;
md += `| :--- | :--- | :--- |\n`;
md += `| \`sessionId\` | Unique session identifier | \`session-01\` |\n`;
md += `| \`jid\` (Personal) | \`{countryCode}{number}@s.whatsapp.net\` | \`628123456789@s.whatsapp.net\` |\n`;
md += `| \`jid\` (Group) | \`{groupId}@g.us\` | \`120363123456789@g.us\` |\n\n`;
md += `---\n\n`;

// Group by tags
const tagMap = {};
for (const [path, methods] of Object.entries(swagger.paths)) {
    for (const [method, spec] of Object.entries(methods)) {
        const tag = spec.tags?.[0] || 'Other';
        if (!tagMap[tag]) tagMap[tag] = [];
        tagMap[tag].push({ path, method: method.toUpperCase(), spec });
    }
}

for (const [tag, endpoints] of Object.entries(tagMap)) {
    md += `## 📂 ${tag}\n\n`;

    for (const { path, method, spec } of endpoints) {
        const deprecated = spec.deprecated ? '~~' : '';
        md += `### ${deprecated}\\[${method}\\] ${path}${deprecated}\n\n`;
        if (spec.deprecated) md += `> ⚠️ **DEPRECATED** — ${spec.description || ''}\n\n`;

        md += `**${spec.summary || ''}**\n\n`;
        if (spec.description && !spec.deprecated) md += `${spec.description}\n\n`;

        // Parameters table (path, query)
        const params = spec.parameters || [];
        if (params.length > 0) {
            md += `#### Parameters\n\n`;
            md += `| Name | Located in | Required | Type | Description |\n`;
            md += `| :--- | :--- | :--- | :--- | :--- |\n`;
            for (const p of params) {
                let type = p.schema?.type || 'string';
                let desc = p.description || '';
                if (p.schema?.enum) {
                    desc += (desc ? ' ' : '') + '**Options:** `' + p.schema.enum.join('`, `') + '`';
                }
                if (p.schema?.default !== undefined) {
                    desc += (desc ? ' ' : '') + '**Default:** `' + p.schema.default + '`';
                }
                md += `| \`${p.name}\` | ${p.in} | ${p.required ? '✅ Yes' : 'No'} | ${type} | ${desc || '—'} |\n`;
            }
            md += `\n`;
        }

        // Request body
        const reqBody = spec.requestBody;
        if (reqBody) {
            md += `#### Headers\n\n`;
            md += `\`\`\`\nX-API-Key: your-api-key\nContent-Type: application/json\n\`\`\`\n\n`;

            const contentTypes = reqBody.content || {};
            for (const [ct, ctSpec] of Object.entries(contentTypes)) {
                md += `#### Request Body (\`${ct}\`)\n\n`;

                // Generate fields table with enum, default, required
                const schema = resolveSchema(ctSpec.schema, swagger);
                if (schema) {
                    const fieldsTable = generateFieldsTable(schema, swagger, schema.required);
                    if (fieldsTable) {
                        md += fieldsTable;
                    }
                }

                // JSON example
                let example = ctSpec.example || generateExample(ctSpec.schema, swagger);
                if (example && typeof example === 'object') {
                    md += `**Example:**\n\n`;
                    md += `\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\`\n\n`;
                } else if (ct === 'multipart/form-data') {
                    md += `> Send as \`multipart/form-data\` with a \`file\` field.\n\n`;
                }
            }
        }

        // Responses
        const responses = spec.responses || {};
        const responseCodes = Object.keys(responses);
        if (responseCodes.length > 0) {
            md += `#### Responses\n\n`;
            md += `| Code | Description |\n`;
            md += `| :--- | :--- |\n`;
            for (const [code, resp] of Object.entries(responses)) {
                let resolved = resp;
                if (resp.$ref) resolved = resolveRef(resp.$ref, swagger);
                md += `| \`${code}\` | ${resolved?.description || ''} |\n`;
            }
            md += `\n`;

            // Show 200 response example
            let resp200 = responses['200'];
            if (resp200?.$ref) resp200 = resolveRef(resp200.$ref, swagger);
            if (resp200?.content) {
                for (const [ct, ctSpec] of Object.entries(resp200.content)) {
                    // Show response fields table
                    const respSchema = resolveSchema(ctSpec.schema, swagger);
                    if (respSchema && respSchema.properties) {
                        md += `**Response Fields (\`200\`):**\n\n`;
                        md += generateFieldsTable(respSchema, swagger);
                    }

                    let example = ctSpec.example || generateExample(ctSpec.schema, swagger);
                    if (example && typeof example === 'object') {
                        md += `**Response Example (\`200\`):**\n\n`;
                        md += `\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\`\n\n`;
                    }
                }
            }
        }

        // cURL example
        const pathParams = params.filter(p => p.in === 'path');
        const queryParams = params.filter(p => p.in === 'query');
        let curlPath = path;
        for (const p of pathParams) {
            curlPath = curlPath.replace(`{${p.name}}`, paramExample(p));
        }
        let curlUrl = `${BASE_URL}${curlPath}`;
        if (queryParams.length > 0) {
            const qs = queryParams.map(p => `${p.name}=${paramExample(p)}`).join('&');
            curlUrl += `?${qs}`;
        }

        md += `#### cURL Example\n\n`;
        md += `\`\`\`bash\ncurl -X ${method} "${curlUrl}"`;
        md += ` \\\n  -H "X-API-Key: your-api-key"`;

        if (reqBody) {
            const contentTypes = reqBody.content || {};
            const firstCt = Object.keys(contentTypes)[0];
            if (firstCt === 'multipart/form-data') {
                md += ` \\\n  -F "file=@/path/to/file.jpg" \\\n  -F "type=image" \\\n  -F "caption=Hello"`;
            } else {
                md += ` \\\n  -H "Content-Type: application/json"`;
                const ctSpec = contentTypes[firstCt];
                let example = ctSpec?.example || generateExample(ctSpec?.schema, swagger);
                if (example && typeof example === 'object') {
                    const jsonStr = JSON.stringify(example);
                    md += ` \\\n  -d '${jsonStr}'`;
                }
            }
        }
        md += `\n\`\`\`\n\n`;
        md += `---\n\n`;
    }
}

// Schemas section
md += `## 📦 Schemas\n\n`;
for (const [name, schema] of Object.entries(swagger.components?.schemas || {})) {
    md += `### ${name}\n\n`;
    const resolved = resolveSchema(schema, swagger);
    if (resolved && resolved.properties) {
        md += generateFieldsTable(resolved, swagger);
    }
    const example = generateExample(schema, swagger);
    if (example) {
        md += `**Example:**\n\n`;
        md += `\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\`\n\n`;
    }
}

fs.writeFileSync('docs/API_DOCUMENTATION.md', md, 'utf8');
console.log(`Generated API_DOCUMENTATION.md with ${Object.keys(swagger.paths).length} routes.`);
