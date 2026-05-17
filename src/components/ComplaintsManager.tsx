import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, User, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface Complaint {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: any;
}

const ComplaintsManager: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Complaint[];
      setComplaints(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching complaints:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await deleteDoc(doc(db, 'complaints', id));
      } catch (error) {
        console.error("Error deleting complaint:", error);
        alert("Failed to delete complaint.");
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <AlertCircle className="text-red-500" /> Complaints Log
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Manage Customer Messages</p>
        </div>
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100">
          Total: {complaints.length}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest uppercase w-16">SL</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest uppercase">Contact details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest uppercase max-w-md">Complaint Message</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest uppercase">Date submitted</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint, idx) => (
                  <tr key={complaint.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-black">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <User size={14} className="text-gray-400" />
                          {complaint.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Phone size={14} className="text-gray-400" />
                          {complaint.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex items-start gap-2">
                        <MessageSquare size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 font-medium whitespace-pre-wrap">
                          {complaint.message}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100/50 px-3 py-1.5 rounded-lg inline-flex">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(complaint.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(complaint.id)}
                        className="p-3 text-red-500 hover:bg-red-50 hover:text-red-600 hover:shadow-md hover:-translate-y-0.5 rounded-xl transition-all border border-red-50 hover:border-red-100 bg-white"
                        title="Delete complaint"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsManager;
