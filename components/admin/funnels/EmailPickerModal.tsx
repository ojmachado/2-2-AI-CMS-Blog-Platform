'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Mail } from 'lucide-react';

interface EmailPickerModalProps {
  isOpen: boolean;
  initialSubject?: string;
  initialContent?: string;
  onClose: () => void;
  onSave: (subject: string, content: string) => void;
}

export const EmailPickerModal: React.FC<EmailPickerModalProps> = ({ isOpen, initialSubject, initialContent, onClose, onSave }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
        setSubject(initialSubject || '');
        setContent(initialContent || '');
    }
  }, [isOpen, initialSubject, initialContent]);

  const handleSave = () => {
      if (!subject.trim()) {
          alert("Subject is required");
          return;
      }
      onSave(subject, content);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Mail size={18} className="text-blue-600" /> Configure Email Step
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Subject</label>
                <input 
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full border-slate-300 rounded-lg text-sm px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g. Welcome to the community!"
                />
            </div>
            
            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Body (HTML Supported)</label>
                <textarea 
                    rows={10}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full border-slate-300 rounded-lg text-sm px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                    placeholder="<p>Hello {{name}},</p><p>...</p>"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                    You can use standard HTML tags. System uses 'Resend' for delivery.
                </p>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end">
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
                <Save size={16} /> Save Configuration
            </button>
        </div>
      </div>
    </div>
  );
};