import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ContactMessage } from '../../types';
import { Mail, Check, Archive, X } from 'lucide-react';

export const AdminContactMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      const data = await apiRequest<ContactMessage[]>('/contact');
      setMessages(data);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id: string, status: 'READ' | 'ARCHIVED') => {
    try {
      await apiRequest<ContactMessage>(`/contact/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update message');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
          Public Inquiries
        </span>
        <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
          Contact Messages & Inquiries
        </h1>
        <p className="text-xs text-stone-500 font-editorial">
          Inquiries submitted via the public church website contact page.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Sender Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Loading messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    No contact messages in inbox.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-stone-500">
                      {msg.createdAt.split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                      {msg.name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {msg.email}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-stone-800 font-medium">
                      {msg.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        msg.status === 'NEW'
                          ? 'bg-amber-100 text-amber-800'
                          : msg.status === 'READ'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs font-semibold cursor-pointer"
                      >
                        Read
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {selectedMessage.subject}
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div><strong>From:</strong> {selectedMessage.name} &lt;{selectedMessage.email}&gt;</div>
              {selectedMessage.phone && <div><strong>Phone:</strong> {selectedMessage.phone}</div>}
              <div><strong>Date:</strong> {selectedMessage.createdAt}</div>
            </div>

            <div className="p-4 bg-white border border-stone-100 rounded-xl font-editorial text-sm text-stone-800 whitespace-pre-line leading-relaxed">
              {selectedMessage.message}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(selectedMessage.id, 'READ')}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => updateStatus(selectedMessage.id, 'ARCHIVED')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Archive
                </button>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
