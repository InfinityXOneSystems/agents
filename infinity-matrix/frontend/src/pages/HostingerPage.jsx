import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Server, 
  Activity, 
  AlertCircle,
  Link as LinkIcon,
  Home,
  RefreshCw
} from 'lucide-react';

const HostingerPage = () => {
  const [hostingerData, setHostingerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHostingerData = async () => {
    try {
      setRefreshing(true);
      // Fetch from the orchestration server's Hostinger endpoint
      const response = await fetch('http://localhost:3001/hostinger/info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setHostingerData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch Hostinger data:', err);
      setError(err.message);
      // Try to use mock data as fallback
      setHostingerData({
        account: { account: 'active', websites: 5, mode: 'mock' },
        url: 'https://example.hostinger.com',
        domains: { domains: [{ name: 'example.com', status: 'active' }] },
        websites: { websites: [{ id: 1, name: 'Default Website', status: 'active' }] }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHostingerData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-[#0091FF] animate-pulse text-center">
          <Server className="w-12 h-12 mx-auto mb-4" />
          <p>Connecting to Hostinger...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <Helmet>
        <title>Hostinger Dashboard - Infinity-Matrix</title>
        <meta name="description" content="Hostinger account dashboard and management" />
      </Helmet>

      <div className="flex-1 bg-black text-white">
        {/* Header */}
        <motion.div 
          className="border-b border-[#0091FF]/20 p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-[#0091FF]" />
              <div>
                <h1 className="text-3xl font-bold">Hostinger Dashboard</h1>
                <p className="text-gray-400">Live account and domain management</p>
              </div>
            </div>
            <motion.button
              onClick={fetchHostingerData}
              disabled={refreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-lg bg-[#0091FF]/10 hover:bg-[#0091FF]/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-[#0091FF] ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          className="p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Status Alert */}
          {error && (
            <motion.div 
              variants={itemVariants}
              className="mb-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-600/40 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-300">Connection Note</p>
                <p className="text-sm text-yellow-200 mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Main URL Card */}
          {hostingerData?.url && (
            <motion.div 
              variants={itemVariants}
              className="mb-6 p-6 rounded-lg bg-gradient-to-r from-[#0091FF]/20 to-[#00D4FF]/20 border border-[#0091FF]/40"
            >
              <div className="flex items-center gap-3 mb-4">
                <LinkIcon className="w-6 h-6 text-[#0091FF]" />
                <h2 className="text-xl font-semibold">Primary Hosting URL</h2>
              </div>
              <a 
                href={hostingerData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-2xl font-mono text-[#00D4FF] hover:text-[#0091FF] transition-colors break-all"
              >
                {hostingerData.url}
              </a>
            </motion.div>
          )}

          {/* Account Info */}
          {hostingerData?.account && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            >
              <div className="p-6 rounded-lg bg-[#0091FF]/5 border border-[#0091FF]/20">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold">Account Status</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-2xl font-bold text-green-400">
                    {hostingerData.account.account === 'active' ? '✓ Active' : hostingerData.account.account}
                  </p>
                  {hostingerData.account.mode && (
                    <p className="text-xs text-gray-500 mt-2">Mode: {hostingerData.account.mode}</p>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-lg bg-[#0091FF]/5 border border-[#0091FF]/20">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold">Websites</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Total Count</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {hostingerData.account.websites || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Domains List */}
          {hostingerData?.domains?.domains && hostingerData.domains.domains.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="p-6 rounded-lg bg-[#0091FF]/5 border border-[#0091FF]/20 mb-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0091FF]" />
                Domains ({hostingerData.domains.domains.length})
              </h3>
              <div className="space-y-3">
                {hostingerData.domains.domains.map((domain, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded border border-[#0091FF]/10">
                    <div>
                      <p className="font-mono font-semibold">{domain.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Status: {domain.status}</p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-semibold ${
                      domain.status === 'active' ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'
                    }`}>
                      {domain.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Websites List */}
          {hostingerData?.websites?.websites && hostingerData.websites.websites.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="p-6 rounded-lg bg-[#0091FF]/5 border border-[#0091FF]/20"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-[#0091FF]" />
                Websites ({hostingerData.websites.websites.length})
              </h3>
              <div className="space-y-3">
                {hostingerData.websites.websites.map((website, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded border border-[#0091FF]/10">
                    <div>
                      <p className="font-semibold">{website.name || 'Unnamed Website'}</p>
                      <p className="text-xs text-gray-400 mt-1">ID: {website.id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-semibold ${
                      website.status === 'active' ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'
                    }`}>
                      {website.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Connection Info */}
          <motion.div 
            variants={itemVariants}
            className="mt-6 p-4 rounded-lg bg-black/40 border border-gray-700/40"
          >
            <p className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()} | 
              Orchestration Server: http://localhost:3001
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default HostingerPage;
