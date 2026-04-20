import { useState, useEffect } from 'react';
import { FaComments, FaArrowLeft } from 'react-icons/fa';
import { initializeSocket, disconnectSocket } from '../services/socket';
import ChatList from '../components/chat/ChatList';
import ChatComponent from '../components/chat/ChatComponent';

const ChatPage = () => {
  const [socket, setSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeChats: 0,
    unreadMessages: 0,
    onlineNow: 0
  });

  useEffect(() => {
    initializeApp();

    return () => {
      disconnectSocket();
    };
  }, []);

  const initializeApp = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to access chat');
        setLoading(false);
        return;
      }

      const socketInstance = initializeSocket(token);
      setSocket(socketInstance);

      await fetchCurrentUser();
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to initialize chat. Please refresh the page.');
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentUser({
          id: data.user._id,
          name: data.user.name,
          role: data.user.role,
          email: data.user.email,
          photo: data.user.photo
        });
        setError(null);
        
        // Fetch stats after user is loaded
        await fetchChatStats(data.user);
      } else {
        setError(data.message || 'Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user data. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatStats = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chats) {
          // Calculate stats
          const activeChats = data.chats.filter(chat => chat.isActive).length;
          
          const unreadMessages = data.chats.reduce((sum, chat) => {
            const unread = user.role === 'patient' 
              ? chat.unreadCount?.patient || 0
              : chat.unreadCount?.doctor || 0;
            return sum + unread;
          }, 0);

          // For online count, we'll show active chats with recent messages (last 5 minutes)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const onlineNow = data.chats.filter(chat => 
            new Date(chat.lastMessageAt) > fiveMinutesAgo
          ).length;

          setStats({
            activeChats,
            unreadMessages,
            onlineNow
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chat stats:', error);
    }
  };

  const handleSelectChat = (chat) => {
    if (chat && chat.appointment) {
      setSelectedChat(chat);
      // Refresh stats when chat is selected
      if (currentUser) {
        fetchChatStats(currentUser);
      }
    } else {
      console.error('Invalid chat selected:', chat);
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    // Refresh stats when going back
    if (currentUser) {
      fetchChatStats(currentUser);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <FaComments className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaComments className="text-4xl text-blue-600" />
            Messages
          </h1>
          <p className="text-gray-600 mt-2">
            Chat with your {currentUser.role === 'patient' ? 'doctors' : 'patients'}
          </p>
        </div>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List - Hidden on mobile when chat is selected */}
          <div className={`lg:col-span-1 ${selectedChat ? 'hidden lg:block' : 'block'}`}>
            <ChatList 
              onSelectChat={handleSelectChat} 
              currentUser={currentUser} 
            />
          </div>

          {/* Chat Window - Takes full width on mobile when selected */}
          <div className={`lg:col-span-2 ${!selectedChat ? 'hidden lg:block' : 'block'}`}>
            {selectedChat && selectedChat.appointment ? (
              <div>
                {/* Back button for mobile */}
                <button
                  onClick={handleBackToList}
                  className="lg:hidden mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <FaArrowLeft />
                  Back to chats
                </button>
                
                <ChatComponent 
                  appointmentId={selectedChat.appointment._id}
                  socket={socket}
                  currentUser={currentUser}
                />
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center h-[600px] bg-white rounded-lg shadow-lg">
                <div className="text-center p-8">
                  <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
              </div>
              <FaComments className="text-4xl text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">!</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Online Now</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onlineNow}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;