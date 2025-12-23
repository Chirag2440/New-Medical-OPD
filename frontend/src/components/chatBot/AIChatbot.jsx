import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Sparkles } from 'lucide-react';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! 👋 I'm your 24/7 medical support assistant. How can I help you today?",
      timestamp: new Date(),
      options: [
        "Appointment booking issues",
        "Payment problems",
        "Technical support",
        "Account settings",
        "Medical records access"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const knowledgeBase = {
    greetings: {
      patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
      responses: [
        "Hello! How can I assist you today?",
        "Hi there! What can I help you with?",
        "Hey! I'm here to help. What do you need?"
      ]
    },
    appointment: {
      patterns: ['appointment', 'booking', 'schedule', 'book doctor', 'consultation'],
      responses: [
        "To book an appointment:\n1. Go to 'Find Doctors' section\n2. Select your preferred doctor\n3. Choose available time slot\n4. Confirm booking\n\nNeed help with a specific step?"
      ],
      followUp: [
        "Cancel appointment",
        "Reschedule appointment",
        "View appointments",
        "Something else"
      ]
    },
    payment: {
      patterns: ['payment', 'pay', 'transaction', 'refund', 'money', 'charge'],
      responses: [
        "For payment issues:\n\n💳 Accepted Methods: Credit/Debit cards, UPI, Net Banking\n\n💰 Refund Policy: Refunds processed within 5-7 business days\n\n❓ Payment failed? Please retry or contact support.\n\nWhat specific payment issue are you facing?"
      ],
      followUp: [
        "Payment failed",
        "Refund status",
        "Payment methods",
        "Receipt/Invoice"
      ]
    },
    technical: {
      patterns: ['not working', 'error', 'bug', 'problem', 'issue', 'technical', 'loading'],
      responses: [
        "Let me help you troubleshoot:\n\n1️⃣ Try refreshing the page\n2️⃣ Clear browser cache\n3️⃣ Check internet connection\n4️⃣ Try different browser\n\nIs the issue still persisting?"
      ],
      followUp: [
        "Yes, still not working",
        "Partially resolved",
        "Issue resolved",
        "Need more help"
      ]
    },
    account: {
      patterns: ['account', 'profile', 'login', 'password', 'sign in', 'register'],
      responses: [
        "Account Management:\n\n👤 Update Profile: Go to Settings > Profile\n🔒 Reset Password: Use 'Forgot Password' on login\n📧 Change Email: Settings > Account > Email\n\nWhat would you like to do?"
      ],
      followUp: [
        "Reset password",
        "Update profile",
        "Delete account",
        "Something else"
      ]
    },
    records: {
      patterns: ['medical records', 'prescription', 'report', 'history', 'documents'],
      responses: [
        "Access Medical Records:\n\n📋 View: Dashboard > Medical Records\n⬇️ Download: Click on document > Download\n📤 Share: Select document > Share with doctor\n\nAll records are encrypted and secure. What do you need?"
      ],
      followUp: [
        "Can't view records",
        "Download issue",
        "Upload new record",
        "Something else"
      ]
    },
    doctor: {
      patterns: ['doctor', 'specialist', 'find doctor', 'consultation fee'],
      responses: [
        "Doctor Information:\n\n🔍 Find Doctors: Browse by specialty\n⭐ Reviews: Check patient ratings\n💰 Fees: Displayed on doctor profile\n⏰ Availability: Real-time slot updates\n\nWhat information do you need?"
      ],
      followUp: [
        "Search by specialty",
        "Doctor availability",
        "Consultation fees",
        "Doctor reviews"
      ]
    },
    emergency: {
      patterns: ['emergency', 'urgent', 'critical', 'ambulance', '911', '112'],
      responses: [
        "🚨 EMERGENCY ALERT 🚨\n\nFor medical emergencies:\n📞 Call: 112 (India Emergency)\n🚑 Ambulance: 102\n\nThis is NOT for emergencies. Please call emergency services immediately!\n\nFor urgent consultations, use our 'Instant Consultation' feature."
      ]
    },
    thanks: {
      patterns: ['thank', 'thanks', 'appreciate', 'helpful'],
      responses: [
        "You're welcome! 😊 Is there anything else I can help you with?",
        "Happy to help! Feel free to ask if you need anything else.",
        "Glad I could assist! Let me know if you have more questions."
      ]
    },
    default: {
      responses: [
        "I'm here to help! Could you please provide more details about your query?",
        "I didn't quite catch that. Can you rephrase your question?",
        "Let me connect you with the right information. What specifically do you need help with?"
      ],
      suggestions: [
        "Appointment booking",
        "Payment issues",
        "Technical problems",
        "Account settings",
        "Talk to human agent"
      ]
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestMatch = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (data.patterns) {
        for (const pattern of data.patterns) {
          if (lowerMessage.includes(pattern.toLowerCase())) {
            return { category, data };
          }
        }
      }
    }
    
    return { category: 'default', data: knowledgeBase.default };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const { category, data } = findBestMatch(inputMessage);
      const responses = data.responses || knowledgeBase.default.responses;
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response,
        timestamp: new Date(),
        options: data.followUp || data.suggestions || null
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleOptionClick = (option) => {
    setInputMessage(option);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleQuickAction = (action) => {
    const quickActions = {
      'Appointment booking issues': 'I need help with appointment booking',
      'Payment problems': 'I have a payment issue',
      'Technical support': 'I am facing a technical problem',
      'Account settings': 'I need help with my account',
      'Medical records access': 'I want to access my medical records'
    };
    
    setInputMessage(quickActions[action] || action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const MessageBubble = ({ message }) => {
    const isBot = message.type === 'bot';
    
    return (
      <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fadeIn`}>
        <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} max-w-[80%] items-end gap-2`}>
          {isBot && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
              <Bot size={18} />
            </div>
          )}
          
          <div className="flex flex-col">
            <div
              className={`px-4 py-3 rounded-2xl ${
                isBot
                  ? 'bg-gradient-to-br from-sky-50 to-blue-50 text-gray-800 rounded-bl-sm border border-sky-200'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm shadow-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
              
              {message.options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(option)}
                      className="px-3 py-1.5 bg-white text-sky-600 text-xs rounded-full hover:bg-sky-100 transition-colors border border-sky-200 font-medium"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <span className={`text-xs text-gray-500 mt-1 px-1 ${isBot ? 'text-left' : 'text-right'}`}>
              {new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }).format(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-300 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Bot size={28} className="relative z-10 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
        </button>
      )}

      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot size={22} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">HealthCare Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online 24/7
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isTyping && (
                  <div className="flex items-end gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white">
                      <Bot size={18} />
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 px-4 py-3 rounded-2xl rounded-bl-sm border border-sky-200">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-4 py-2.5 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                      style={{ maxHeight: '100px' }}
                    />
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2.5 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    <Send size={20} />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by AI • Available 24/7 • Instant Support
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;