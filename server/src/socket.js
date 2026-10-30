import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';

export const setupSocketServer = (io) => {
  // Socket.IO authentication middleware via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_hommiez');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    // Join a user-specific private room for instant personal notifications
    socket.join(`user:${userId}`);

    // Join a specific conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );

        if (isParticipant) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (err) {
        console.error('Error joining conversation room:', err);
      }
    });

    // Leave a specific conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle real-time incoming message
    socket.on('send_message', async ({ conversationId, text }, callback) => {
      try {
        if (!text || !text.trim()) {
          if (callback) callback({ error: 'Message cannot be empty' });
          return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          if (callback) callback({ error: 'Conversation not found' });
          return;
        }

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );

        if (!isParticipant) {
          if (callback) callback({ error: 'Unauthorized to send message in this conversation' });
          return;
        }

        // Persist message to MongoDB
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          text: text.trim(),
          readBy: [socket.user._id],
        });

        // Update conversation summary
        conversation.lastMessage = {
          text: text.trim(),
          sender: socket.user._id,
          createdAt: message.createdAt,
        };

        // Increment unread count for other participants
        conversation.participants.forEach((pId) => {
          const pStr = pId.toString();
          if (pStr !== userId) {
            const current = conversation.unreadCount.get(pStr) || 0;
            conversation.unreadCount.set(pStr, current + 1);
          }
        });

        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

        // Broadcast to everyone currently viewing the conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', populatedMessage);

        // Also emit notification to each participant's personal room for inbox update
        conversation.participants.forEach((pId) => {
          io.to(`user:${pId.toString()}`).emit('conversation_updated', {
            conversationId,
            lastMessage: conversation.lastMessage,
            message: populatedMessage,
          });
        });

        if (callback) callback({ success: true, message: populatedMessage });
      } catch (err) {
        console.error('Error in send_message socket handler:', err);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName: socket.user.name,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId,
      });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};
