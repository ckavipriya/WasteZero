import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { messageApi, userApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch contact list
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await userApi.listUsers();
        if (res.data?.success) {
          const list = (res.data.users || []).filter((u) => u._id !== user?._id);
          setContacts(list);
          if (list.length > 0) {
            setActiveContact(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load contacts', err);
      } finally {
        setLoadingContacts(false);
      }
    };
    loadUsers();
  }, [user]);

  // Load thread when activeContact changes
  useEffect(() => {
    if (!activeContact) return;
    const loadThread = async () => {
      setLoadingChat(true);
      try {
        const res = await messageApi.getThread(activeContact._id);
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load thread', err);
      } finally {
        setLoadingChat(false);
      }
    };
    loadThread();
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    setSending(true);
    const tempText = newMessage.trim();
    setNewMessage('');

    try {
      const res = await messageApi.send({
        receiverId: activeContact._id,
        content: tempText,
      });

      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      toast.error('Failed to send message');
      setNewMessage(tempText);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[75vh]">
        {/* Contact List Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Direct Messages</span>
            </h2>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {loadingContacts ? (
              <div className="p-6 text-center">
                <Spinner size="sm" className="text-emerald-600" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active contacts found.
              </div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full text-left p-3.5 flex items-center gap-3 transition ${
                    activeContact?._id === contact._id
                      ? 'bg-emerald-50 border-r-2 border-emerald-600'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {contact.name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {contact.name || contact.username}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {contact.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {contact.location || contact.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Stream & Input Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activeContact ? (
            <>
              {/* Top Contact Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {activeContact.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeContact.name}</h3>
                    <p className="text-xs text-slate-400 capitalize">Role: {activeContact.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {loadingChat ? (
                  <div className="h-full flex items-center justify-center">
                    <Spinner size="md" className="text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                    <p>No messages yet. Send a greeting to start chatting!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.content}</p>
                          <span
                            className={`text-[10px] block text-right mt-1 ${
                              isMe ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeContact.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Select a contact to open a conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
