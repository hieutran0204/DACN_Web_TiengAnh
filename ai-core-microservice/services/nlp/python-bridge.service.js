/**
 * services/nlp/python-bridge.service.js
 *
 * Bridges Node.js with the Python spaCy/Transformer Layer 1.
 * Hardened with retry x3 (exponential backoff) and a quality flag
 * so the pipeline can detect and handle degraded mode gracefully.
 */
const { spawn } = require('child_process');
const path = require('path');

// Delay helper for exponential backoff
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class PythonBridgeService {
  constructor() {
    this.MAX_RETRIES = 3;
    this.BASE_DELAY_MS = 500; // 500ms → 1000ms → 2000ms
    // Quality flag: true = Python NLP available, false = degraded mode (Compromise fallback)
    this.isHealthy = true;
  }

  /**
   * Invoke the Python advanced_nlp.py script for a single attempt.
   * Resolves with parsed JSON result or rejects on any error.
   *
   * @param {string} text - Essay text to process
   * @returns {Promise<Object|null>}
   */
  _invokeOnce(text) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'advanced_nlp.py');
      const python = spawn('python', [scriptPath]);

      let dataString = '';
      let errorString = '';

      python.stdin.write(text);
      python.stdin.end();

      python.stdout.on('data', (data) => { dataString += data.toString(); });
      python.stderr.on('data', (data) => { errorString += data.toString(); });

      python.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python exited with code ${code}. Stderr: ${errorString.slice(0, 300)}`));
        }
        try {
          const result = JSON.parse(dataString);
          if (result.error) {
            return reject(new Error(`Python NLP returned error: ${result.error}`));
          }
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e.message}`));
        }
      });

      python.on('error', (err) => {
        reject(new Error(`Failed to spawn Python process: ${err.message}`));
      });
    });
  }

  /**
   * Call the advanced_nlp.py script with retry x3 and exponential backoff.
   * Returns null on permanent failure, allowing writing.service.js to
   * fallback gracefully to Compromise NLP.
   *
   * Sets `this.isHealthy` so callers can detect degraded pipeline mode.
   *
   * @param {string} text - Essay text
   * @returns {Promise<Object|null>} Parsed NLP result, or null on failure
   */
  async getAdvancedNLP(text) {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await this._invokeOnce(text);
        // Recovered — mark healthy again
        if (!this.isHealthy) {
          console.log('✅ Python Bridge: recovered after retry. Marking as healthy.');
          this.isHealthy = true;
        }
        return result;
      } catch (err) {
        const waitMs = this.BASE_DELAY_MS * Math.pow(2, attempt - 1); // 500, 1000, 2000
        console.warn(`⚠️ Python Bridge attempt ${attempt}/${this.MAX_RETRIES} failed: ${err.message}`);
        if (attempt < this.MAX_RETRIES) {
          console.warn(`   Retrying in ${waitMs}ms...`);
          await delay(waitMs);
        }
      }
    }

    // All retries exhausted — enter degraded mode
    this.isHealthy = false;
    console.error('❌ Python Bridge: all retries exhausted. Pipeline will run in DEGRADED MODE (Compromise NLP fallback).');
    return null;
  }
}

module.exports = new PythonBridgeService();

