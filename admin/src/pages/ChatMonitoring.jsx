import { useState, useEffect } from 'react';
import { FaComments, FaUser, FaUserMd, FaEye } from 'react-icons/fa';

const ChatMonitoring = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchAllChats();
  }, []);

  const fetchAllChats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewChat = async (chatId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedChat(data.chat);
      }
    } catch (error) {
      console.error('Error viewing chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaComments className="text-blue-600" />
          Chat Monitoring
        </h1>
        <p className="text-gray-600 mt-2">Monitor all patient-doctor conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Chats ({chats.length})</h2>
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => viewChat(chat._id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    <span className="font-semibold">{chat.patient?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUserMd className="text-green-600" />
                    <span className="font-semibold">{chat.doctor?.userId?.name}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage || 'No messages yet'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {chat.messages?.length || 0} messages
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {selectedChat ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Chat Details</h2>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p><strong>Patient:</strong> {selectedChat.patient?.name}</p>
                <p><strong>Doctor:</strong> {selectedChat.doctor?.userId?.name}</p>
                <p><strong>Appointment Date:</strong> {new Date(selectedChat.appointment?.appointmentDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedChat.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      msg.senderModel === 'User' ? 'bg-blue-100' : 'bg-green-100'
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {msg.senderModel === 'User' ? 'Patient' : 'Doctor'}
                    </p>
                    <p className="text-gray-800">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <FaEye className="text-6xl mx-auto mb-4 text-gray-300" />
              <p>Select a chat to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMonitoring;