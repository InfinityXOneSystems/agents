import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { motion } from 'framer-motion'
import { Zap, Brain, BarChart, AlertCircle, Radio, Server } from 'lucide-react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
  getOllamaModels,
  processWithOllama,
  getOllamaHealth,
  findWorkingOllamaInstance,
} from '@/lib/ollama-client'

const CLOUD_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function CloudAIPage() {
  // UI State
  const [activeTab, setActiveTab] = useState('cloud')
  
  // Shared State
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [cost, setCost] = useState(0)
  const [health, setHealth] = useState(null)
  const [tokens, setTokens] = useState(0)

  // Ollama specific state
  const [ollamaHost, setOllamaHost] = useState(null)
  const [ollamaAvailable, setOllamaAvailable] = useState(false)

  useEffect(() => {
    initializeBackends()
  }, [])

  const initializeBackends = async () => {
    // Initialize Cloud AI (Vertex) - Primary
    await fetchCloudModels()
    await fetchCloudHealth()

    // Initialize Ollama - Secondary
    const workingOllamaHost = await findWorkingOllamaInstance()
    if (workingOllamaHost) {
      setOllamaHost(workingOllamaHost)
      setOllamaAvailable(true)
      await fetchOllamaModels(workingOllamaHost)
      await fetchOllamaHealth(workingOllamaHost)
    }
  }

  // ============ CLOUD AI (VERTEX) FUNCTIONS ============

  const fetchCloudModels = async () => {
    try {
      const response = await axios.get(`${CLOUD_API_URL}/cloud/models`)
      const cloudModels = response.data.models || []
      setModels(cloudModels)
      if (cloudModels.length > 0 && activeTab === 'cloud') {
        setSelectedModel(cloudModels[0].id)
      }
      return cloudModels
    } catch (err) {
      console.error('Error fetching cloud models:', err)
      setError('Failed to load Vertex AI models. Make sure the backend is running on port 3001.')
      return []
    }
  }

  const fetchCloudHealth = async () => {
    try {
      const response = await axios.get(`${CLOUD_API_URL}/cloud/health`)
      setHealth(response.data)
    } catch (err) {
      console.error('Error fetching cloud health:', err)
    }
  }

  const processWithCloud = async (promptText, modelId) => {
    try {
      const response = await axios.post(`${CLOUD_API_URL}/cloud/ai/process`, {
        prompt: promptText,
        modelId: modelId,
        config: {
          temperature: 0.7,
          maxTokens: 500
        }
      })

      return {
        result: response.data.result?.response || 'Processing complete',
        cost: response.data.cost_estimate?.total_cost || 0,
        tokens: response.data.usage?.total_tokens || 0,
        source: 'cloud'
      }
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Cloud processing failed')
    }
  }

  // ============ OLLAMA FUNCTIONS ============

  const fetchOllamaModels = async (host) => {
    try {
      const ollamaModels = await getOllamaModels(host)
      if (activeTab === 'ollama') {
        setModels(ollamaModels)
        if (ollamaModels.length > 0) {
          setSelectedModel(ollamaModels[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching Ollama models:', err)
    }
  }

  const fetchOllamaHealth = async (host) => {
    try {
      const healthData = await getOllamaHealth(host)
      if (activeTab === 'ollama') {
        setHealth(healthData)
      }
    } catch (err) {
      console.error('Error fetching Ollama health:', err)
    }
  }

  const processWithOllamaBackend = async (promptText, modelId) => {
    try {
      const result = await processWithOllama(
        promptText,
        modelId,
        { temperature: 0.7, num_predict: 500 },
        ollamaHost
      )
      return result
    } catch (err) {
      throw new Error('Ollama processing failed: ' + err.message)
    }
  }

  // ============ UNIFIED PROCESSING ============

  const handleProcess = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError('')
    setResult('')
    setCost(0)
    setTokens(0)

    try {
      let response

      if (activeTab === 'ollama' && ollamaAvailable) {
        response = await processWithOllamaBackend(prompt, selectedModel)
      } else {
        response = await processWithCloud(prompt, selectedModel)
      }

      setResult(response.result)
      setCost(response.cost || 0)
      setTokens(response.tokens || 0)
    } catch (err) {
      setError(err.message || 'Processing failed. Please try again.')
      console.error('Error processing request:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    setModels([])
    setSelectedModel('')
    setResult('')
    setCost(0)
    setTokens(0)
    setError('')

    if (tab === 'cloud') {
      const cloudModels = await fetchCloudModels()
      if (cloudModels.length > 0) {
        setSelectedModel(cloudModels[0].id)
      }
      await fetchCloudHealth()
    } else if (tab === 'ollama' && ollamaHost) {
      await fetchOllamaModels(ollamaHost)
      await fetchOllamaHealth(ollamaHost)
    }
  }

  // ============ RENDER ============

  const tabClasses = {
    cloud: activeTab === 'cloud' 
      ? 'border-blue-500 text-blue-600 bg-blue-50' 
      : 'border-transparent text-gray-500 hover:border-gray-300',
    ollama: activeTab === 'ollama' 
      ? 'border-green-500 text-green-600 bg-green-50' 
      : 'border-transparent text-gray-500 hover:border-gray-300'
  }

  return (
    <>
      <Helmet>
        <title>Cloud AI - InfinityXAI</title>
        <meta name="description" content="Process requests with Vertex AI or local Ollama models" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Processing</h1>
                <p className="text-slate-400 mt-1">Vertex AI or Local Ollama</p>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-700">
              <button
                onClick={() => handleTabChange('cloud')}
                className={`px-4 py-3 border-b-2 font-medium transition-all flex items-center gap-2 ${tabClasses.cloud}`}
              >
                <Server className="w-4 h-4" />
                Vertex AI
              </button>
              {ollamaAvailable && (
                <button
                  onClick={() => handleTabChange('ollama')}
                  className={`px-4 py-3 border-b-2 font-medium transition-all flex items-center gap-2 ${tabClasses.ollama}`}
                >
                  <Radio className="w-4 h-4" />
                  Ollama
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Health Status */}
          {health && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-4 rounded-lg ${
                activeTab === 'cloud'
                  ? 'bg-blue-900/20 border border-blue-700/50'
                  : 'bg-green-900/20 border border-green-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className={activeTab === 'cloud' ? 'text-blue-300' : 'text-green-300'}>
                  {activeTab === 'cloud' ? 'Vertex AI' : 'Ollama'} is{' '}
                  {health.status === 'healthy' || health.status === 'operational' ? 'healthy' : 'degraded'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </motion.div>
          )}

          {/* Main Form */}
          <motion.form
            onSubmit={handleProcess}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Choose a model...</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.size ? `(${model.size})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Enter your prompt for ${activeTab === 'cloud' ? 'Vertex AI' : 'Ollama'}...`}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors h-32 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                {prompt.length} characters
              </p>
            </div>

            {/* Process Button */}
            <Button
              type="submit"
              disabled={loading || !selectedModel || !prompt.trim()}
              className={`w-full py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'cloud'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-700'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Process with {activeTab === 'cloud' ? 'Vertex AI' : 'Ollama'}
                </>
              )}
            </Button>
          </motion.form>

          {/* Result Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mt-12 p-8 rounded-lg border ${
                activeTab === 'cloud'
                  ? 'bg-blue-900/10 border-blue-700/50'
                  : 'bg-green-900/10 border-green-700/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold">Result</h3>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-lg mb-4 max-h-96 overflow-y-auto">
                <p className="text-slate-200 whitespace-pre-wrap">{result}</p>
              </div>

              {/* Cost/Token Info */}
              <div className={`flex items-center gap-2 text-sm ${
                activeTab === 'cloud' ? 'text-blue-300' : 'text-green-300'
              }`}>
                <div className="w-2 h-2 rounded-full" style={{
                  backgroundColor: activeTab === 'cloud' ? '#60a5fa' : '#4ade80'
                }}></div>
                {activeTab === 'cloud' ? (
                  <>
                    <span className="font-semibold">${cost.toFixed(4)}</span>
                    <span className="text-slate-400">estimated cost</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{tokens} tokens</span>
                    <span className="text-slate-400">used (local, no cost)</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid md:grid-cols-2 gap-6"
          >
            {/* Vertex AI Feature */}
            <div className="p-6 bg-blue-900/20 border border-blue-700/50 rounded-lg hover:border-blue-600/80 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-blue-300">Vertex AI</h4>
              </div>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>✓ Advanced models (Gemini, PaLM)</li>
                <li>✓ Enterprise-grade reliability</li>
                <li>✓ Production-ready APIs</li>
                <li>✓ Scalable inference</li>
              </ul>
            </div>

            {/* Ollama Feature */}
            <div className="p-6 bg-green-900/20 border border-green-700/50 rounded-lg hover:border-green-600/80 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Radio className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-green-300">Ollama (Local)</h4>
              </div>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>✓ Runs locally with no cost</li>
                <li>✓ Zero latency inference</li>
                <li>✓ Complete data privacy</li>
                <li>✓ Offline capability</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}


