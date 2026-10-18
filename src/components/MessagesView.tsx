import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Users, User, Reply, Check, CheckCheck, Plus, Search, MessageSquare, Download, FileText, X } from 'lucide-react';
import { Conversation, Message, User as UserType } from '../types.ts';

interface MessagesViewProps {
  conversations: Conversation[];
  activeConversationId: string;
  messages: Message[];
  currentUser: UserType;
  onSelectConversation: (id: string) => void;
  onSendMessage: (payload: FormData | { text: string; attachmentName?: string; replyTo?: Message['replyTo'] }) => void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; size?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const allCurrentMessages = messages.filter(m => m.conversationId === (activeConv?.id || ''));

  const filteredMessages = chatSearch.trim()
    ? allCurrentMessages.filter(m =>
        m.text.toLowerCase().includes(chatSearch.toLowerCase()) ||
        m.senderName.toLowerCase().includes(chatSearch.toLowerCase()) ||
        (m.attachmentName && m.attachmentName.toLowerCase().includes(chatSearch.toLowerCase()))
      )
    : allCurrentMessages;

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(convSearch.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(convSearch.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allCurrentMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const formattedSize = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      setSelectedAttachment({ name: file.name, size: formattedSize });
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !selectedAttachment && !selectedFile) return;

    const attachmentName = selectedAttachment ? selectedAttachment.name : undefined;
    const textToSend = inputText.trim() || (attachmentName ? `📎 Attachment: ${attachmentName}` : '');

    if (selectedFile) {
      const formData = new FormData();
      formData.append('text', textToSend);
      formData.append('attachment', selectedFile);
      if (replyTarget) {
        formData.append('replyTo', JSON.stringify({ senderName: replyTarget.senderName, text: replyTarget.text }));
      }
      onSendMessage(formData);
    } else {
      onSendMessage({
        text: textToSend,
        attachmentName,
        replyTo: replyTarget
          ? { senderName: replyTarget.senderName, text: replyTarget.text }
          : undefined
      });
    }

    setInputText('');
    setReplyTarget(null);
    setSelectedFile(null);
    setSelectedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-liquid-window rounded-2xl overflow-hidden flex flex-col md:flex-row h-[720px] text-black select-none border border-white/80 shadow-[0_12px_32px_rgba(15,23,42,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
      {/* Channels / Conversations List */}
      <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col bg-white/40 backdrop-blur-xl">
        <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/50">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider">
            Conversations
          </h3>
          <button
            onClick={onOpenNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation search */}
        <div className="p-2.5 border-b border-slate-200/80 bg-white/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7738FF]" />
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/70 focus:bg-white text-black placeholder-slate-400 rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConv?.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left cursor-pointer border ${
                  isActive
                    ? 'glass-liquid-nav-active font-bold scale-[1.01]'
                    : 'bg-transparent border-transparent hover:bg-white/80 text-black'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold shrink-0 shadow-xs ring-1 ring-white/20"
                  style={{ backgroundColor: conv.avatarBg || '#7738FF' }}
                >
                  {conv.avatarText}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold truncate ${isActive ? 'text-black' : 'text-black'}`}>
                      {conv.name}
                    </span>
                    <span className={`text-[10px] font-mono ${isActive ? 'text-black' : 'text-black'}`}>
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-[11px] truncate flex-1 pr-1 ${isActive ? 'text-black' : 'text-black'}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#7738FF] text-black font-bold text-[9px] rounded-full shrink-0 shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center py-8 text-xs text-black">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-md">
        {/* Chat Header */}
        <div className="p-3.5 px-5 border-b border-slate-200/80 flex items-center justify-between bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold shadow-xs ring-1 ring-white/20"
              style={{ backgroundColor: activeConv?.avatarBg || '#7738FF' }}
            >
              {activeConv?.avatarText || 'HR'}
            </div>
            <div>
              <div className="text-xs font-bold text-black">
                {activeConv?.name || 'Department Channel'}
              </div>
              <div className="text-[10px] text-[#7738FF] font-medium">
                {activeConv?.isGroup
                  ? `${activeConv.participantNames.length} participants (Department Group)`
                  : 'Direct Local LAN Channel'}
              </div>
            </div>
          </div>

          {/* Search inside active chat */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7738FF]" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search in chat..."
              className="pl-8 pr-3 py-1 text-xs bg-white/70 focus:bg-white text-black placeholder-slate-400 rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none w-48 transition"
            />
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-black text-[10px] font-bold shrink-0 mt-0.5 shadow-xs ring-1 ring-white/20"
                    style={{ backgroundColor: msg.senderBg || '#7738FF' }}
                  >
                    {msg.senderInitials}
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-[#7738FF] to-[#9A75FF] text-black rounded-tr-xs shadow-md border border-white/20'
                      : 'bg-white/85 backdrop-blur-md border border-white/90 text-black shadow-xs rounded-tl-xs shadow-xs'
                  }`}
                >
                  {/* Reply preview */}
                  {msg.replyTo && (
                    <div
                      className={`mb-2 p-1.5 rounded-lg text-[10px] border-l-2 ${
                        isMe
                          ? 'bg-white/20 border-violet-200 text-black'
                          : 'bg-slate-100 border-[#7738FF] text-[#7738FF]'
                      }`}
                    >
                      <span className="font-bold">{msg.replyTo.senderName}:</span>{' '}
                      {msg.replyTo.text}
                    </div>
                  )}

                  {!isMe && (
                    <div className="text-[10px] font-bold text-[#7738FF] mb-1">
                      {msg.senderName}
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Attachment if any */}
                  {msg.attachmentName && (
                    <div
                      className={`mt-2.5 p-2.5 rounded-xl flex items-center justify-between gap-3 text-[11px] font-semibold border ${
                        isMe
                          ? 'bg-white/20 text-black border-white/30'
                          : 'bg-white/80 text-black border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className={`w-4 h-4 shrink-0 ${isMe ? 'text-black' : 'text-[#7738FF]'}`} />
                        <span className="truncate font-medium">{msg.attachmentName}</span>
                      </div>
                      <a
                        href={`/api/messages/${msg.id}/download`}
                        download={msg.attachmentName}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shrink-0 cursor-pointer bg-[#7738FF] hover:bg-[#8B5CF6] text-black shadow-xs"
                        title="Download Attached File"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                      isMe ? 'text-violet-200' : 'text-black'
                    }`}
                  >
                    <span className="font-mono">{msg.timeAgo}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-violet-200" />}
                  </div>
                </div>

                {/* Reply trigger button */}
                <button
                  onClick={() => setReplyTarget(msg)}
                  className="opacity-0 hover:opacity-100 text-black hover:text-black self-center transition cursor-pointer p-1"
                  title="Reply"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-xs text-black">
              {chatSearch ? 'No messages match your search' : 'No messages yet in this conversation'}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200/80 bg-white/40 backdrop-blur-md space-y-2">
          {/* Active Reply Banner */}
          {replyTarget && (
            <div className="flex items-center justify-between bg-[#7738FF]/20 px-3 py-1.5 rounded-xl border border-[#7738FF]/40 text-xs">
              <span className="text-[#7738FF] text-[11px]">
                Replying to <span className="font-bold text-black">{replyTarget.senderName}</span>:{' '}
                "{replyTarget.text.slice(0, 35)}..."
              </span>
              <button
                onClick={() => setReplyTarget(null)}
                className="text-[#7738FF] hover:text-black font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Attachment Banner */}
          {selectedAttachment && (
            <div className="flex items-center justify-between bg-[#7738FF]/20 px-3 py-1.5 rounded-xl border border-[#7738FF]/40 text-xs">
              <span className="text-[#7738FF] text-[11px] flex items-center gap-1.5 font-semibold truncate">
                <Paperclip className="w-3.5 h-3.5 text-[#7738FF] shrink-0" />
                <span className="truncate">Attached: {selectedAttachment.name}</span>
                {selectedAttachment.size && (
                  <span className="text-[10px] text-[#7738FF] bg-violet-100 px-1.5 py-0.5 rounded font-normal font-mono">
                    {selectedAttachment.size}
                  </span>
                )}
              </span>
              <button
                onClick={() => {
                  setSelectedAttachment(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-[#7738FF] hover:text-black font-bold text-xs cursor-pointer ml-2"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-xl transition cursor-pointer border ${
                selectedAttachment
                  ? 'bg-[#7738FF]/25 text-[#7738FF] border-[#7738FF]/50'
                  : 'text-black hover:text-black hover:bg-white/80 border-transparent'
              }`}
              title="Attach File from Device"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Send message to ${activeConv?.name || 'recipient'}...`}
              rows={1}
              className="flex-1 bg-white/70 focus:bg-white text-black placeholder-slate-700 font-medium px-4 py-2 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none resize-none transition"
            />

            <button
              type="button"
              onClick={handleSend}
              className="p-2.5 glass-liquid-cta rounded-xl text-black shadow-xs border border-white/30 transition cursor-pointer"
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
