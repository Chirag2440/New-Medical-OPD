import { useState, useEffect } from 'react';
import { FaComments, FaClock, FaUser } from 'react-icons/fa';

const ChatList = ({ onSelectChat, currentUser }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats`, {
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
        setChats(data.chats || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChatId(chat._id);
    if (onSelectChat) {
      onSelectChat(chat);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    
    try {
      const chatDate = new Date(date);
      const now = new Date();
      const diffInHours = (now - chatDate) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return chatDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else if (diffInHours < 168) {
        return chatDate.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return chatDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <FaComments className="text-5xl text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchChats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center py-12">
          <FaComments className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-500">
            Your chats with {currentUser.role === 'patient' ? 'doctors' : 'patients'} will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FaComments className="text-2xl" />
          Messages ({chats.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {chats.map((chat) => {
          if (!chat) return null;

          const otherUser = currentUser.role === 'patient' 
            ? chat.doctor?.userId 
            : chat.patient;
          
          const unreadCount = currentUser.role === 'patient'
            ? chat.unreadCount?.patient || 0
            : chat.unreadCount?.doctor || 0;

          return (
            <div
              key={chat._id}
              onClick={() => handleSelectChat(chat)}
              className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedChatId === chat._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {otherUser?.photo ? (
                    <img
                      src={otherUser.photo}
                      alt={otherUser.name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"
                    style={{ display: otherUser?.photo ? 'none' : 'flex' }}
                  >
                    <FaUser className="text-2xl text-blue-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherUser?.name || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0 ml-2">
                      <FaClock className="text-xs" />
                      {formatTime(chat.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      chat.appointment?.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : chat.appointment?.status === 'completed'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {chat.appointment?.status || 'Active'}
                    </span>
                    {chat.appointment?.appointmentDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(chat.appointment.appointmentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;