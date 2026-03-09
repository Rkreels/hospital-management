/**
 * Notification WebSocket Service
 * 
 * A standalone WebSocket service for real-time notifications in the Hospital Management System.
 * Runs on port 3002 and supports room-based notifications by user role.
 */

const { Server } = require('socket.io');

const PORT = process.env.PORT || 3002;

// Create Socket.IO server
const io = new Server(PORT, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store connected clients with their roles
const connectedClients = new Map();

// Role-based rooms
const ROLE_ROOMS = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'billing', 'patient', 'all'];

console.log(`🔔 Notification WebSocket Service running on port ${PORT}`);

// Middleware for connection logging
io.use((socket, next) => {
  const { role, userId } = socket.handshake.query;
  
  console.log(`📥 Connection attempt from socket ${socket.id}`);
  console.log(`   Role: ${role || 'not specified'}`);
  console.log(`   User ID: ${userId || 'not specified'}`);
  
  // Store client info
  connectedClients.set(socket.id, {
    socketId: socket.id,
    role: role || 'all',
    userId: userId
  });
  
  next();
});

// Handle connections
io.on('connection', (socket) => {
  const clientInfo = connectedClients.get(socket.id);
  console.log(`✅ Client connected: ${socket.id}`);
  console.log(`   Total connected clients: ${connectedClients.size}`);

  // Join role-based room
  if (clientInfo?.role && ROLE_ROOMS.includes(clientInfo.role)) {
    socket.join(clientInfo.role);
    console.log(`   Joined room: ${clientInfo.role}`);
  }
  
  // Always join 'all' room for broadcast notifications
  socket.join('all');

  // Handle notification events from client
  socket.on('send-notification', (data) => {
    console.log(`📢 Notification received from ${socket.id}:`, data);
    
    const notification = {
      id: `N-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString()
    };

    // Broadcast to specific role room if targetRole is specified
    if (data.targetRole && ROLE_ROOMS.includes(data.targetRole)) {
      io.to(data.targetRole).emit('notification', notification);
      console.log(`   → Sent to role room: ${data.targetRole}`);
    } else {
      // Broadcast to all clients
      io.emit('notification', notification);
      console.log(`   → Broadcast to all clients`);
    }
  });

  // Handle marking notifications as read
  socket.on('mark-read', (data) => {
    console.log(`✓ Mark as read: ${data.notificationId} from ${socket.id}`);
    // This would typically update a database, but we emit an event for the main app to handle
    socket.emit('notification-read', { notificationId: data.notificationId, readAt: new Date().toISOString() });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
    console.log(`❌ Client disconnected: ${socket.id}`);
    console.log(`   Total connected clients: ${connectedClients.size}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`⚠️ Socket error for ${socket.id}:`, error.message);
  });

  // Send welcome notification
  socket.emit('connected', {
    message: 'Connected to Notification Service',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
});

// HTTP endpoint for broadcasting notifications from the main app
// This allows the Next.js API routes to send notifications via HTTP
const http = require('http');
const httpServer = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/broadcast') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('📥 HTTP broadcast request received:', data);

        const notification = {
          id: data.id || `N-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: data.type || 'Info',
          title: data.title,
          message: data.message,
          category: data.category || 'System',
          priority: data.priority || 'Medium',
          targetRole: data.targetRole,
          targetUserId: data.targetUserId,
          actionUrl: data.actionUrl,
          actionLabel: data.actionLabel,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          createdAt: data.createdAt || new Date().toISOString()
        };

        // Broadcast to specific role room if targetRole is specified
        if (data.targetRole && ROLE_ROOMS.includes(data.targetRole)) {
          io.to(data.targetRole).emit('notification', notification);
          console.log(`   → HTTP: Sent to role room: ${data.targetRole}`);
        } else if (data.targetUserId) {
          // Send to specific user (find their socket)
          connectedClients.forEach((client) => {
            if (client.userId === data.targetUserId) {
              io.to(client.socketId).emit('notification', notification);
              console.log(`   → HTTP: Sent to user: ${data.targetUserId}`);
            }
          });
        } else {
          // Broadcast to all clients
          io.emit('notification', notification);
          console.log('   → HTTP: Broadcast to all clients');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, notificationId: notification.id }));
      } catch (error) {
        console.error('Error processing broadcast:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      connectedClients: connectedClients.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  } else if (req.method === 'GET' && req.url === '/stats') {
    const roleCounts = {};
    connectedClients.forEach((client) => {
      roleCounts[client.role] = (roleCounts[client.role] || 0) + 1;
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalConnections: connectedClients.size,
      roleDistribution: roleCounts,
      rooms: Array.from(io.sockets.adapter.rooms.keys()).filter(room => ROLE_ROOMS.includes(room))
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const HTTP_PORT = 3003;
httpServer.listen(HTTP_PORT, () => {
  console.log(`🌐 HTTP broadcast endpoint running on port ${HTTP_PORT}`);
  console.log(`   POST http://localhost:${HTTP_PORT}/broadcast - Send notification`);
  console.log(`   GET http://localhost:${HTTP_PORT}/health - Health check`);
  console.log(`   GET http://localhost:${HTTP_PORT}/stats - Connection stats`);
});
