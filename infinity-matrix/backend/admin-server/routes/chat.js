const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const crypto = require('crypto');

// In-memory chat store (replace with database in production)
const conversations = new Map();
const messages = new Map();

// Sample conversation
const sampleConvId = 'conv-sample-1';
conversations.set(sampleConvId, {
  id: sampleConvId,
  userId: 'admin-1',
  agentId: 'agent-1',
  title: 'Executive Planning Discussion',
  status: 'active',
  createdAt: '2026-01-04T10:00:00.000Z',
  updatedAt: new Date().toISOString(),
  messageCount: 5,
});

// Sample messages
const sampleMessages = [
  {
    id: 'msg-1',
    conversationId: sampleConvId,
    role: 'user',
    content: 'I need help planning my quarterly goals',
    timestamp: '2026-01-04T10:00:00.000Z',
  },
  {
    id: 'msg-2',
    conversationId: sampleConvId,
    role: 'assistant',
    content: 'I\'d be happy to help you plan your quarterly goals. Let\'s break this down into key areas: professional development, business objectives, and personal growth. What would you like to focus on first?',
    timestamp: '2026-01-04T10:00:05.000Z',
  },
];

sampleMessages.forEach(msg => messages.set(msg.id, msg));

// GET /chat/conversations - List all conversations
router.get('/conversations', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let convList = Array.from(conversations.values())
      .filter(conv => conv.userId === req.user.id);
    
    // Filter by status
    if (status) {
      convList = convList.filter(conv => conv.status === status);
    }
    
    // Sort by most recent
    convList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    const total = convList.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedConvs = convList.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      conversations: paginatedConvs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[CHAT] List conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /chat/conversations - Create new conversation
router.post('/conversations', authenticateToken, (req, res) => {
  try {
    const { agentId, title } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    const conversation = {
      id: `conv-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId: req.user.id,
      agentId,
      title: title || 'New Conversation',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    
    conversations.set(conversation.id, conversation);
    
    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('[CHAT] Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /chat/conversations/:id - Get conversation by ID
router.get('/conversations/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check ownership
    if (conversation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('[CHAT] Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// GET /chat/conversations/:id/messages - Get messages in conversation
router.get('/conversations/:id/messages', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check ownership
    if (conversation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const conversationMessages = Array.from(messages.values())
      .filter(msg => msg.conversationId === id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      success: true,
      conversationId: id,
      messages: conversationMessages,
      total: conversationMessages.length,
    });
  } catch (error) {
    console.error('[CHAT] Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /chat/conversations/:id/messages - Send message
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check ownership
    if (conversation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { content, role = 'user' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Create user message
    const userMessage = {
      id: `msg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      conversationId: id,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    
    messages.set(userMessage.id, userMessage);
    
    // Update conversation
    conversation.messageCount += 1;
    conversation.updatedAt = new Date().toISOString();
    conversations.set(id, conversation);
    
    // Simulate AI response (in production, call actual agent)
    let aiResponse = null;
    if (role === 'user') {
      aiResponse = {
        id: `msg-${Date.now() + 1}-${crypto.randomBytes(4).toString('hex')}`,
        conversationId: id,
        role: 'assistant',
        content: `I understand your message: "${content}". As your AI assistant, I'm here to help. In production, this would be a real AI response from ${conversation.agentId}.`,
        timestamp: new Date(Date.now() + 1000).toISOString(),
      };
      
      messages.set(aiResponse.id, aiResponse);
      conversation.messageCount += 1;
      conversations.set(id, conversation);
    }
    
    res.status(201).json({
      success: true,
      userMessage,
      aiResponse,
    });
  } catch (error) {
    console.error('[CHAT] Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /chat/conversations/:id - Delete conversation
router.delete('/conversations/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check ownership
    if (conversation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Delete all messages in conversation
    Array.from(messages.values())
      .filter(msg => msg.conversationId === id)
      .forEach(msg => messages.delete(msg.id));
    
    // Delete conversation
    conversations.delete(id);
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('[CHAT] Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// GET /chat/stats - Get chat statistics
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const userConversations = Array.from(conversations.values())
      .filter(conv => conv.userId === req.user.id);
    
    const userMessages = Array.from(messages.values())
      .filter(msg => {
        const conv = conversations.get(msg.conversationId);
        return conv && conv.userId === req.user.id;
      });
    
    res.json({
      success: true,
      stats: {
        totalConversations: userConversations.length,
        activeConversations: userConversations.filter(c => c.status === 'active').length,
        totalMessages: userMessages.length,
        avgMessagesPerConversation: userConversations.length > 0 
          ? Math.round(userMessages.length / userConversations.length * 10) / 10 
          : 0,
      },
    });
  } catch (error) {
    console.error('[CHAT] Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch chat stats' });
  }
});

// Add missing GET endpoint for '/api/chat'
router.get('/api/chat', (req, res) => {
  res.json({
    success: true,
    message: 'Chat endpoint is active',
  });
});

module.exports = router;
