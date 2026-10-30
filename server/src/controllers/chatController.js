import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

/**
 * @desc    Get or create conversation between current user and target user (optionally linked to a listing)
 * @route   POST /api/v1/chat/conversations
 * @access  Private
 */
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { targetUserId, listingId } = req.body;
    const currentUserId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'targetUserId is required to start a chat.',
      });
    }

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself.',
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(targetUserId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if conversation already exists between these 2 users
    let query = {
      participants: { $all: [currentUserId, targetUserId] },
    };
    if (listingId) {
      query.listing = listingId;
    }

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name email role phone avatar')
      .populate('listing', 'title rent photos locationName contactPreference');

    if (!conversation) {
      // Also check if any existing conversation exists without listing constraint
      let existingConv = await Conversation.findOne({
        participants: { $all: [currentUserId, targetUserId] },
      })
        .populate('participants', 'name email role phone avatar')
        .populate('listing', 'title rent photos locationName contactPreference');

      if (existingConv && !listingId) {
        conversation = existingConv;
      } else {
        const newConv = await Conversation.create({
          participants: [currentUserId, targetUserId],
          listing: listingId || null,
          unreadCount: {},
        });

        conversation = await Conversation.findById(newConv._id)
          .populate('participants', 'name email role phone avatar')
          .populate('listing', 'title rent photos locationName contactPreference');
      }
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all conversations for the logged in user
 * @route   GET /api/v1/chat/conversations
 * @access  Private
 */
export const getUserConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();

    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email role phone avatar')
      .populate('listing', 'title rent photos locationName')
      .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 })
      .lean();

    // Map conversations to cleanly expose the other participant's data and current user's unread count
    const formatted = conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== currentUserId
      ) || { name: 'Unknown User' };

      const unread = conv.unreadCount ? (conv.unreadCount[currentUserId] || 0) : 0;

      return {
        _id: conv._id,
        listing: conv.listing,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role,
          avatar: otherUser.avatar,
        },
        lastMessage: conv.lastMessage,
        unreadCount: unread,
        updatedAt: conv.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get messages for a conversation with pagination
 * @route   GET /api/v1/chat/conversations/:conversationId/messages
 * @access  Private
 */
export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 40 } = req.query;
    const currentUserId = req.user._id;

    // Verify conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation.',
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, totalCount] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 }) // Newest first for pagination
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    // Reset unread count for current user
    if (conversation.unreadCount) {
      conversation.unreadCount.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    // Mark messages as read by current user
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: currentUserId },
        readBy: { $ne: currentUserId },
      },
      {
        $addToSet: { readBy: currentUserId },
      }
    );

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Send in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        hasMore: skip + messages.length < totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message via HTTP fallback (if socket not connected)
 * @route   POST /api/v1/chat/conversations/:conversationId/messages
 * @access  Private
 */
export const sendMessageHttp = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: currentUserId,
      text: text.trim(),
      readBy: [currentUserId],
    });

    // Update conversation lastMessage & unread count
    conversation.lastMessage = {
      text: text.trim(),
      sender: currentUserId,
      createdAt: message.createdAt,
    };

    const recipientId = conversation.participants.find(
      (p) => p.toString() !== currentUserId.toString()
    );

    if (recipientId) {
      const recipientKey = recipientId.toString();
      const currentUnread = conversation.unreadCount.get(recipientKey) || 0;
      conversation.unreadCount.set(recipientKey, currentUnread + 1);
    }

    await conversation.save();

    const populatedMsg = await Message.findById(message._id).populate('sender', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedMsg,
    });
  } catch (error) {
    next(error);
  }
};
