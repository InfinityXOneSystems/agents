
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Send, Zap, Activity, Eye, Brain, Settings, Database, ArrowLeft, MoreVertical, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const VisionCortexPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there. I'm Vision Cortex, your AI thinking partner. I can analyze images, solve problems, or help you plan. What's on your mind today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sidebarItems = [
    { icon: <Activity size={18} />, label: "Your Feed" },
    { icon: <Eye size={18} />, label: "Focus" },
    { icon: <Zap size={18} />, label: "Opportunities" },
    { icon: <Brain size={18} />, label: "Strategy" },
    { icon: <Database size={18} />, label: "Memory" },
    { icon: <Settings size={18} />, label: "Settings" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;

    // Capture current state values
    const currentInput = input;
    const currentImage = imagePreview;

    const userMsg = { 
      role: 'user', 
      content: currentInput,
      image: currentImage
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    // Reset inputs immediately
    setInput('');
    clearImage();
    setIsTyping(true);

    try {
      let response;
      
      if (currentImage) {
        // Extract base64 data (remove data:image/png;base64, prefix)
        const base64Data = currentImage.split(',')[1];
        response = await api.analyzeImage(base64Data, currentInput);
      } else {
        response = await api.sendMessage(currentInput);
      }
      
      setIsTyping(false);
      if (response) {
        setMessages(prev => [...prev, response]);
      } else {
        toast({
          title: "Connection Error",
          description: "Could not reach the neural grid. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      toast({
        title: "System Error",
        description: "An unexpected error occurred during transmission.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Vision Cortex | Infinity X</title>
        <meta name="theme-color" content="#000000" />
      </Helmet>

      <div className="h-[100dvh] lg:min-h-screen lg:pt-24 lg:px-6 lg:pb-6 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto bg-black lg:bg-transparent">
        
        {/* Desktop Sidebar */}
        <motion.aside 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 glass-panel rounded-2xl hidden lg:flex flex-col py-6"
        >
          <div className="px-6 mb-8">
            <h2 className="text-xs font-bold text-[#0066FF] tracking-[0.2em] uppercase mb-1">System</h2>
            <div className="text-xl font-bold text-white">Cortex V4</div>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {sidebarItems.map((item, i) => (
              <button key={i} className="flex items-center gap-3 w-full p-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-light">
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="px-6 mt-auto">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Connected
            </div>
          </div>
        </motion.aside>

        {/* Main Interface */}
        <main className="flex-1 flex flex-col h-full lg:glass-panel lg:rounded-2xl overflow-hidden relative bg-black lg:bg-[rgba(0,0,0,0.4)]">
          
          {/* Header */}
          <header className="p-4 lg:p-6 border-b border-white/10 flex justify-between items-center bg-black/60 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="lg:hidden text-white/60 hover:text-white">
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-white flex items-center gap-2">
                  <Brain size={20} className="text-[#0066FF] lg:hidden" />
                  Vision Cortex
                </h1>
                <p className="text-white/40 text-xs hidden lg:block">Your AI Thinking Partner</p>
                <div className="flex items-center gap-1 lg:hidden">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] text-white/50 uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] text-xs">
                 <Zap size={12} /> Online
               </div>
               <button className="lg:hidden p-2 text-white/60">
                 <MoreVertical size={20} />
               </button>
            </div>
          </header>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto relative scroll-smooth p-4 lg:p-8">
            <div className="hidden lg:block absolute inset-0 bg-[url('https://horizons-cdn.hostinger.com/ff7a3d8f-2894-49d9-aa19-275af81f136a/ff164e323a6971dca90f2becdbceaa13.jpg')] bg-cover opacity-5 pointer-events-none mix-blend-screen" />
            
            <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#0066FF]/20 flex items-center justify-center border border-[#0066FF]/30 shrink-0 mt-1">
                      <Brain size={16} className="text-[#0066FF] lg:w-5 lg:h-5" />
                    </div>
                  )}
                  
                  <div className={`
                    max-w-[85%] lg:max-w-[80%] rounded-2xl p-4 text-sm lg:text-base leading-relaxed whitespace-pre-wrap flex flex-col gap-2
                    ${msg.role === 'user' 
                      ? 'bg-[#0066FF] text-white rounded-tr-sm' 
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-sm'
                    }
                  `}>
                    {msg.image && (
                      <div className="rounded-lg overflow-hidden border border-white/20 bg-black/20">
                         <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-60 object-contain mx-auto" />
                      </div>
                    )}
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-[#0066FF]/20 flex items-center justify-center border border-[#0066FF]/30 shrink-0">
                      <Brain size={16} className="text-[#0066FF]" />
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center h-10">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                   </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 lg:p-6 border-t border-white/10 bg-black/80 lg:bg-black/40 backdrop-blur-md sticky bottom-0 z-20">
            <div className="max-w-3xl mx-auto">
              {/* Image Preview Area */}
              {imagePreview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3"
                >
                  <div className="relative inline-block">
                    <div className="relative rounded-xl overflow-hidden border border-white/20 max-w-[120px] max-h-[120px] bg-black">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <button 
                        onClick={clearImage}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                        type="button"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSend} className="relative flex gap-3">
                <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className={`p-3 lg:p-4 rounded-full transition-colors border ${
                     imagePreview 
                      ? 'bg-[#0066FF]/20 text-[#0066FF] border-[#0066FF]/40' 
                      : 'bg-white/5 text-white/60 hover:text-[#0066FF] hover:bg-[#0066FF]/10 border-white/5'
                   }`}
                   title="Upload Image for Analysis"
                >
                   <ImageIcon size={18} className="lg:w-5 lg:h-5" />
                </button>
                <input 
                   type="file"
                   ref={fileInputRef}
                   className="hidden"
                   accept="image/*"
                   onChange={handleImageSelect}
                />

                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={imagePreview ? "Ask Cortex about this image..." : "Message Cortex..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 lg:py-4 pl-5 lg:pl-6 pr-4 text-white focus:outline-none focus:border-[#0066FF]/50 transition-colors placeholder:text-white/20 font-light text-sm lg:text-base"
                />
                <button 
                  type="submit"
                  disabled={(!input.trim() && !imagePreview) || isTyping}
                  className="p-3 lg:p-4 rounded-full bg-[#0066FF] text-white hover:bg-[#0052cc] transition-colors shadow-[0_0_15px_rgba(0,102,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} className="lg:w-5 lg:h-5" />
                </button>
              </form>
              <div className="text-center mt-2 lg:mt-4">
                <p className="text-[10px] text-white/20 uppercase tracking-widest">Powered by Infinity XOS</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VisionCortexPage;
