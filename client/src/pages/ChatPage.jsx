import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getSocket } from '../api/socket';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Building,
  User,
  ArrowLeft,
  Search,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const conversationQueryId = searchParams.get('c');
  const targetUserId = searchParams.get('user');
  const listingId = searchParams.get('listing');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of message list
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // 1. Fetch user conversations
  const fetchConversations = async (autoSelectId = null) => {
    try {
      const res = await axiosClient.get('/chat/conversations');
      const convList = res.data.data || [];
      setConversations(convList);

      if (autoSelectId) {
        const found = convList.find((c) => c._id === autoSelectId);
        if (found) {
          setActiveConversation(found);
          setIsMobileViewingChat(true);
        }
      } else if (!activeConversation && convList.length > 0 && !targetUserId) {
        setActiveConversation(convList[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // 2. Handle initiating chat from query params (e.g. from listing page)
  useEffect(() => {
    const initChat = async () => {
      if (targetUserId) {
        setLoadingConversations(true);
        try {
          const res = await axiosClient.post('/chat/conversations', {
            targetUserId,
            listingId: listingId || undefined,
          });
          const conversation = res.data.data;
          await fetchConversations(conversation._id);
          setActiveConversation(conversation);
          setIsMobileViewingChat(true);
        } catch (err) {
          console.error('Error starting chat:', err);
          await fetchConversations();
        }
      } else if (conversationQueryId) {
        await fetchConversations(conversationQueryId);
      } else {
        await fetchConversations();
      }
    };

    if (user) {
      initChat();
    }
  }, [user, targetUserId, listingId, conversationQueryId]);

  // 3. Socket.IO integration
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (newMessage) => {
      if (activeConversation && newMessage.conversation === activeConversation._id) {
        setMessages((prev) => {
          // Avoid duplicate message if already added locally
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        setTimeout(() => scrollToBottom(true), 50);
      }

      // Update conversations list summary
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === newMessage.conversation) {
            return {
              ...c,
              lastMessage: {
                text: newMessage.text,
                sender: newMessage.sender?._id || newMessage.sender,
                createdAt: newMessage.createdAt,
              },
              unreadCount:
                activeConversation?._id === c._id
                  ? 0
                  : (c.unreadCount || 0) + (newMessage.sender?._id !== user.id ? 1 : 0),
            };
          }
          return c;
        })
      );
    };

    const handleConversationUpdated = ({ conversationId, lastMessage }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, lastMessage } : c))
      );
    };

    const handleUserTyping = ({ conversationId }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setOtherUserTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ conversationId }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setOtherUserTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [user, activeConversation]);

  // 4. Fetch messages when activeConversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const socket = socketRef.current || getSocket();
    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await axiosClient.get(`/chat/conversations/${activeConversation._id}/messages`);
        setMessages(res.data.data || []);
        setTimeout(() => scrollToBottom(false), 50);

        // Reset unread in local state
        setConversations((prev) =>
          prev.map((c) => (c._id === activeConversation._id ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation]);

  // Handle typing notification
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    const socket = socketRef.current || getSocket();
    if (socket && activeConversation) {
      socket.emit('typing_start', { conversationId: activeConversation._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId: activeConversation._id });
      }, 1500);
    }
  };

  // 5. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    const socket = socketRef.current || getSocket();

    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        { conversationId: activeConversation._id, text: textToSend },
        (response) => {
          setSending(false);
          if (response?.error) {
            console.error('Socket message send failed:', response.error);
          }
        }
      );
    } else {
      // Fallback via HTTP API
      try {
        const res = await axiosClient.post(
          `/chat/conversations/${activeConversation._id}/messages`,
          { text: textToSend }
        );
        const savedMsg = res.data.data;
        setMessages((prev) => [...prev, savedMsg]);
        setTimeout(() => scrollToBottom(true), 50);
      } catch (err) {
        console.error('Failed to send message via HTTP:', err);
      } finally {
        setSending(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Please log in to access your chat messages.
        </p>
        <Link to="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const otherName = c.otherUser?.name || '';
    const listingTitle = c.listing?.title || '';
    const query = searchFilter.toLowerCase();
    return otherName.toLowerCase().includes(query) || listingTitle.toLowerCase().includes(query);
  });

  const getRecipientName = (conv) => {
    if (!conv) return 'Chat';
    if (conv.otherUser?.name) return conv.otherUser.name;
    const other = conv.participants?.find((p) => p._id !== user.id);
    return other?.name || 'Property Owner';
  };

  return (
    <div
      className="container"
      style={{
        padding: '1.25rem 1rem 3rem',
        maxWidth: '1200px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          height: 'calc(100vh - 140px)',
          minHeight: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
        className="chat-main-grid"
      >
        {/* LEFT COLUMN: Conversation List */}
        <div
          style={{
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            height: '100%',
          }}
          className={`chat-sidebar ${isMobileViewingChat ? 'hide-on-mobile' : ''}`}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MessageSquare size={20} color="var(--primary)" />
                <span>Messages</span>
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                }}
              >
                {conversations.length}
              </span>
            </div>

            {/* Search filter input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.825rem',
                  backgroundColor: '#F8FAFC',
                }}
              />
            </div>
          </div>

          {/* List of Conversations */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConversations ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.35rem' }}>No messages yet</p>
                <p style={{ fontSize: '0.775rem' }}>
                  Inquire on flat/PG listings or message student sellers directly!
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?._id === conv._id;
                const other = conv.otherUser || {};
                const lastMsg = conv.lastMessage;
                const unread = conv.unreadCount || 0;

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setActiveConversation(conv);
                      setIsMobileViewingChat(true);
                    }}
                    style={{
                      padding: '0.9rem 1rem',
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--primary-light)' : '#FFFFFF',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? 'var(--primary)' : '#E2E8F0',
                          color: isActive ? '#FFFFFF' : 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          flexShrink: 0,
                        }}
                      >
                        {other.name ? other.name.charAt(0).toUpperCase() : <User size={18} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span
                            style={{
                              fontWeight: unread > 0 ? '800' : '700',
                              fontSize: '0.9rem',
                              color: 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {other.name || 'User'}
                          </span>
                          {lastMsg?.createdAt && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                              {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {conv.listing?.title && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--primary)',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginBottom: '0.15rem',
                            }}
                          >
                            🏡 {conv.listing.title}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: unread > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                              fontWeight: unread > 0 ? '700' : 'normal',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {lastMsg?.text || 'Started a conversation'}
                          </span>

                          {unread > 0 && (
                            <span
                              style={{
                                backgroundColor: 'var(--accent, #FF5A36)',
                                color: '#FFFFFF',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginLeft: '0.4rem',
                              }}
                            >
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Room */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FAFAF9',
            height: '100%',
          }}
          className={`chat-content ${!isMobileViewingChat ? 'hide-on-mobile' : ''}`}
        >
          {activeConversation ? (
            <>
              {/* Chat Room Header */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#FFFFFF',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileViewingChat(false)}
                    className="mobile-back-btn"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      display: 'none',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      minHeight: 'unset',
                    }}
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                    }}
                  >
                    {getRecipientName(activeConversation).charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.975rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {getRecipientName(activeConversation)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: otherUserTyping ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {otherUserTyping ? 'Typing...' : 'Active on Hommiez'}
                    </div>
                  </div>
                </div>

                {/* Optional Property Pill */}
                {activeConversation.listing && (
                  <Link
                    to={`/listings/${activeConversation.listing._id}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                    }}
                  >
                    <Building size={14} />
                    <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeConversation.listing.title}
                    </span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>

              {/* Messages Scroll Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {loadingMessages ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Loading message history...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: '320px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem',
                      }}
                    >
                      <Sparkles size={22} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Start the Conversation
                    </h3>
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                      Say hello, ask about room availability, or arrange a visit with the property owner.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = (msg.sender?._id || msg.sender) === user.id;

                    return (
                      <div
                        key={msg._id || idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '75%',
                            padding: '0.65rem 0.95rem',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            backgroundColor: isMe ? 'var(--primary)' : '#FFFFFF',
                            color: isMe ? '#FFFFFF' : 'var(--text-main)',
                            border: isMe ? 'none' : '1px solid var(--border-color)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.text}
                        </div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.2rem',
                            padding: '0 0.25rem',
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={handleInputChange}
                  style={{
                    flex: 1,
                    padding: '0.7rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputText.trim() && !sending ? 'pointer' : 'default',
                    opacity: inputText.trim() && !sending ? 1 : 0.5,
                    transition: 'all 0.15s ease',
                    minHeight: 'unset',
                    flexShrink: 0,
                  }}
                >
                  <Send size={18} style={{ transform: 'translateX(1px)' }} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Select a conversation
              </h3>
              <p style={{ fontSize: '0.85rem' }}>
                Choose a conversation from the sidebar or click "Chat with Owner" on a property listing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
