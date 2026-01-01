
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Zap, Layout, Box, Database, Settings, ArrowLeft, 
  MoreVertical, Code, Terminal, Play, Layers,
  MessageSquare, Library, FileCode, CheckCircle,
  Hammer, Smartphone, Globe, ShoppingCart, Briefcase,
  Cpu, Copy, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const QuantumXPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "System Online. I am the Auto-Builder. Describe your application, and I will generate the architecture, database schema, and frontend code instantly. What are we building today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sidebar Configuration
  const sidebarItems = [
    { id: 'chat', icon: <MessageSquare size={18} />, label: "Builder Chat" },
    { id: 'prompts', icon: <Library size={18} />, label: "Prompt Library" },
    { id: 'templates', icon: <Layout size={18} />, label: "Auto Templates" },
    { id: 'projects', icon: <Box size={18} />, label: "My Projects" },
    { id: 'deployments', icon: <Globe size={18} />, label: "Deployments" },
    { id: 'settings', icon: <Settings size={18} />, label: "Settings" }
  ];

  // Popular App Categories
  const popularCategories = [
    { title: "E-Commerce Store", icon: <ShoppingCart className="text-[#0066FF]" />, desc: "Full cart, checkout, and inventory management." },
    { title: "SaaS Dashboard", icon: <Layout className="text-[#0066FF]" />, desc: "Analytics, user management, and subscription billing." },
    { title: "Social Network", icon: <Globe className="text-[#0066FF]" />, desc: "Feed, profiles, connections, and real-time chat." },
    { title: "Portfolio Site", icon: <Smartphone className="text-[#0066FF]" />, desc: "Showcase work with galleries and contact forms." },
    { title: "CRM System", icon: <Briefcase className="text-[#0066FF]" />, desc: "Lead tracking, pipelines, and customer data." },
    { title: "AI Chatbot Wrapper", icon: <Cpu className="text-[#0066FF]" />, desc: "Custom interface for LLM interaction." }
  ];

  // Prompt Library Data
  const promptLibrary = [
    { title: "Real Estate Platform", prompt: "Build a real estate marketplace where users can list properties, filter by location/price, and contact agents. Include a map view and admin dashboard." },
    { title: "Task Management (Trello Clone)", prompt: "Create a drag-and-drop task management app with boards, lists, and cards. Include team collaboration features and due date notifications." },
    { title: "Fitness Tracker", prompt: "Design a mobile-first fitness tracking app. Users should be able to log workouts, track progress with charts, and set weekly goals." },
    { title: "Recipe & Meal Planner", prompt: "Build a recipe discovery app with a weekly meal planner. Include ingredient shopping list generation and dietary filters." },
    { title: "Freelance Marketplace", prompt: "Develop a platform connecting freelancers with clients. Include job posting, proposal submission, and escrow payment processing." },
    { title: "Event Ticketing System", prompt: "Create an event management system with QR code ticket generation, seat selection, and payment gateway integration." }
  ];

  // Auto Templates Data
  const autoTemplates = [
    { title: "Modern SaaS Starter", tags: ["React", "Node", "Stripe"], image: "https://horizons-cdn.hostinger.com/ff7a3d8f-2894-49d9-aa19-275af81f136a/4f27521c7d23f79391e6047da034604d.jpg" },
    { title: "E-Commerce V2", tags: ["Next.js", "Supabase", "Tailwind"], image: "https://horizons-cdn.hostinger.com/ff7a3d8f-2894-49d9-aa19-275af81f136a/aac2d3ec47a7da90ad2d220df35d9b47.jpg" },
    { title: "Admin Dashboard Pro", tags: ["Vite", "Recharts", "Auth"], image: "https://horizons-cdn.hostinger.com/ff7a3d8f-2894-49d9-aa19-275af81f136a/b0e084ba2ea69ebb6b544bbb90a7aa0c.jpg" },
    { title: "Blog / CMS", tags: ["Headless CMS", "GraphQL"], image: "https://horizons-cdn.hostinger.com/ff7a3d8f-2894-49d9-aa19-275af81f136a/86cb0fdc565e812f8280a286b06a763f.jpg" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulated Builder Response
    setTimeout(() => {
      const steps = [
        "Analyzing requirements...",
        "Generating database schema...",
        "Constructing API endpoints...",
        "Scaffolding frontend architecture..."
      ];
      
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          // Could update a status indicator here
          stepIndex++;
        } else {
          clearInterval(progressInterval);
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I've analyzed your request for "${userMsg.content}". \n\nI have prepared the initial architecture:\n\n1. **Frontend**: React + Vite + Tailwind\n2. **Backend**: Node.js microservices\n3. **Database**: PostgreSQL (Supabase)\n\nWould you like me to proceed with generating the codebase?`,
            isSystem: true
          }]);
        }
      }, 800);
    }, 500);
  };

  const loadPrompt = (promptText) => {
    setInput(promptText);
    setActiveTab('chat');
    // Optional: Auto-focus input
  };

  return (
    <>
      <Helmet>
        <title>Auto-Builder | Infinity X</title>
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
            <h2 className="text-xs font-bold text-[#0066FF] tracking-[0.2em] uppercase mb-1">Quantum X</h2>
            <div className="text-xl font-bold text-white">Auto-Builder</div>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {sidebarItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-sm font-light ${
                  activeTab === item.id 
                    ? 'bg-[#0066FF]/20 text-[#0066FF] border border-[#0066FF]/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="px-6 mt-auto">
             <div className="p-4 rounded-xl bg-gradient-to-br from-[#0066FF]/20 to-purple-600/20 border border-[#0066FF]/20">
                <div className="text-xs font-bold text-white mb-2">Build Quota</div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
                   <div className="w-[70%] h-full bg-[#0066FF]" />
                </div>
                <div className="text-[10px] text-white/50">7/10 Projects Active</div>
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
                  <Hammer size={20} className="text-[#0066FF] lg:hidden" />
                  {sidebarItems.find(i => i.id === activeTab)?.label || 'Auto-Builder'}
                </h1>
                <p className="text-white/40 text-xs hidden lg:block">Generative App Development Engine</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] text-xs">
                 <Terminal size={12} /> Engine Idle
               </div>
               <button className="p-2 text-white/60 hover:text-white">
                 <MoreVertical size={20} />
               </button>
            </div>
          </header>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto relative scroll-smooth bg-black/20">
             
             {/* BACKGROUND DECORATION */}
             <div className="absolute inset-0 bg-[url('https://horizons-cdn.hostinger.com/ff7a3d8f-2894-49d9-aa19-275af81f136a/aac2d3ec47a7da90ad2d220df35d9b47.jpg')] bg-cover opacity-[0.03] pointer-events-none" />

             {/* === CHAT VIEW === */}
             {activeTab === 'chat' && (
                <div className="p-4 lg:p-8 max-w-4xl mx-auto min-h-full flex flex-col">
                   <div className="flex-1 space-y-6 pb-20 lg:pb-0">
                      {messages.map((msg, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#0066FF]/20 flex items-center justify-center border border-[#0066FF]/30 shrink-0 mt-1">
                              <Hammer size={16} className="text-[#0066FF] lg:w-5 lg:h-5" />
                            </div>
                          )}
                          
                          <div className={`
                            max-w-[85%] lg:max-w-[80%] rounded-2xl p-4 text-sm lg:text-base leading-relaxed whitespace-pre-wrap
                            ${msg.role === 'user' 
                              ? 'bg-[#0066FF] text-white rounded-tr-sm' 
                              : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-sm shadow-xl'
                            }
                          `}>
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-[#0066FF]/20 flex items-center justify-center border border-[#0066FF]/30 shrink-0">
                              <Hammer size={16} className="text-[#0066FF]" />
                           </div>
                           <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-3 items-center">
                              <div className="text-xs text-[#0066FF] animate-pulse font-mono">BUILDING...</div>
                              <div className="flex gap-1 h-2">
                                 <span className="w-1.5 h-full bg-[#0066FF]/50 rounded-full animate-[bounce_1s_infinite_-0.3s]"></span>
                                 <span className="w-1.5 h-full bg-[#0066FF]/50 rounded-full animate-[bounce_1s_infinite_-0.15s]"></span>
                                 <span className="w-1.5 h-full bg-[#0066FF]/50 rounded-full animate-[bounce_1s_infinite]"></span>
                              </div>
                           </div>
                        </motion.div>
                      )}
                      
                      {/* Popular Categories (Only show if chat is short i.e. start) */}
                      {messages.length < 3 && !isTyping && (
                         <motion.div 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }} 
                           transition={{ delay: 0.5 }}
                           className="mt-12"
                         >
                           <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 text-center">Popular App Blueprints</h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {popularCategories.map((cat, i) => (
                                <button 
                                  key={i}
                                  onClick={() => setInput(`I want to build a ${cat.title}`)}
                                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#0066FF]/30 transition-all text-left group"
                                >
                                   <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                      {cat.icon}
                                   </div>
                                   <div className="font-bold text-white text-sm mb-1">{cat.title}</div>
                                   <div className="text-[10px] text-white/40 leading-tight">{cat.desc}</div>
                                </button>
                              ))}
                           </div>
                         </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                   </div>
                </div>
             )}

             {/* === PROMPT LIBRARY VIEW === */}
             {activeTab === 'prompts' && (
                <div className="p-4 lg:p-8 max-w-6xl mx-auto">
                   <div className="mb-8">
                      <h2 className="text-2xl font-bold text-white mb-2">System Prompts</h2>
                      <p className="text-white/40 text-sm">Pre-engineered instructions to get the best results from Auto-Builder.</p>
                   </div>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {promptLibrary.map((item, i) => (
                         <div key={i} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-[#0066FF]/40 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                               <div className="p-2 rounded-lg bg-[#0066FF]/10 text-[#0066FF]"><FileCode size={20} /></div>
                               <button onClick={() => loadPrompt(item.prompt)} className="text-xs text-white/40 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                  <Copy size={12} /> Use
                               </button>
                            </div>
                            <h3 className="font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-sm text-white/60 mb-6 flex-1 leading-relaxed">"{item.prompt}"</p>
                            <button 
                               onClick={() => loadPrompt(item.prompt)}
                               className="w-full py-2 bg-white/5 hover:bg-[#0066FF] hover:text-white text-white/60 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                            >
                               Load into Builder
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
             )}

             {/* === AUTO TEMPLATES VIEW === */}
             {activeTab === 'templates' && (
                <div className="p-4 lg:p-8 max-w-6xl mx-auto">
                   <div className="mb-8">
                      <h2 className="text-2xl font-bold text-white mb-2">Auto Templates</h2>
                      <p className="text-white/40 text-sm">Deploy production-ready architectures with a single click.</p>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      {autoTemplates.map((template, i) => (
                         <div key={i} className="group relative rounded-xl overflow-hidden aspect-video border border-white/10 hover:border-[#0066FF]/50 transition-all cursor-pointer">
                            <img src={template.image} alt={template.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                               <div className="flex gap-2 mb-3">
                                  {template.tags.map(tag => (
                                     <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-white/80">{tag}</span>
                                  ))}
                               </div>
                               <h3 className="text-2xl font-bold text-white mb-1">{template.title}</h3>
                               <div className="flex items-center gap-2 text-green-400 text-xs">
                                  <CheckCircle size={12} /> Verified Architecture
                               </div>
                            </div>
                            
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                               <button 
                                 onClick={() => {
                                   setInput(`Deploy the ${template.title} template`);
                                   setActiveTab('chat');
                                 }}
                                 className="px-6 py-3 bg-[#0066FF] text-white rounded-full font-bold shadow-[0_0_20px_#0066FF]"
                               >
                                  Initialize
                               </button>
                            </div>
                         </div>
                      ))}
                      
                      {/* "Create New" Placeholder */}
                      <div className="rounded-xl border border-dashed border-white/10 hover:border-[#0066FF]/40 bg-white/5 flex flex-col items-center justify-center gap-4 text-white/30 hover:text-[#0066FF] transition-all cursor-pointer aspect-video">
                         <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
                            <Plus size={32} />
                         </div>
                         <span className="text-sm font-bold uppercase tracking-widest">Import Custom Repo</span>
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* INPUT AREA (Only visible in Chat Tab) */}
          {activeTab === 'chat' && (
            <div className="p-4 lg:p-6 border-t border-white/10 bg-black/80 lg:bg-black/40 backdrop-blur-md sticky bottom-0 z-20">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSend} className="relative flex gap-3">
                  <button type="button" className="p-3 lg:p-4 rounded-full bg-white/5 text-white/60 hover:text-[#0066FF] hover:bg-[#0066FF]/10 transition-colors border border-white/5">
                    <Plus size={18} className="lg:w-5 lg:h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the app you want to build..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 lg:py-4 px-6 text-white focus:outline-none focus:border-[#0066FF]/50 transition-colors placeholder:text-white/20 font-light text-sm lg:text-base"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-3 lg:p-4 rounded-full bg-[#0066FF] text-white hover:bg-[#0052cc] transition-colors shadow-[0_0_15px_rgba(0,102,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} className="lg:w-5 lg:h-5" />
                  </button>
                </form>
                <div className="text-center mt-2 lg:mt-4">
                  <p className="text-[10px] text-white/20 uppercase tracking-widest">Quantum X Engine v2.1</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default QuantumXPage;
