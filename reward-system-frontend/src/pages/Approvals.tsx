import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { MdArrowBack, MdInfo, MdOutlineAccountCircle, MdFlag } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

type ViewState = "list" | "details";

interface RedemptionRequest {
  id: string;
  code: string;
  points: number;
  itemName: string;
  requester: string;
  status: string;
  createdAt: string;
  flagged?: boolean;
}

interface RequestDetail extends RedemptionRequest {
  requesterInfo: {
    fullName: string;
    phone: string;
    address: string;
    userId: string;
  };
  reason?: string;
}

const Approvals = () => {
  const [view, setView] = useState<ViewState>("list");
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("HIGH_VALUE");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://127.0.0.1:3000/admin/redemptions", {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          sort: sortBy, 
          flagged: flaggedOnly,
          status: 'PROCESSING'
        }
      });
      setRequests(res.data.items);
    } catch (error) {
      console.error("FETCH REQUESTS ERROR", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, flaggedOnly]);

  const fetchRequestDetail = async (requestId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`http://127.0.0.1:3000/admin/redemptions/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedRequest(res.data);
      setView("details");
    } catch (error) {
      console.error("FETCH DETAIL ERROR", error);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`http://127.0.0.1:3000/admin/redemptions/${selectedRequest.id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (action === 'approve') {
        Swal.fire({
          title: 'Request Approved!',
          text: `Request ${selectedRequest.code} has been moved to Dispatch.`,
          icon: 'success',
          confirmButtonText: 'Return to Approval List',
          confirmButtonColor: '#F26522',
          customClass: {
            popup: 'rounded-[32px]',
            confirmButton: 'rounded-full px-10 py-4'
          }
        }).then(() => {
          setView("list");
          fetchRequests();
        });
      } else {
        Swal.fire('Rejected', 'Request has been rejected.', 'info');
        setView("list");
        fetchRequests();
      }
    } catch (error) {
      console.error("ACTION ERROR", error);
      Swal.fire('Error', `Failed to ${action} request`, 'error');
    }
  };

  useEffect(() => {
    if (view === "list") fetchRequests();
  }, [view, fetchRequests]);

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <Header title="Redemption Approval" />

        <div className="p-8 max-w-5xl mx-auto w-full">
          {/* Back Button for Detail View */}
          {view === "details" && (
            <button 
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#1E2633] mb-6 transition-colors"
            >
              <MdArrowBack />
              <span className="text-sm font-bold">Approval Request List</span>
            </button>
          )}

          {/* View: Approval Request List */}
          {view === "list" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#1E2633]">Pending Approvals</h2>
                <p className="text-gray-400 text-sm mt-1">Review and authorize high-value rewards for the loyalty program ecosystem.</p>
              </div>

              <div className="flex justify-between items-center bg-white rounded-3xl p-4 shadow-sm border border-gray-50">
                <div className="flex items-center gap-4 px-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SORT BY:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-sm font-bold text-[#1E2633] outline-none cursor-pointer"
                  >
                    <option value="HIGH_VALUE">High Value</option>
                    <option value="NEWEST">Newest First</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pr-4 border-l border-gray-100 pl-6">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flagged Requests</span>
                  <button 
                    onClick={() => setFlaggedOnly(!flaggedOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${flaggedOnly ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${flaggedOnly ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {requests.map((req) => (
                  <div 
                    key={req.id} 
                    onClick={() => fetchRequestDetail(req.id)}
                    className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-orange-50 transition-colors">
                          🎁
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.code}</p>
                          <h3 className="text-xl font-bold text-[#1E2633] mt-1">{req.itemName}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <MdOutlineAccountCircle className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{req.requester}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">{req.points.toLocaleString()} <span className="text-xs font-bold">PTS</span></p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">REWARD VALUE</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Review Pending
                      </div>
                      <span className="text-primary text-xs font-bold">Review →</span>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && !loading && (
                  <div className="p-20 text-center text-gray-400 italic bg-white rounded-[32px] border border-dashed border-gray-200">
                    No pending approval requests found.
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <button className="px-8 py-3 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm">
                  Load More Requests
                </button>
              </div>
            </div>
          )}

          {/* View: Approval Request Details */}
          {view === "details" && selectedRequest && (
            <div className="space-y-8">
              {/* Status Alert Banner */}
              <div className="bg-orange-50 rounded-[32px] p-8 border border-orange-100 flex gap-6 items-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary text-2xl shadow-sm">
                  <MdInfo />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1E2633]">Review Pending: High Value Reward</h4>
                  <p className="text-sm text-gray-500 font-medium">This request requires manual verification due to point value.</p>
                </div>
              </div>

              {/* Reward Details Card */}
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-2 h-full bg-primary opacity-20"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">REWARD DETAILS</p>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl">
                    🎁
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#1E2633]">{selectedRequest.itemName}</h3>
                    <p className="text-3xl font-black text-primary mt-1">{selectedRequest.points.toLocaleString()} <span className="text-sm font-bold">PTS</span></p>
                  </div>
                </div>
              </div>

              {/* Requester Info Card */}
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MdOutlineAccountCircle className="text-lg" /> REQUESTER INFORMATION
                  </h3>
                  <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">View Account ↗</button>
                </div>

                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FULL NAME</p>
                    <p className="text-md font-bold text-[#1E2633] mt-1">{selectedRequest.requesterInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MOBILE NUMBER</p>
                    <p className="text-md font-bold text-[#1E2633] mt-1">{selectedRequest.requesterInfo.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DELIVERY ADDRESS</p>
                    <p className="text-md font-bold text-[#1E2633] mt-1 leading-relaxed">{selectedRequest.requesterInfo.address}</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50 flex justify-center">
                  <button className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">
                    <MdFlag /> Flag this Account
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-6 pt-4">
                <button 
                  onClick={() => handleAction('approve')}
                  className="flex-1 bg-primary text-white py-5 rounded-full font-bold text-md shadow-xl shadow-primary/20 hover:bg-[#D9541E] transition-all"
                >
                  Approve & Dispatch
                </button>
                <button 
                  onClick={() => handleAction('reject')}
                  className="flex-1 bg-white border-2 border-gray-100 text-gray-400 py-5 rounded-full font-bold text-md hover:bg-gray-50 transition-all"
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approvals;
