import { useState, useEffect, useRef } from 'react';
import { 
  FaPaperPlane, 
  FaPaperclip, 
  FaTimes, 
  FaCheck, 
  FaCheckDouble, 
  FaExclamationCircle 
} from 'react-icons/fa';

const ChatComponent = ({ appointmentId, socket, currentUser }) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (appointmentId) {
      fetchChat();
    }
  }, [appointmentId]);

  useEffect(() => {
    if (!socket || !chat) return;

    console.log('📡 Joining chat room:', chat._id);

    socket.emit('join-chat', {
      chatId: chat._id,
      userId: currentUser.id,
      userType: currentUser.role
    });

    const handleReceiveMessage = (data) => {
      console.log('📨 Received message:', data);
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    const handleUserTyping = (data) => {
      setOtherUserTyping(data.isTyping);
    };

    const handleReadReceipt = (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, isRead: true, readAt: data.readAt }
          : msg
      ));
    };

    socket.on('receive-chat-message', handleReceiveMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('message-read-receipt', handleReadReceipt);

    return () => {
      if (chat && currentUser) {
        console.log('👋 Leaving chat room:', chat._id);
        socket.emit('leave-chat', { chatId: chat._id, userId: currentUser.id });
      }
      socket.off('receive-chat-message', handleReceiveMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('message-read-receipt', handleReadReceipt);
    };
  }, [socket, chat, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      setError(null);
      setRetrying(false);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching chat for appointment:', appointmentId);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/chats/appointment/${appointmentId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Chat not found for this appointment');
        } else if (response.status === 403) {
          throw new Error('You are not authorized to access this chat');
        } else if (response.status === 401) {
          throw new Error('Your session has expired. Please login again.');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Chat data received:', data);
      
      if (data.success) {
        setChat(data.chat);
        setMessages(data.chat.messages || []);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to load chat');
      }
    } catch (error) {
      console.error('❌ Error fetching chat:', error);
      setError(error.message || 'Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sendingMessage) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (newMessage.trim()) {
        formData.append('content', newMessage);
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('messageType', 'file');
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/chats/${chat._id}/messages`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        
        if (socket) {
          socket.emit('send-chat-message', {
            chatId: chat._id,
            message: data.message
          });
        }

        setNewMessage('');
        setSelectedFile(null);
        scrollToBottom();
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !chat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        chatId: chat._id,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        chatId: chat._id,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: false
      });
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchChat();
  };

  const formatTime = (date) => {
    if (!date) return '';
    
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  if (loading || retrying) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{retrying ? 'Retrying...' : 'Loading chat...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-lg shadow-lg">
        <div className="text-center p-8 max-w-md">
          <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = '/appointments'}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">Chat not found</p>
        </div>
      </div>
    );
  }

  const otherUser = currentUser.role === 'patient' 
    ? chat.doctor?.userId 
    : chat.patient;

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-semibold">
            {otherUser?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold">{otherUser?.name || 'Unknown User'}</h3>
            <p className="text-xs text-blue-100">
              {currentUser.role === 'patient' ? 'Doctor' : 'Patient'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            if (!message) return null;

            const isOwnMessage = message.sender?._id === currentUser.id || 
                                 message.sender === currentUser.id;
            
            return (
              <div
                key={message._id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {message.fileUrl && (
                    <div className="mb-2">
                      {message.messageType === 'image' ? (
                        <img 
                          src={message.fileUrl} 
                          alt="Shared image"
                          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-80"
                          onClick={() => window.open(message.fileUrl, '_blank')}
                        />
                      ) : message.messageType === 'file' ? (
                        <div className={`border-2 border-dashed rounded-lg p-3 flex items-center gap-2 ${
                          isOwnMessage ? 'border-blue-200 bg-blue-700' : 'border-blue-400 bg-gray-100'
                        }`}>
                          <FaPaperclip className={isOwnMessage ? 'text-blue-100' : 'text-blue-600'} />
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`hover:underline ${
                              isOwnMessage ? 'text-blue-100' : 'text-blue-600'
                            } font-semibold flex-1 truncate`}
                          >
                            {message.content.replace('📎 ', '') || 'Download File'}
                          </a>
                          <a
                            href={message.fileUrl}
                            download
                            className={`text-sm px-2 py-1 rounded ${
                              isOwnMessage 
                                ? 'bg-blue-500 text-white hover:bg-blue-400' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            ⬇
                          </a>
                        </div>
                      ) : (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`hover:underline flex items-center gap-2 ${
                            isOwnMessage ? 'text-blue-100' : 'text-blue-600'
                          }`}
                        >
                          <FaPaperclip />
                          View Attachment
                        </a>
                      )}
                    </div>
                  )}
                  {message.content && !message.fileUrl && (
                    <p className="break-words whitespace-pre-wrap">{message.content}</p>
                  )}
                  {message.content && message.fileUrl && !message.content.startsWith('📎') && (
                    <p className="break-words whitespace-pre-wrap text-sm">{message.content}</p>
                  )}
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isOwnMessage && (
                      <span className="ml-1">
                        {message.isRead ? (
                          <FaCheckDouble className="text-blue-200" />
                        ) : (
                          <FaCheck />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {otherUserTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span>typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 bg-blue-50 p-2 rounded">
            <FaPaperclip className="text-blue-600" />
            <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700 flex-shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors flex-shrink-0"
            disabled={sendingMessage}
          >
            <FaPaperclip className="text-xl" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sendingMessage}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || sendingMessage}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane className="text-lg" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;