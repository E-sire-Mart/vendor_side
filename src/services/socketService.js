// Socket service for real-time chat functionality
class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.messageHandlers = [];
    this.statusHandlers = [];
    this.userId = null;
    this.token = null;
  }

  connect(userId, token) {
    try {
      console.log('SocketService.connect called with userId:', userId);
      this.userId = userId;
      this.token = token;
      
      // Connect to real WebSocket server
      const wsUrl = `ws://localhost:3003?token=${token}`;
      console.log('Attempting to connect to WebSocket URL:', wsUrl);
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected for user:', userId);
        this.reconnectAttempts = 0;
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.handleReconnection();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return true;
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      return false;
    }
  }

  // Add isConnected method
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // Add connection status method
  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  // Add method to wait for connection
  async waitForConnection(timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      const checkConnection = () => {
        if (this.isConnected()) {
          clearTimeout(timeoutId);
          resolve(true);
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  handleIncomingMessage(data) {
    console.log('Received WebSocket message:', data);
    
    switch (data.type) {
      case 'connection':
        console.log('Connection confirmed:', data);
        break;
      case 'room_joined':
        console.log('Joined room:', data);
        break;
      case 'new_message':
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'user_joined':
        console.log('User joined room:', data);
        break;
      case 'typing':
        console.log('Typing indicator:', data);
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'messages_read':
        console.log('Messages marked as read:', data);
        break;
      case 'room_available':
        console.log('Room availability notification:', data);
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'available_rooms_list':
        console.log('Available rooms list received:', data);
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'user_online':
        console.log('User online notification:', data);
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'user_offline':
        console.log('User offline notification:', data);
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'error':
        console.error('WebSocket error:', data.message);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId && this.token) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.userId, this.token);
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    // Clear all handlers to prevent accumulation
    this.messageHandlers = [];
    this.statusHandlers = [];
    console.log('Socket service disconnected');
  }

  // Clear all handlers without disconnecting
  clearHandlers() {
    this.messageHandlers = [];
    this.statusHandlers = [];
    console.log('Socket handlers cleared');
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onStatusChange(handler) {
    this.statusHandlers.push(handler);
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  sendMessage(senderId, receiverId, message, roomId) {
    console.log('sendMessage called with:', { senderId, receiverId, message, roomId });
    console.log('Socket state:', this.socket ? this.socket.readyState : 'null');
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'send_message',
        roomId,
        content: message,
        messageType: 'text'
      };
      
      console.log('Sending message data:', messageData);
      this.socket.send(JSON.stringify(messageData));
      console.log('Message sent via WebSocket successfully');
    } else {
      console.error('WebSocket not connected. Socket:', this.socket);
      console.error('Socket readyState:', this.socket ? this.socket.readyState : 'null');
      console.error('Connection status:', this.getConnectionStatus());
      
      // Try to reconnect and retry
      if (this.userId && this.token) {
        console.log('Attempting to reconnect and retry message send...');
        this.connect(this.userId, this.token);
        
        // Retry after a short delay
        setTimeout(() => {
          if (this.isConnected()) {
            console.log('Retrying message send after reconnection...');
            this.sendMessage(senderId, receiverId, message, roomId);
          } else {
            console.error('Failed to reconnect, cannot send message');
          }
        }, 2000);
      }
    }
  }

  joinChatRoom(userId, contactId, contactName) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const roomId = [userId, contactId].sort().join('_');
      const messageData = {
        type: 'join_room',
        roomId,
        contactId,
        contactName: contactName || 'Contact'
      };
      
      this.socket.send(JSON.stringify(messageData));
      console.log('Joining chat room via WebSocket:', messageData);
    } else {
      console.error('WebSocket not connected, cannot join room. Status:', this.getConnectionStatus());
      
      // Try to reconnect and retry
      if (this.userId && this.token) {
        console.log('Attempting to reconnect and retry room join...');
        this.connect(this.userId, this.token);
        
        // Retry after a short delay
        setTimeout(() => {
          if (this.isConnected()) {
            console.log('Retrying room join after reconnection...');
            this.joinChatRoom(userId, contactId, contactName);
          } else {
            console.error('Failed to reconnect, cannot join room');
          }
        }, 2000);
      }
    }
  }

  leaveChatRoom(roomId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'leave_room',
        roomId
      };
      this.socket.send(JSON.stringify(messageData));
      console.log('Leaving chat room via WebSocket:', messageData);
    } else {
      console.warn('WebSocket not connected, cannot leave room');
    }
  }

  markAsRead(userId, contactId, roomId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'mark_read',
        roomId,
        messageIds: [] // This should be passed from the component
      };
      
      this.socket.send(JSON.stringify(messageData));
      console.log('Marking messages as read via WebSocket:', messageData);
    } else {
      console.error('WebSocket not connected');
    }
  }

  sendTyping(roomId, userId, isTyping) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'typing',
        roomId,
        isTyping
      };
      
      this.socket.send(JSON.stringify(messageData));
      console.log('Typing indicator sent via WebSocket:', messageData);
    } else {
      console.error('WebSocket not connected');
    }
  }

  requestAvailableRooms() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'request_available_rooms'
      };
      
      console.log('Requesting available rooms via WebSocket');
      this.socket.send(JSON.stringify(messageData));
      console.log('Available rooms request sent successfully');
    } else {
      console.error('WebSocket not connected, cannot request available rooms. Status:', this.getConnectionStatus());
      
      // Try to reconnect and retry
      if (this.userId && this.token) {
        console.log('Attempting to reconnect and retry...');
        this.connect(this.userId, this.token);
        
        // Retry after a short delay
        setTimeout(() => {
          if (this.isConnected()) {
            console.log('Retrying available rooms request after reconnection...');
            this.requestAvailableRooms();
          } else {
            console.error('Failed to reconnect, cannot request available rooms');
          }
        }, 2000);
      }
    }
  }

  requestOnlineUsers() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'request_online_users'
      };
      
      console.log('Requesting online users via WebSocket');
      this.socket.send(JSON.stringify(messageData));
      console.log('Online users request sent successfully');
    } else {
      console.error('WebSocket not connected, cannot request online users. Status:', this.getConnectionStatus());
      
      // Try to reconnect and retry
      if (this.userId && this.token) {
        console.log('Attempting to reconnect and retry...');
        this.connect(this.userId, this.token);
        
        // Retry after a short delay
        setTimeout(() => {
          if (this.isConnected()) {
            console.log('Retrying online users request after reconnection...');
            this.requestOnlineUsers();
          } else {
            console.error('Failed to reconnect, cannot request online users');
          }
        }, 2000);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;
