import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { MdOutlineAccountCircle, MdFlag, MdInfo } from "react-icons/md";
import axios from "axios";

interface RequestDetail {
  id: string;
  code: string;
  points: number;
  itemName: string;
  requester: string;
  status: string;
  createdAt: string;
  requesterInfo: {
    fullName: string;
    phone: string;
    address: string;
    userId: string;
  };
}

const ApprovalDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/redemptions/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequest(res.data);
      } catch (error) {
        console.error("FETCH DETAIL ERROR", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestDetail();
  }, [requestId]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!request) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/redemptions/${request.id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (action === 'approve') {
        setShowSuccessModal(true);
      } else {
        navigate('/approvals');
      }
    } catch (error) {
      console.error("ACTION ERROR", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2633]"></div>
        </div>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <Header title="Redemption Approval" />

        <div className="p-8 max-w-5xl mx-auto w-full">
          <div className="space-y-8">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/approvals')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#1E2633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-xl font-bold text-[#1E2633]">Approval Request Details</h1>
            </div>

            {/* Status Alert Banner */}
            <div className="bg-[#FFF8F3] rounded-[40px] p-10 border border-[#FFE7D6] flex gap-8 items-center shadow-sm">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#F26522] text-3xl shadow-sm border border-[#FFE7D6]">
                <MdInfo />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#1E2633]">Status: Pending High-Ticket Review</h4>
                <p className="text-md text-gray-500 font-medium mt-1">This request requires manual verification due to item value.</p>
              </div>
            </div>

            {/* Reward Details Card */}
            <div className="bg-white rounded-[40px] p-12 shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute left-0 top-0 w-2 h-full bg-[#F26522] opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 ml-2">REWARD DETAILS</p>
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-5xl shadow-inner border border-gray-50 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${request.itemName}&background=random&color=fff`} alt="" className="w-full h-full object-cover opacity-90" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-[#1E2633] tracking-tight">{request.itemName}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-[#F26522] tracking-tighter">{request.points.toLocaleString()}</span>
                    <span className="text-lg font-bold text-[#F26522] uppercase">PTS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requester Info Card */}
            <div className="bg-[#F8F9FA]/50 rounded-[40px] p-10 shadow-sm border border-gray-100 space-y-10">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <MdOutlineAccountCircle className="text-xl" /> REQUESTER INFORMATION
                </h3>
                <button 
                  onClick={() => navigate(`/users/profile/${request.requesterInfo.userId}`)}
                  className="text-[#F26522] text-[10px] font-bold uppercase tracking-[0.2em] hover:underline flex items-center gap-2 group"
                >
                  View Account 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11M15 3H21M21 3V9M21 3L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="bg-white rounded-[32px] p-10 border border-gray-50 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">FULL NAME</p>
                  <p className="text-xl font-bold text-[#1E2633]">{request.requesterInfo.fullName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">MOBILE NUMBER</p>
                  <p className="text-xl font-bold text-[#1E2633] tracking-wide">{request.requesterInfo.phone}</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">ADDRESS</p>
                  <p className="text-xl font-bold text-[#1E2633] leading-relaxed max-w-3xl">
                    {request.requesterInfo.address}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button className="flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-50 px-6 py-3 rounded-full transition-all">
                  <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center">
                    <MdFlag className="text-sm" />
                  </div>
                  Flag the Account
                </button>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-6 pt-4 pb-12">
              <button 
                onClick={() => handleAction('approve')}
                disabled={isProcessing}
                className="flex-1 bg-[#F26522] text-white py-6 rounded-[28px] font-bold text-lg shadow-2xl shadow-[#F26522]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Approve & Dispatch"
                )}
              </button>
              <button 
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                className="flex-1 bg-white border-2 border-gray-100 text-gray-400 py-6 rounded-[28px] font-bold text-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1E2633]/60 backdrop-blur-md animate-in fade-in duration-300"></div>
          <div className="relative bg-white rounded-[48px] p-12 w-full max-w-md shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-10 shadow-inner">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#A73A00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h2 className="text-4xl font-black text-[#1E2633] mb-4 tracking-tight">Request Approved!</h2>
            <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10 px-4">
              Request <span className="text-[#1E2633] font-bold">#{request.code}</span> has been moved to dispatch
            </p>
            
            <button 
              onClick={() => navigate('/approvals')}
              className="w-full bg-gray-50 border border-gray-100 text-[#1E2633] py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-sm"
            >
              Return to Approval List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalDetails;
