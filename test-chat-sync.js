// Test script to verify chat synchronization
// This script can be run in the browser console to test the chat functionality

console.log('=== Chat Synchronization Test ===');

// Test 1: Check if socket service is available
if (typeof socketService !== 'undefined') {
  console.log('✅ Socket service is available');
  console.log('Connection status:', socketService.getConnectionStatus());
} else {
  console.log('❌ Socket service is not available');
}

// Test 2: Check if user data is available
const userData = localStorage.getItem('user');
if (userData) {
  try {
    const parsedUser = JSON.parse(userData);
    console.log('✅ User data is available:', {
      id: parsedUser._id || parsedUser.id || parsedUser.userId,
      name: parsedUser.first_name || parsedUser.username,
      hasToken: !!parsedUser.access_token
    });
  } catch (e) {
    console.log('❌ Failed to parse user data:', e);
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Test 3: Check if conversations are loaded
// This would need to be run after the chat component has loaded
setTimeout(() => {
  console.log('=== Delayed Tests ===');
  
  // Check if conversations state exists (this would be available in the component)
  console.log('Note: To test conversations, run this in the chat component context');
  
  // Test 4: Test socket connection
  if (typeof socketService !== 'undefined' && socketService.isConnected()) {
    console.log('✅ Socket is connected');
    
    // Test 5: Request available rooms
    console.log('Requesting available rooms...');
    socketService.requestAvailableRooms();
  } else {
    console.log('❌ Socket is not connected');
  }
}, 2000);

// Test 6: Monitor for room availability events
if (typeof socketService !== 'undefined') {
  const originalOnMessage = socketService.onMessage;
  socketService.onMessage((data) => {
    if (data.type === 'room_available') {
      console.log('✅ Room availability event received:', data);
    } else if (data.type === 'available_rooms_list') {
      console.log('✅ Available rooms list received:', data);
    }
  });
}

console.log('=== Test Setup Complete ===');
console.log('Monitor the console for test results...');
