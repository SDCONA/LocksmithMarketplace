import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, X, Image, Video, Paperclip } from "lucide-react";

interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  preview: string;
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSendMessage: (message: string, attachments?: AttachedFile[]) => void;
}

export function MessageModal({ isOpen, onClose, user, recipient, onSendMessage }: MessageModalProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newFile: AttachedFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            preview: e.target?.result as string
          };
          setAttachedFiles(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachedFiles.length === 0) || isLoading) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSendMessage(newMessage.trim() || "📎 Attachment", attachedFiles);
      setNewMessage("");
      setAttachedFiles([]);
      onClose();
      
      // Show success feedback
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={recipient.avatar} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {recipient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">Send Message</h3>
                <p className="text-sm text-gray-500">to {recipient.name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Message Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              
              {/* Attachments Preview */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Attachments:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {attachedFiles.map((file) => (
                      <div key={file.id} className="relative group">
                        {file.type === 'image' ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                            <Video className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(file.id)}
                          className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                          {file.file.name.length > 15 ? 
                            file.file.name.substring(0, 12) + '...' : 
                            file.file.name
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quick messages:</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setNewMessage("Hi! I'm interested in connecting.")}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  👋 Say Hi
                </button>
                <button 
                  onClick={() => setNewMessage("Thanks for sharing!")}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  🙏 Thank You
                </button>
                <button 
                  onClick={() => setNewMessage("Great post!")}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  👍 Great Post
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="h-8 px-2"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "image/*";
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={isLoading}
                  className="h-8 px-2"
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "video/*";
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={isLoading}
                  className="h-8 px-2"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && attachedFiles.length === 0) || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Messages will be saved in your message history
            </div>
          </div>
        </div>
      </div>
    </>
  );
}