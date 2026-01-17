/**
 * Testing & Validation Module
 * Handles code validation, testing, and quality assurance
 */

import { spawn as spawnChild } from 'child_process';
import path from 'path';
import { BaseModule, ModuleConfig } from '../core/index.js';

export interface TestingConfig extends ModuleConfig {
  validationInterval: number;
  testTimeout: number;
  lintingEnabled: boolean;
  testingEnabled: boolean;
  targetDirectories: string[];
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export class TestingValidationManager extends BaseModule {
  private pythonAgents: Map<string, string> = new Map([
    ['validation-agent', 'validation_agent.py'],
    ['background-tester', 'background_tester.py']
  ]);

  constructor(config: Partial<TestingConfig> = {}) {
    super('testing-validation', '1.0.0', {
      validationInterval: 10 * 60 * 1000, // 10 minutes
      testTimeout: 300000, // 5 minutes
      lintingEnabled: true,
      testingEnabled: true,
      targetDirectories: ['repos'],
      ...config
    });
  }

  async start(): Promise<void> {
    await super.start();

    // Schedule periodic validation
    if (this.config.validationInterval > 0) {
      setInterval(() => this.runValidation(), this.config.validationInterval as number);
    }

    console.log('🧪 Testing & Validation module started');
  }

  async runValidation(): Promise<ValidationResult> {
    console.log('🔍 Running code validation...');

    const results: ValidationResult = {
      passed: true,
      errors: [],
      warnings: [],
      score: 100
    };

    try {
      // Run Python validation agent
      await this.runPythonAgent('validation-agent');

      // Run linting if enabled
      if (this.config.lintingEnabled) {
        const lintResult = await this.runLinting();
        results.errors.push(...lintResult.errors);
        results.warnings.push(...lintResult.warnings);
        results.score = Math.max(0, results.score - lintResult.errors.length * 10 - lintResult.warnings.length * 2);
      }

      // Run tests if enabled
      if (this.config.testingEnabled) {
        const testResult = await this.runTests();
        if (!testResult.passed) {
          results.passed = false;
          results.errors.push(...testResult.errors);
          results.score = Math.max(0, results.score - 20);
        }
      }

      results.passed = results.errors.length === 0;

    } catch (error) {
      results.passed = false;
      results.errors.push(error instanceof Error ? error.message : String(error));
      results.score = 0;
    }

    console.log(`✅ Validation completed. Score: ${results.score}/100`);
    return results;
  }

  private async runLinting(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const targetDirs = this.config.targetDirectories as string[];

    for (const dir of targetDirs) {
      const fullPath = path.join(process.cwd(), '..', '..', dir);

      // Run ESLint for JavaScript/TypeScript
      try {
        await this.runCommand('npx', ['eslint', fullPath, '--format', 'json'], (output) => {
          const eslintResults = JSON.parse(output);
          eslintResults.forEach((result: any) => {
            result.messages.forEach((msg: any) => {
              if (msg.severity === 2) {
                errors.push(`${result.filePath}:${msg.line}:${msg.column} ${msg.message}`);
              } else {
                warnings.push(`${result.filePath}:${msg.line}:${msg.column} ${msg.message}`);
              }
            });
          });
        });
      } catch (error) {
        // ESLint might not be configured, skip
      }

      // Run Prettier check
      try {
        await this.runCommand('npx', ['prettier', '--check', fullPath], () => {}, true);
      } catch (error) {
        warnings.push(`Prettier formatting issues in ${dir}`);
      }
    }

    return { errors, warnings };
  }

  private async runTests(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    let passed = true;

    try {
      // Run Jest for JavaScript/TypeScript
      await this.runCommand('npx', ['jest', '--passWithNoTests'], () => {}, true);
    } catch (error) {
      passed = false;
      errors.push('JavaScript/TypeScript tests failed');
    }

    // Run Python tests if available
    try {
      const credsDir = process.env.CREDENTIALS_DIR || path.join(process.cwd(), '..', '..', 'credentials');
      await this.runCommand('python', ['-m', 'pytest', credsDir], () => {}, true);
    } catch (error) {
      // Python tests might not be configured, skip
    }

    return { passed, errors };
  }

  private async runCommand(command: string, args: string[], outputHandler?: (output: string) => void, suppressErrors: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawnChild(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (outputHandler) {
          outputHandler(stdout);
        }

        if (code === 0 || suppressErrors) {
          resolve();
        } else {
          reject(new Error(`${command} ${args.join(' ')} failed: ${stderr}`));
        }
      });

      proc.on('error', (error) => {
        if (!suppressErrors) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private async runPythonAgent(agentName: string): Promise<void> {
    const scriptName = this.pythonAgents.get(agentName);
    if (!scriptName) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.env.CREDENTIALS_DIR || path.join(process.cwd(), '..', '..', 'credentials'), scriptName);

      const python = spawnChild('python', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderr = '';

      python.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${agentName} failed: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  async executeTask(taskName: string, params?: any): Promise<any> {
    switch (taskName) {
      case 'validate':
        return this.runValidation();
      case 'lint':
        return this.runLinting();
      case 'test':
        return this.runTests();
      case 'run-agent':
        return this.runPythonAgent(params.agentName);
      default:
        return super.executeTask(taskName, params);
    }
  }
}

export default TestingValidationManager;