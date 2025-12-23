import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isTyping: false,
    isConnected: false,
    unreadCount: 0,
    currentChat: null
  },
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    markMessagesAsRead: (state, action) => {
      const messageIds = action.payload;
      state.messages.forEach(msg => {
        if (messageIds.includes(msg._id)) {
          msg.read = true;
        }
      });
      state.unreadCount = 0;
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    }
  }
});

export const {
  setConnected,
  addMessage,
  setMessages,
  setTyping,
  markMessagesAsRead,
  incrementUnread,
  resetUnread,
  setCurrentChat
} = chatSlice.actions;

export default chatSlice.reducer;