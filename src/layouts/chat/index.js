import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  InputAdornment,
  Chip,
  Badge,
  useTheme,
  Fade,
  MenuItem,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";

// Import CSS for additional styling
import "./Chat.css";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// Footer intentionally omitted on chat page to keep layout height fixed

// Context
import { useMaterialUIController } from "context";

// Socket service
import socketService from "../../services/socketService";

function Chat() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const theme = useTheme();
  
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Chat history loading state
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get current user data and token from localStorage
        const userData = localStorage.getItem('user');
        let token = null;
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            token = parsedUser.access_token || parsedUser.token;
          } catch (e) {
            console.warn('Failed to parse user data from localStorage');
          }
        }
        
        // If no token found in user data, try to get it directly from localStorage
        if (!token) {
          token = localStorage.getItem('token');
        }

        const response = await fetch('http://localhost:3003/api/v1/chat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const users = data.data || [];

        // Map backend users to conversations (no need to filter current user - backend handles it)
        const mappedConversations = users
          .map((user) => {
            // Determine roles based on backend fields (users can have multiple roles)
            const roles = [];
            if (user.isAdmin) roles.push('admin');
            if (user.is_owner) roles.push('vendor');
            if (user.isDelivery) roles.push('delivery');
            if (roles.length === 0) roles.push('user');

            // Handle avatar URL
            let avatarUrl = '';
            if (user.avatar && user.avatar !== 'undefined' && user.avatar !== 'null') {
              avatarUrl = `http://localhost:3003/uploads/${user.avatar}`;
            } else {
              avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.first_name || user.username || 'User')}`;
            }

            return {
              id: user._id,
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email,
              avatar: avatarUrl,
              lastMessage: '',
              timestamp: new Date(user.created_at || Date.now()).toLocaleDateString(),
              unread: 0,
              online: Boolean(user.isOnline),
              roles: roles,
              role: roles[0], // Keep for backward compatibility
            };
          });

        setConversations(mappedConversations);
        
        // Initialize socket connection
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            let userId = parsedUser._id || parsedUser.id || parsedUser.userId;
            
            if (userId) {
              console.log('Attempting to connect socket for user:', userId);
              // Clear any existing handlers first
              socketService.clearHandlers();
              const connected = socketService.connect(userId, parsedUser.access_token);
              console.log('Socket connection result:', connected);
              
              // Set up socket message handlers
              socketService.onMessage((data) => {
                if (data.type === 'new_message' && data.message) {
                  const newMsg = {
                    id: data.message.id,
                    text: data.message.content,
                    senderId: data.message.senderId,
                    timestamp: new Date(data.message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }),
                    isOwn: data.message.senderId === userId,
                    status: data.message.status
                  };
                  
                  setMessages(prev => {
                    // Check if this is a message we just sent (by content and sender)
                    const isOwnMessage = newMsg.isOwn && 
                      prev.some(msg => msg.text === newMsg.text && msg.isOwn && msg.id.startsWith('local_'));
                    
                    if (isOwnMessage) {
                      // Replace the local message with the server message (to get proper ID and status)
                      return prev.map(msg => 
                        (msg.text === newMsg.text && msg.isOwn && msg.id.startsWith('local_')) 
                          ? newMsg 
                          : msg
                      );
                    } else {
                      // This is a message from someone else, add it normally
                      const messageExists = prev.some(msg => msg.id === newMsg.id);
                      if (messageExists) {
                        return prev; // Don't add duplicate
                      }
                      return [...prev, newMsg];
                    }
                  });

                  // Update conversation preview (lastMessage and timestamp)
                  setConversations(prevConversations => prevConversations.map(conv => {
                    if (selectedChat && (conv.id === selectedChat.id || conv.id === newMsg.senderId)) {
                      return {
                        ...conv,
                        lastMessage: newMsg.text,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                    }
                    return conv;
                  }));
                } else if (data.type === 'room_available') {
                  console.log('Room availability notification received:', data);
                  
                  // This notification means a new chat room has been created
                  // We can use this to update contact information or prepare for future chat
                  if (data.initiator && data.participant) {
                    console.log('New room available between:', data.initiator.name, 'and', data.participant.name);
                    
                    // Get current user ID to determine if this room involves the current user
                    const userData = localStorage.getItem('user');
                    let currentUserId = null;
                    if (userData) {
                      try {
                        const parsedUser = JSON.parse(userData);
                        currentUserId = parsedUser._id || parsedUser.id || parsedUser.userId;
                      } catch (e) {
                        console.warn('Failed to parse user data from localStorage');
                      }
                    }
                    
                    // Check if current user is involved in this room
                    const isInvolved = currentUserId && (
                      data.initiator.id === currentUserId || 
                      data.participant.id === currentUserId
                    );
                    
                    if (isInvolved) {
                      console.log('Current user is involved in this room, updating conversation list');
                      
                      // Update contact information if needed
                      setConversations(prevConversations => {
                        const updatedConversations = [...prevConversations];
                        
                        // Find and update the other participant in the conversation
                        const otherParticipantId = data.initiator.id === currentUserId ? 
                          data.participant.id : data.initiator.id;
                        const otherParticipantName = data.initiator.id === currentUserId ? 
                          data.participant.name : data.initiator.name;
                        const otherParticipantRoles = data.initiator.id === currentUserId ? 
                          data.participant.roles : data.initiator.roles;
                        
                        // Check if this conversation already exists
                        const existingIndex = updatedConversations.findIndex(conv => conv.id === otherParticipantId);
                        
                        if (existingIndex >= 0) {
                          // Update existing conversation
                          updatedConversations[existingIndex] = {
                            ...updatedConversations[existingIndex],
                            timestamp: new Date(data.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }),
                            lastMessage: 'New conversation started'
                          };
                        } else {
                          // Add new conversation
                          const newConversation = {
                            id: otherParticipantId,
                            name: otherParticipantName,
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherParticipantName)}`,
                            lastMessage: 'New conversation started',
                            timestamp: new Date(data.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }),
                            unread: 1,
                            online: true,
                            roles: otherParticipantRoles,
                            role: otherParticipantRoles[0]
                          };
                          updatedConversations.unshift(newConversation); // Add to beginning
                        }
                        
                        return updatedConversations;
                      });
                    }
                  }
                } else if (data.type === 'typing') {
                  console.log('Typing indicator received:', data);
                  // Handle typing indicator
                  if (data.userId !== userId) {
                    setConversations(prevConversations => 
                      prevConversations.map(conversation => {
                        if (conversation.id === data.userId) {
                          return {
                            ...conversation,
                            isTyping: data.isTyping
                          };
                        }
                        return conversation;
                      })
                    );
                  }
                } else if (data.type === 'user_online') {
                  console.log('User online notification:', data);
                  // Update contact online status
                  setConversations(prevConversations => 
                    prevConversations.map(conversation => {
                      if (conversation.id === data.user.id) {
                        return {
                          ...conversation,
                          online: true,
                          status: 'online'
                        };
                      }
                      return conversation;
                    })
                  );
                } else if (data.type === 'user_offline') {
                  console.log('User offline notification:', data);
                  // Update contact online status
                  setConversations(prevConversations => 
                    prevConversations.map(conversation => {
                      if (conversation.id === data.user.id) {
                        return {
                          ...conversation,
                          online: false,
                          status: 'offline'
                        };
                      }
                      return conversation;
                    })
                  );
                } else if (data.type === 'room_joined') {
                  // Server confirms/join provides canonical room id
                  const joinedRoomId = (data.room && (data.room.id || data.room._id)) || data.roomId;
                  if (joinedRoomId) {
                    setCurrentRoomId(joinedRoomId);
                    // Load history for the canonical room id
                    loadChatHistory(joinedRoomId);
                  }
                } else if (data.type === 'available_rooms_list') {
                  console.log('Received available rooms list:', data.rooms);
                  
                  // This can be used to populate existing chat rooms
                  if (data.rooms && data.rooms.length > 0) {
                    console.log(`Found ${data.rooms.length} existing chat rooms`);
                    
                    // Get current user ID
                    const userData = localStorage.getItem('user');
                    let currentUserId = null;
                    if (userData) {
                      try {
                        const parsedUser = JSON.parse(userData);
                        currentUserId = parsedUser._id || parsedUser.id || parsedUser.userId;
                      } catch (e) {
                        console.warn('Failed to parse user data from localStorage');
                      }
                    }
                    
                    if (currentUserId) {
                      // Update conversations with existing rooms
                      setConversations(prevConversations => {
                        const updatedConversations = [...prevConversations];
                        
                        data.rooms.forEach(room => {
                          // Find the other participant in this room
                          const otherParticipant = room.participants.find(p => p.userId !== currentUserId);
                          
                          if (otherParticipant) {
                            // Check if this conversation already exists
                            const existingIndex = updatedConversations.findIndex(conv => conv.id === otherParticipant.userId);
                            
                            if (existingIndex >= 0) {
                              // Update existing conversation with room info
                              updatedConversations[existingIndex] = {
                                ...updatedConversations[existingIndex],
                                lastMessage: room.lastMessage ? room.lastMessage.content : '',
                                timestamp: room.lastMessage ? 
                                  new Date(room.lastMessage.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  }) : 
                                  new Date(room.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                              };
                            }
                            // Note: We don't create new conversations here as they should already exist from the user list
                          }
                        });
                        
                        return updatedConversations;
                      });
                    }
                  }
                }
              });
              
              // Mark current user as online
              fetch('http://localhost:3003/api/v1/chat/online', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${parsedUser.access_token}`
                },
                body: JSON.stringify({ isOnline: true })
              }).catch(error => {
                console.warn('Failed to mark user as online:', error);
              });
              
              // Request available rooms for synchronization
              setTimeout(() => {
                if (socketService.isConnected()) {
                  console.log('Requesting available rooms for shop admin dashboard...');
                  socketService.requestAvailableRooms();
                } else {
                  console.warn('Socket not connected, will retry available rooms request...');
                  // Retry after a longer delay
                  setTimeout(() => {
                    if (socketService.isConnected()) {
                      console.log('Retrying available rooms request...');
                      socketService.requestAvailableRooms();
                    } else {
                      console.error('Socket still not connected after retry');
                    }
                  }, 3000);
                }
              }, 1500);
            }
          } catch (e) {
            console.warn('Failed to initialize socket connection');
          }
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    
    // Cleanup function
    return () => {
      socketService.disconnect();
      
      // Mark current user as offline when component unmounts
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          fetch('http://localhost:3003/api/v1/chat/online', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${parsedUser.access_token}`
            },
            body: JSON.stringify({ isOnline: false })
          }).catch(error => {
            console.warn('Failed to mark user as offline:', error);
          });
        } catch (e) {
          console.warn('Failed to mark user as offline');
        }
      }
    };
  }, []);

  // Filter conversations based on search query and role filter
  useEffect(() => {
    const filtered = conversations.filter((conv) => {
      const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || conv.roles.includes(roleFilter);
      return matchesSearch && matchesRole;
    });
    setFilteredConversations(filtered);
  }, [searchQuery, roleFilter, conversations]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const handleSendMessage = async () => {
    if (message.trim() && selectedChat && currentRoomId) {
      const messageText = message.trim();
      setMessage(""); // Clear input immediately

      // Create local message for immediate display
      const localMessageId = `local_${Date.now()}`;
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData)._id : null;
      
      const localMessage = {
        id: localMessageId,
        senderId: userId,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isOwn: true,
        status: 'sent'
      };

      // Add message to local state immediately for instant feedback
      setMessages(prev => [...prev, localMessage]);

      // Ensure socket is connected before sending
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const userId = parsedUser._id || parsedUser.id || parsedUser.userId;
          if (userId) {
            // If not connected yet, connect and wait briefly
            if (!socketService.isConnected()) {
              try {
                const token = parsedUser.access_token || parsedUser.token || localStorage.getItem('token');
                if (token) {
                  socketService.connect(userId, token);
                  await socketService.waitForConnection(3000).catch(() => {});
                }
              } catch (e) {
                // no-op, fallback to direct send attempt
              }
            }
            socketService.sendMessage(userId, selectedChat.id, messageText, currentRoomId);
          }
        } catch (e) {
          console.warn('Failed to send message via socket');
        }
      }
      
      // Also send via backend for persistence
      sendMessageToBackend(messageText, currentRoomId);

      // Update conversation list preview for selected chat immediately
      setConversations(prevConversations => prevConversations.map(conv => {
        if (selectedChat && conv.id === selectedChat.id) {
          return {
            ...conv,
            lastMessage: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return conv;
      }));
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    if (currentRoomId && selectedChat?.id) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const userId = parsedUser._id || parsedUser.id || parsedUser.userId;
          if (userId) {
            socketService.sendTyping(currentRoomId, userId, true);
          }
        } catch (e) {
          console.warn('Failed to send typing indicator');
        }
      }
    }
  };

  const handleTypingStop = () => {
    if (currentRoomId && selectedChat?.id) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const userId = parsedUser._id || parsedUser.id || parsedUser.userId;
          if (userId) {
            socketService.sendTyping(currentRoomId, userId, false);
          }
        } catch (e) {
          console.warn('Failed to send typing indicator');
        }
      }
    }
  };

  // Debounced typing stop
  useEffect(() => {
    if (message.trim()) {
      handleTypingStart();
      const timer = setTimeout(() => {
        handleTypingStop();
      }, 1000); // Stop typing indicator after 1 second of no input
      
      return () => clearTimeout(timer);
    } else {
      handleTypingStop();
    }
  }, [message, currentRoomId, selectedChat]);

  const sendMessageToBackend = async (messageText, roomId) => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const response = await fetch(`http://localhost:3003/api/v1/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${parsedUser.access_token}`
          },
          body: JSON.stringify({
            content: messageText,
            messageType: 'text'
          })
        });
        
        const data = await response.json().catch(() => null);
        if (response.ok && data && (data.data || data.message)) {
          const saved = (data.data && (data.data.message || data.data)) || data.message;
          const savedId = (saved && (saved._id || saved.id)) || undefined;
          const savedTimestamp = (saved && (saved.createdAt || saved.timestamp)) || new Date().toISOString();
          console.log('Message persisted:', { id: savedId, statusCode: response.status });
          // Replace matching local message with persisted one
          setMessages(prev => {
            const idx = prev.findIndex(m => m.text === messageText && m.isOwn && String(m.id).startsWith('local_'));
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = {
              id: savedId || updated[idx].id,
              senderId: updated[idx].senderId,
              text: messageText,
              timestamp: new Date(savedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOwn: true,
              status: 'sent'
            };
            return updated;
          });
        } else {
          console.error('Backend message save failed:', {
            status: response.status,
            statusText: response.statusText,
            body: data
          });
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const loadChatHistory = async (roomId) => {
    if (!roomId) return;
    
    setChatHistoryLoading(true);
    try {
      // Get token and current user ID from localStorage
      let token = null;
      let currentUserId = null;
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          token = parsedUser.access_token || parsedUser.token;
          currentUserId = parsedUser._id || parsedUser.id || parsedUser.userId;
        } catch (e) {
          console.warn('Failed to parse user data from localStorage');
        }
      }
      
      // If no token found in user data, try to get it directly from localStorage
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      // If no userId from userData, try to extract from JWT token
      if (!currentUserId && token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = tokenPayload.userId;
        } catch (e) {
          console.warn('Failed to decode JWT token for userId extraction:', e);
        }
      }
      
      if (token) {
        const response = await fetch(`http://localhost:3003/api/v1/chat/rooms/${roomId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.messages) {
            const formattedMessages = data.data.messages.map((msg) => ({
              id: msg.id || msg._id,
              senderId: msg.senderId,
              text: msg.content,
              timestamp: new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              isOwn: msg.senderId === currentUserId,
              status: msg.status || 'sent'
            }));
            setMessages(formattedMessages);
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } else {
        console.error('No authentication token available for loading chat history');
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    } finally {
      setChatHistoryLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (event) => {
    setMessage(event.target.value);
    
    // Simulate typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    setIsTyping(true);
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <DoneIcon className="status-icon sent" />;
      case "delivered":
        return <DoneAllIcon className="status-icon delivered" />;
      case "read":
        return <DoneAllIcon className="status-icon read" />;
      default:
        return null;
    }
  };

  const getChatMessages = (chatId) => {
    // Return messages from state (loaded from backend)
    return messages;
  };

  const isDark = darkMode;

  // Lock page scroll while chat is mounted to prevent layout jumping
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox
        py={0}
        sx={{
          height: "calc(100vh - 120px)",
          overflow: "hidden",
          position: "relative",
          overscrollBehavior: "none",
        }}
      >
        <Grid container spacing={3} className="chat-layout-container" sx={{ height: "100%", overflow: "hidden", overscrollBehavior: "none" }}>
          {/* Chat List Sidebar */}
          <Grid item xs={12} md={4} sx={{ height: "100%", overflow: "hidden" }}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overscrollBehavior: "contain" }}>
              <MDBox p={2} borderBottom={1} borderColor="divider">
                <Typography variant="h6" fontWeight="600">
                  Messages
                </Typography>
                
                {/* Role Filter */}
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Filter by Role"
                  className="role-filter-dropdown"
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="admin">Admins</MenuItem>
                  <MenuItem value="vendor">Vendors</MenuItem>
                  <MenuItem value="delivery">Delivery Workers</MenuItem>
                  <MenuItem value="user">General Users</MenuItem>
                </TextField>
                
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 2 }}
                />
              </MDBox>
              
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <List sx={{ p: 0 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <Typography>Loading users...</Typography>
                    </Box>
                  ) : (
                    filteredConversations.map((conversation, index) => (
                    <React.Fragment key={conversation.id}>
                      <ListItem
                        button
                        selected={selectedChat?.id === conversation.id}
                        onClick={async () => {
                          setSelectedChat(conversation);
                          
                          // Get current user ID from JWT token
                          let currentUserId = null;
                          const userData = localStorage.getItem('user');
                          if (userData) {
                            try {
                              const parsedUser = JSON.parse(userData);
                              currentUserId = parsedUser._id || parsedUser.id || parsedUser.userId;
                            } catch (e) {
                              console.warn('Failed to parse user data from localStorage');
                            }
                          }
                          
                          // If no userId from userData, try to extract from JWT token
                          if (!currentUserId) {
                            const token = localStorage.getItem('token');
                            if (token) {
                              try {
                                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                                currentUserId = tokenPayload.userId;
                                console.log('Extracted userId from JWT token for chat:', currentUserId);
                              } catch (e) {
                                console.warn('Failed to decode JWT token for userId extraction:', e);
                              }
                            }
                          }
                          
                          if (currentUserId) {
                            const newRoomId = [currentUserId, conversation.id].sort().join('_');

                            // Leave previous room if any
                            if (currentRoomId && currentRoomId !== newRoomId) {
                              try {
                                socketService.leaveChatRoom(currentRoomId);
                              } catch (_) {}
                            }

                            // Update room id
                            setCurrentRoomId(newRoomId);

                            // Clear previous messages immediately to avoid showing old conversation
                            setMessages([]);
                            
                            // Ensure socket connection before joining room
                            try {
                              const userData = localStorage.getItem('user');
                              const parsedUser = userData ? JSON.parse(userData) : {};
                              const token = (parsedUser && (parsedUser.access_token || parsedUser.token)) || localStorage.getItem('token');
                              if (!socketService.isConnected() && token) {
                                socketService.connect(currentUserId, token);
                                await socketService.waitForConnection(3000).catch(() => {});
                              }
                            } catch (_) {}

                            // Join chat room via socket (server will return canonical room id)
                            socketService.joinChatRoom(currentUserId, conversation.id, conversation.name);
                            
                            // Load chat history using provisional id; will be corrected on 'room_joined'
                            loadChatHistory(newRoomId);
                          } else {
                            console.error('Could not determine current user ID for chat room');
                          }
                        }}
                        className={`chat-list-item ${isDark ? 'dark' : ''} ${selectedChat?.id === conversation.id ? 'selected' : ''}`}
                        sx={{
                          px: 2,
                          py: 1,
                          "&.Mui-selected": {
                            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                          },
                          "&:hover": {
                            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={
                              conversation.online ? (
                                <CircleIcon
                                  sx={{
                                    fontSize: 12,
                                    color: "success.main",
                                    backgroundColor: isDark ? "background.paper" : "white",
                                    borderRadius: "50%",
                                  }}
                                />
                              ) : null
                            }
                          >
                            <Avatar src={conversation.avatar} />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="600">
                                {conversation.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {conversation.timestamp}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
                                {conversation.roles?.map((role, index) => (
                                  <Chip
                                    key={index}
                                    label={
                                      role === 'admin' ? '👑 Admin' :
                                      role === 'vendor' ? '🏪 Shop Admin' :
                                      role === 'delivery' ? '🚚 Delivery' :
                                      '👤 User'
                                    }
                                    size="small"
                                    color={
                                      role === 'admin' ? 'error' :
                                      role === 'vendor' ? 'success' :
                                      role === 'delivery' ? 'warning' :
                                      'primary'
                                    }
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                ))}
                              </Box>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 150,
                                  }}
                                >
                                  {conversation.lastMessage}
                                </Typography>
                                {conversation.unread > 0 && (
                                  <Chip
                                    label={conversation.unread}
                                    size="small"
                                    color="primary"
                                    sx={{ minWidth: 20, height: 20, fontSize: "0.75rem" }}
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < filteredConversations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                  )}
                </List>
              </Box>
            </Card>
          </Grid>

          {/* Chat Window */}
          <Grid item xs={12} md={8} sx={{ height: "100%", overflow: "hidden" }}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overscrollBehavior: "contain" }}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <MDBox
                    p={2}
                    borderBottom={1}
                    borderColor="divider"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        badgeContent={
                          selectedChat.online ? (
                            <CircleIcon
                              sx={{
                                fontSize: 12,
                                color: "success.main",
                                backgroundColor: isDark ? "background.paper" : "white",
                                borderRadius: "50%",
                              }}
                            />
                          ) : null
                        }
                      >
                        <Avatar src={selectedChat.avatar} />
                      </Badge>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {selectedChat.name}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                          {selectedChat.roles?.map((role, index) => (
                            <Chip
                              key={index}
                              label={
                                role === 'admin' ? '👑 Admin' :
                                role === 'vendor' ? '🏪 Shop Admin' :
                                role === 'delivery' ? '🚚 Delivery' :
                                '👤 User'
                              }
                              size="small"
                              color={
                                role === 'admin' ? 'error' :
                                role === 'vendor' ? 'success' :
                                role === 'delivery' ? 'warning' :
                                'primary'
                              }
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {selectedChat.online ? "Online" : "Offline"}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  </MDBox>

                  {/* Messages Area */}
                  <Box
                    className={`chat-messages ${isDark ? 'dark' : ''}`}
                    sx={{
                      flex: 1,
                      overflow: "auto",
                      p: 3,
                      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                      overscrollBehavior: "contain",
                    }}
                  >
                    {chatHistoryLoading ? (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="200px"
                        color="text.secondary"
                      >
                        <Typography variant="body1">Loading chat history...</Typography>
                      </Box>
                    ) : getChatMessages(selectedChat.id).length === 0 ? (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="200px"
                        color="text.secondary"
                        textAlign="center"
                      >
                        <Typography variant="h4" sx={{ mb: 1 }}>💬</Typography>
                        <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                          No Chat History
                        </Typography>
                        <Typography variant="body2">
                          Start a conversation with {selectedChat.name} by sending your first message!
                        </Typography>
                      </Box>
                    ) : (
                      getChatMessages(selectedChat.id).map((msg) => (
                      <Fade in={true} key={msg.id}>
                        <Box
                          display="flex"
                          justifyContent={msg.isOwn ? "flex-end" : "flex-start"}
                          mb={2}
                          px={1}
                        >
                          <Paper
                            elevation={1}
                            className={`message-bubble ${msg.isOwn ? 'own' : 'other'}`}
                            sx={{
                              p: 2.5,
                              maxWidth: "70%",
                              backgroundColor: msg.isOwn
                                ? (isDark ? "primary.dark" : "primary.main")
                                : (isDark ? "background.paper" : "white"),
                              color: msg.isOwn ? "white" : "text.primary",
                              borderRadius: 2,
                              position: "relative",
                              mx: 1,
                            }}
                          >
                            <Typography variant="body2">{msg.text}</Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                              <Typography
                                variant="caption"
                                color={msg.isOwn ? "rgba(255,255,255,0.7)" : "text.secondary"}
                              >
                                {msg.timestamp}
                              </Typography>
                              {msg.isOwn && (
                                <Box className="message-status">
                                  {getMessageStatusIcon(msg.status)}
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Box>
                      </Fade>
                    ))
                    )}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <Fade in={isTyping}>
                        <Box display="flex" justifyContent="flex-start" mb={2} px={1}>
                          <Box className={`typing-indicator ${isDark ? 'dark' : ''}`}>
                            <Box className={`typing-dot ${isDark ? 'dark' : ''}`}></Box>
                            <Box className={`typing-dot ${isDark ? 'dark' : ''}`}></Box>
                            <Box className={`typing-dot ${isDark ? 'dark' : ''}`}></Box>
                          </Box>
                        </Box>
                      </Fade>
                    )}
                  </Box>

                  {/* Message Input */}
                  <MDBox p={2} borderTop={1} borderColor="divider">
                    <Box display="flex" gap={1} alignItems="flex-end" sx={{ minHeight: 56 }}>
                      <IconButton size="small" sx={{ flexShrink: 0 }}>
                        <AttachFileIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ flexShrink: 0 }}>
                        <EmojiIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        variant="outlined"
                        size="small"
                        className="chat-input"
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                      <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="send-button"
                        sx={{
                          flexShrink: 0,
                          backgroundColor: "primary.main",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                          "&.Mui-disabled": {
                            backgroundColor: "action.disabledBackground",
                            color: "action.disabled",
                          },
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </MDBox>
                </>
              ) : (
                /* No Chat Selected State */
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  p={3}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Select a conversation to start chatting
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Choose from the conversations on the left to view messages and start a conversation.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Chat;


