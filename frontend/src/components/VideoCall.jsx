// frontend/src/components/VideoCall.jsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaPhoneSlash,
  FaDesktop,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

const VideoCall = ({ 
  localStream, 
  remoteStream, 
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled = true,
  isVideoEnabled = true,
  participantName = 'Participant'
}) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef();

  // Setup local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Setup remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const resetTimeout = () => {
      setShowControls(true);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetTimeout();
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div 
      className="relative h-full w-full bg-gray-900"
      onMouseMove={handleMouseMove}
    >
      {/* Remote Video (Main) */}
      <div className="absolute inset-0">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaVideo className="text-4xl text-gray-500" />
              </div>
              <p className="text-white text-lg mb-2">Waiting for {participantName}...</p>
              <div className="flex space-x-2 justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Participant Name Overlay */}
        {remoteStream && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
            <p className="text-sm font-medium">{participantName}</p>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white">
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <FaVideoSlash className="text-4xl text-gray-400" />
          </div>
        )}
        
        {/* Local Video Label */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
          You
        </div>

        {/* Muted Indicator */}
        {!isAudioEnabled && (
          <div className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">
            <FaMicrophoneSlash className="text-xs" />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex justify-center items-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-4 rounded-full transition-all duration-200 ${
              isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <FaMicrophone className="text-xl" />
            ) : (
              <FaMicrophoneSlash className="text-xl" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-all duration-200 ${
              isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoEnabled ? (
              <FaVideo className="text-xl" />
            ) : (
              <FaVideoSlash className="text-xl" />
            )}
          </button>

          {/* Screen Share */}
          <button
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
            title="Share Screen"
          >
            <FaDesktop className="text-xl" />
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg"
            title="End Call"
          >
            <FaPhoneSlash className="text-xl" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullScreen ? (
              <FaCompress className="text-xl" />
            ) : (
              <FaExpand className="text-xl" />
            )}
          </button>
        </div>

        {/* Call Info */}
        <div className="text-center mt-4">
          <p className="text-white text-sm opacity-75">
            {remoteStream ? 'Connected' : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Connection Status */}
      {!remoteStream && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
          Establishing connection...
        </div>
      )}

      {/* Network Quality Indicator (Optional) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-green-500 rounded"></div>
            <div className="w-1 h-4 bg-green-500 rounded"></div>
            <div className="w-1 h-5 bg-green-500 rounded"></div>
          </div>
          <span className="text-xs font-medium">Good Connection</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;