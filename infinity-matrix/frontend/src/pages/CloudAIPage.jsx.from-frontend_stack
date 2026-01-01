import React, { useState, useEffect } from 'react';
import { MessageCircle, Loader, AlertCircle, CheckCircle, DollarSign, Zap } from 'lucide-react';

const CloudAIPage = () => {
  const [models, setModels] = useState([]);
  const [health, setHealth] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [taskType, setTaskType] = useState('general');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingModels, setLoadingModels] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch(`${API_URL}/cloud/models`);
        const data = await response.json();
        setModels(data.models);
      } catch (err) {
        setError('Failed to load cloud models');
        console.error('Error loading models:', err);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, [API_URL]);

  // Load health status
  useEffect(() => {
    const loadHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/cloud/health`);
        const data = await response.json();
        setHealth(data.health);
      } catch (err) {
        console.error('Error loading health status:', err);
      }
    };

    loadHealth();
    const healthInterval = setInterval(loadHealth, 60000);
    return () => clearInterval(healthInterval);
  }, [API_URL]);

  const handleProcess = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch(`${API_URL}/cloud/ai/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model_id: selectedModel,
          task_type: taskType,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process prompt');
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error processing prompt:', err);
    } finally {
      setLoading(false);
    }
  };

  const taskTypes = ['general', 'code', 'chat', 'image', 'research'];

  const getCurrentModel = () => models.find((m) => m.id === selectedModel);

  if (loadingModels) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Loading cloud AI models...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Cloud AI Processing</h1>
          </div>
          <p className="text-xl text-gray-600">
            Leverage Google Vertex AI with intelligent model routing and fallback support
          </p>
        </div>

        {/* Health Status */}
        {health && (
          <div
            className={`mb-8 p-6 rounded-lg border-2 ${
              health.quotas.percentage_used > 80
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-green-50 border-green-300'
            }`}
          >
            <div className="flex items-start gap-4">
              {health.quotas.percentage_used > 80 ? (
                <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4">Service Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-semibold text-lg">{health.service}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Uptime</div>
                    <div className="font-semibold text-lg">{health.uptime_percentage}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Monthly Budget</div>
                    <div className="font-semibold text-lg">
                      ${health.quotas.monthly_spent_usd.toFixed(2)} / ${health.quotas.monthly_budget_usd}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Fallback</div>
                    <div className="font-semibold text-lg">
                      {health.fallback_available ? '✓ Ollama Ready' : '✗ Unavailable'}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        health.quotas.percentage_used > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(health.quotas.percentage_used, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Usage: {health.quotas.percentage_used.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Selection */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-4">Select Model</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all transform hover:scale-102 ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-600 mt-2">{model.description}</div>
                    <div className="flex items-center gap-2 mt-3 text-xs font-medium text-blue-600">
                      <DollarSign className="w-3 h-3" />
                      <span>
                        ${model.input_cost_per_1k}/1k in
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Model Info */}
            {getCurrentModel() && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold mb-4 text-gray-900">
                  {getCurrentModel()?.name} Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Best For:</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getCurrentModel()?.best_for.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Max Tokens</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {getCurrentModel()?.max_tokens}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Output Cost</div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${getCurrentModel()?.output_cost_per_1k}/1k tokens
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Task Type and Parameters */}
            <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
              <h2 className="text-lg font-semibold mb-4">Configuration</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {taskTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-2">
                  Lower = more deterministic, Higher = more creative
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Output Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-4">Your Prompt</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here. Be specific for better results..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={8}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  {prompt.length} characters (~{Math.ceil(prompt.length / 4)} tokens)
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={loading || !prompt.trim()}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing with Cloud AI...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Process with Cloud AI
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1">
            {result ? (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Result
                </h2>

                <div className="space-y-4">
                  {/* Model and timing */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Model:</span> {result.model}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {result.processing_time_ms.toFixed(0)}ms
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Response */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Response</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                      {result.response}
                    </div>
                  </div>

                  {/* Usage Stats */}
                  {result.usage && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Token Usage</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-gray-600">Input</div>
                          <div className="font-semibold text-gray-900">
                            {result.usage.input_tokens}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Output</div>
                          <div className="font-semibold text-gray-900">
                            {result.usage.output_tokens}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Total</div>
                          <div className="font-semibold text-gray-900">
                            {result.usage.total_tokens}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cost */}
                  {result.cost_estimate && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-300">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Cost Estimate</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Input:</span>
                          <span className="font-semibold">
                            ${result.cost_estimate.input_cost.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Output:</span>
                          <span className="font-semibold">
                            ${result.cost_estimate.output_cost.toFixed(6)}
                          </span>
                        </div>
                        <div className="border-t border-green-200 pt-1 mt-1 flex justify-between font-semibold text-green-700">
                          <span>Total:</span>
                          <span>${result.cost_estimate.total_cost.toFixed(6)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudAIPage;
