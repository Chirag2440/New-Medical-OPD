import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaComments } from 'react-icons/fa';
import { toast } from 'react-toastify';

const VideoConsultation = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const userVideo = useRef();
  const socketRef = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef();

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        socketRef.current.emit('join-room', {
          roomId,
          userId: user.id,
          userType: user.role
        });

        socketRef.current.on('all-users', users => {
          const peers = [];
          users.forEach(userInfo => {
            const peer = createPeer(userInfo.socketId, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userInfo.socketId,
              peer,
              userInfo
            });
            peers.push({
              peerID: userInfo.socketId,
              peer,
              userInfo
            });
          });
          setPeers(peers);
        });

        socketRef.current.on('user-joined', payload => {
          const peer = addPeer(payload.signal, payload.callerId, stream);
          peersRef.current.push({
            peerID: payload.callerId,
            peer
          });
          setPeers(users => [...users, { peerID: payload.callerId, peer }]);
        });

        socketRef.current.on('receiving-returned-signal', payload => {
          const item = peersRef.current.find(p => p.peerID === payload.id);
          if (item) {
            item.peer.signal(payload.signal);
          }
        });

        socketRef.current.on('user-disconnected', id => {
          const peerObj = peersRef.current.find(p => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter(p => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });

        socketRef.current.on('receive-message', ({ message, sender, timestamp }) => {
          setMessages(prev => [...prev, { message, sender, timestamp }]);
        });

        socketRef.current.on('user-video-toggle', ({ userId, videoEnabled }) => {
          toast.info(`${userId} ${videoEnabled ? 'enabled' : 'disabled'} video`);
        });

        socketRef.current.on('user-audio-toggle', ({ userId, audioEnabled }) => {
          toast.info(`${userId} ${audioEnabled ? 'muted' : 'unmuted'} microphone`);
        });
      })
      .catch(error => {
        toast.error('Failed to access camera/microphone');
        console.error('Media error:', error);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      peersRef.current.forEach(({ peer }) => {
        peer.destroy();
      });
    };
  }, [roomId, user]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('sending-signal', { userToSignal, callerId: callerID, signal });
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('returning-signal', { signal, callerId: callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
      socketRef.current.emit('toggle-video', {
        roomId,
        userId: user.id,
        videoEnabled: videoTrack.enabled
      });
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
      socketRef.current.emit('toggle-audio', {
        roomId,
        userId: user.id,
        audioEnabled: audioTrack.enabled
      });
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    socketRef.current.disconnect();
    navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketRef.current.emit('send-message', {
        roomId,
        message: newMessage,
        sender: user.name
      });
      setMessages(prev => [...prev, {
        message: newMessage,
        sender: user.name,
        timestamp: new Date()
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className={`${showChat ? 'w-3/4' : 'w-full'} p-4 grid grid-cols-2 gap-4`}>
          {/* User's Video */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={userVideo}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              You ({user.role})
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <FaVideoSlash className="text-6xl text-gray-400" />
              </div>
            )}
          </div>

          {/* Peer Videos */}
          {peers.map((peer, index) => (
            <Video key={index} peer={peer.peer} userInfo={peer.userInfo} />
          ))}

          {peers.length === 0 && (
            <div className="flex items-center justify-center bg-gray-800 rounded-lg col-span-1">
              <div className="text-center text-white">
                <p className="text-xl mb-2">Waiting for others to join...</p>
                <div className="animate-pulse">
                  <FaVideo className="text-4xl mx-auto text-blue-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-1/4 bg-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`${msg.sender === user.name ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === user.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {audioEnabled ? <FaMicrophone className="text-xl" /> : <FaMicrophoneSlash className="text-xl" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {videoEnabled ? <FaVideo className="text-xl" /> : <FaVideoSlash className="text-xl" />}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
          >
            <FaComments className="text-xl" />
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
          >
            <FaPhoneSlash className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Video = ({ peer, userInfo }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on('stream', stream => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      {userInfo && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {userInfo.userType === 'doctor' ? 'Dr. ' : ''} {userInfo.userId}
        </div>
      )}
    </div>
  );
};

export default VideoConsultation;