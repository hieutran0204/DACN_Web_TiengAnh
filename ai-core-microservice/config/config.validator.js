/**
 * name: config.validator.js
 * description: Startup configuration validator for the AI Core Microservice.
 *
 * Validates all required environment variables at process startup before
 * any services are initialized. Fails fast with clear, actionable error
 * messages instead of cryptic runtime errors deep inside service code.
 *
 * Usage: require this file as the FIRST import in server.js / app entry point.
 *   require('./config/config.validator');
 *
 * Design rationale:
 *   - No external dependencies (Joi/Zod not needed for 18 vars).
 *   - Groups variables by service dependency for easier debugging.
 *   - Validates types, not just presence (e.g., numeric ports, boolean flags).
 *   - All errors collected and printed together — one fix pass, not N sequential runs.
 */

// ─── Schema Definition ────────────────────────────────────────────────────────

/**
 * @typedef {Object} EnvVarSpec
 * @property {string}   key      - Environment variable name
 * @property {boolean}  required - Whether absence = startup failure
 * @property {'string'|'number'|'url'|'boolean'} type - Expected type
 * @property {*}        [default] - Default value if optional and absent
 * @property {string}   description - Human-readable description for error messages
 */

/** @type {EnvVarSpec[]} */
const CONFIG_SCHEMA = [
  // ── Ollama / LLM ────────────────────────────────────────────────────────────
  {
    key: 'OLLAMA_BASE_URL',
    required: true,
    type: 'url',
    description: 'Ollama server base URL (e.g. http://localhost:11434)'
  },
  {
    key: 'MICRO_MODEL_NAME',
    required: true,
    type: 'string',
    description: 'Ollama model for MicroEvaluatorService (e.g. gemma4:e4b)'
  },
  {
    key: 'NODE2_MODEL_NAME',
    required: false,
    type: 'string',
    default: 'gpt-oss:20b-cloud',
    description: 'Ollama model for Node 2 FeedbackGeneratorService'
  },

  // ── Neo4j / GraphRAG ────────────────────────────────────────────────────────
  {
    key: 'NEO4J_URI',
    required: true,
    type: 'url',
    description: 'Neo4j Bolt URI (e.g. bolt://localhost:7687)'
  },
  {
    key: 'NEO4J_USER',
    required: true,
    type: 'string',
    description: 'Neo4j username'
  },
  {
    key: 'NEO4J_PASSWORD',
    required: true,
    type: 'string',
    description: 'Neo4j password'
  },

  // ── Python Bridge ────────────────────────────────────────────────────────────
  {
    key: 'PYTHON_PATH',
    required: false,
    type: 'string',
    default: 'python',
    description: 'Path to Python executable (absolute path or "python" if in PATH)'
  },
  {
    key: 'PYTHON_NLP_SCRIPT',
    required: false,
    type: 'string',
    default: './python/nlp_processor.py',
    description: 'Path to Python NLP bridge script'
  },

  // ── API Server ──────────────────────────────────────────────────────────────
  {
    key: 'PORT',
    required: false,
    type: 'number',
    default: '3001',
    description: 'HTTP server port for AI Core Microservice'
  },

  // ── Vector Store ─────────────────────────────────────────────────────────────
  {
    key: 'VECTOR_STORE_PATH',
    required: false,
    type: 'string',
    default: './data/vector_store.ndjson',
    description: 'Path to NDJSON flat-file vector store'
  },

  // ── Knowledge Base ───────────────────────────────────────────────────────────
  {
    key: 'KNOWLEDGE_BASE_PATH',
    required: false,
    type: 'string',
    default: './md',
    description: 'Directory containing Markdown knowledge base files'
  },

  // ── Feature Flags ────────────────────────────────────────────────────────────
  {
    key: 'ENABLE_GRAPH_COHERENCE',
    required: false,
    type: 'boolean',
    default: 'true',
    description: 'Enable Neo4j graph-based coherence checking (disable to reduce latency)'
  },
  {
    key: 'ENABLE_PYTHON_NLP',
    required: false,
    type: 'boolean',
    default: 'true',
    description: 'Enable Python bridge for sentence embeddings (disable for keyword-only TR)'
  }
];

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validate a single environment variable against its spec.
 * @param {EnvVarSpec} spec
 * @returns {string|null} Error message or null if valid
 */
function validateVar(spec) {
  const raw = process.env[spec.key];

  // Presence check
  if (raw === undefined || raw === '') {
    if (spec.required) {
      return `[REQUIRED] ${spec.key} is missing. ${spec.description}`;
    }
    // Apply default if provided
    if (spec.default !== undefined) {
      process.env[spec.key] = String(spec.default);
    }
    return null;
  }

  // Type validation
  switch (spec.type) {
    case 'number': {
      const n = Number(raw);
      if (isNaN(n) || n <= 0) {
        return `[TYPE] ${spec.key}="${raw}" must be a positive number. ${spec.description}`;
      }
      break;
    }
    case 'url': {
      try {
        new URL(raw);
      } catch (_) {
        return `[TYPE] ${spec.key}="${raw}" must be a valid URL (include http:// or bolt://). ${spec.description}`;
      }
      break;
    }
    case 'boolean': {
      if (!['true', 'false', '1', '0'].includes(raw.toLowerCase())) {
        return `[TYPE] ${spec.key}="${raw}" must be true/false/1/0. ${spec.description}`;
      }
      break;
    }
    case 'string':
    default:
      // Any non-empty string is valid
      break;
  }

  return null;
}

// ─── Main Validation ──────────────────────────────────────────────────────────

/**
 * Run validation for all config vars.
 * Collects ALL errors before throwing — single pass fix.
 *
 * @throws {Error} If any required variable is missing or any variable has wrong type.
 */
function validateConfig() {
  const errors = [];

  for (const spec of CONFIG_SCHEMA) {
    const error = validateVar(spec);
    if (error) errors.push(error);
  }

  if (errors.length > 0) {
    const header = `\n❌ AI Core Microservice — Configuration Error (${errors.length} issue${errors.length > 1 ? 's' : ''})\n`;
    const body   = errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n');
    const footer = `\n\nCheck your .env file and ensure all required variables are set.\n`;
    throw new Error(header + body + footer);
  }

  // Log validated config summary (without sensitive values)
  console.log('✅ Config validated:',
    `Ollama=${process.env.OLLAMA_BASE_URL}`,
    `| Neo4j=${process.env.NEO4J_URI}`,
    `| Port=${process.env.PORT || 3001}`,
    `| GraphCoherence=${process.env.ENABLE_GRAPH_COHERENCE}`,
    `| PythonNLP=${process.env.ENABLE_PYTHON_NLP}`
  );
}

// ─── Execute ──────────────────────────────────────────────────────────────────

validateConfig();

module.exports = { validateConfig, CONFIG_SCHEMA };
