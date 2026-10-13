import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Users, User, Reply, Check, CheckCheck, Plus, Search, MessageSquare } from 'lucide-react';
import { Conversation, Message, User as UserType } from '../types.ts';

interface MessagesViewProps {
  conversations: Conversation[];
  activeConversationId: string;
  messages: Message[];
  currentUser: UserType;
  onSelectConversation: (id: string) => void;
  onSendMessage: (text: string, attachmentName?: string, replyTo?: Message['replyTo']) => void;
  onOpenNewConversation?: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  activeConversationId,
  messages,
  currentUser,
  onSelectConversation,
  onSendMessage,
  onOpenNewConversation
}) => {
  const [inputText, setInputText] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [simulatedAttachment, setSimulatedAttachment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const allCurrentMessages = messages.filter(m => m.conversationId === (activeConv?.id || ''));

  const filteredMessages = chatSearch.trim()
    ? allCurrentMessages.filter(m =>
        m.text.toLowerCase().includes(chatSearch.toLowerCase()) ||
        m.senderName.toLowerCase().includes(chatSearch.toLowerCase())
      )
    : allCurrentMessages;

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(convSearch.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(convSearch.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allCurrentMessages]);

  const handleSend = () => {
    if (!inputText.trim() && !simulatedAttachment) return;
    onSendMessage(
      inputText,
      simulatedAttachment || undefined,
      replyTarget
        ? { senderName: replyTarget.senderName, text: replyTarget.text }
        : undefined
    );
    setInputText('');
    setReplyTarget(null);
    setSimulatedAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[660px]">
      {/* Channels / Conversations List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/70">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <h3 className="text-xs font-bold text-slate-800">
            Conversations
          </h3>
          <button
            onClick={onOpenNewConversation}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation search */}
        <div className="p-2 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConv?.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-white shadow-xs font-semibold border border-slate-200/80'
                    : 'hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                  style={{ backgroundColor: conv.avatarBg }}
                >
                  {conv.avatarText}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {conv.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-3.5 px-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs"
              style={{ backgroundColor: activeConv?.avatarBg || '#10b981' }}
            >
              {activeConv?.avatarText || 'HR'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {activeConv?.name || 'Department Channel'}
              </div>
              <div className="text-[10px] text-slate-500">
                {activeConv?.isGroup
                  ? `${activeConv.participantNames.length} participants (Department Group)`
                  : 'Direct LAN Communication'}
              </div>
            </div>
          </div>

          {/* Search inside active chat */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search in chat..."
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 w-44"
            />
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-2xs"
                    style={{ backgroundColor: msg.senderBg }}
                  >
                    {msg.senderInitials}
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-2xs ${
                    isMe
                      ? 'bg-[#006b3f] text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Reply preview */}
                  {msg.replyTo && (
                    <div
                      className={`mb-2 p-1.5 rounded-lg text-[10px] border-l-2 ${
                        isMe
                          ? 'bg-emerald-800/60 border-emerald-200 text-emerald-100'
                          : 'bg-slate-50 border-emerald-400 text-slate-600'
                      }`}
                    >
                      <span className="font-bold">{msg.replyTo.senderName}:</span>{' '}
                      {msg.replyTo.text}
                    </div>
                  )}

                  {!isMe && (
                    <div className="text-[10px] font-bold text-slate-500 mb-1">
                      {msg.senderName}
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Attachment if any */}
                  {msg.attachmentName && (
                    <div
                      className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-[11px] font-semibold ${
                        isMe ? 'bg-emerald-800/50 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{msg.attachmentName}</span>
                    </div>
                  )}

                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                      isMe ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timeAgo}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>

                {/* Reply trigger button */}
                <button
                  onClick={() => setReplyTarget(msg)}
                  className="opacity-0 hover:opacity-100 text-slate-400 hover:text-slate-700 self-center transition cursor-pointer"
                  title="Reply"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-400">
              {chatSearch ? 'No messages match your search' : 'No messages yet in this conversation'}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white space-y-2">
          {/* Active Reply Banner */}
          {replyTarget && (
            <div className="flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
              <span className="text-emerald-900 text-[11px]">
                Replying to <span className="font-bold">{replyTarget.senderName}</span>:{' '}
                "{replyTarget.text.slice(0, 35)}..."
              </span>
              <button
                onClick={() => setReplyTarget(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Attachment Banner */}
          {simulatedAttachment && (
            <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-800 text-[11px] flex items-center gap-1.5 font-semibold">
                <Paperclip className="w-3.5 h-3.5" /> Attached: {simulatedAttachment}
              </span>
              <button
                onClick={() => setSimulatedAttachment(null)}
                className="text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const sampleFiles = [
                  'NSSP_Posting_Validation.pdf',
                  'YLSTI_Curriculum_Schedule.docx',
                  'NYA_Staff_Welfare_Form.pdf',
                  'PSC_Promotion_Dossier_2026.pdf'
                ];
                const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
                setSimulatedAttachment(picked);
              }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeConv?.name || 'team'} (Press Enter to send)...`}
              rows={1}
              className="flex-1 bg-slate-50 focus:bg-white px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
            />

            <button
              onClick={handleSend}
              className="p-2 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
