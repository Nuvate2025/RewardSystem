import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { MdSearch, MdArrowBack, MdBlock, MdHistory, MdPerson } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

type ViewState = "list" | "profile" | "transactions";

interface User {
  id: string;
  fullName: string;
  profession: string;
  loyaltyPoints: number;
  phone: string;
  email: string;
  deliveryAddress: string;
  isActive: boolean;
  memberSinceYear: number;
}

interface Transaction {
  id: string;
  title: string;
  points: number;
  type: string;
  createdAt: string;
}

const UserManagement = () => {
  const [view, setView] = useState<ViewState>("list");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [professionFilter, setProfessionFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://127.0.0.1:3000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: searchTerm, profession: professionFilter === "all" ? undefined : professionFilter }
      });
      setUsers(res.data.items);
    } catch (error) {
      console.error("FETCH USERS ERROR", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, professionFilter]);

  const fetchUserDetail = async (userId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`http://127.0.0.1:3000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(res.data);
      setView("profile");
    } catch (error) {
      console.error("FETCH USER DETAIL ERROR", error);
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`http://127.0.0.1:3000/admin/users/${userId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data.transactions);
      setView("transactions");
    } catch (error) {
      console.error("FETCH TRANSACTIONS ERROR", error);
    }
  };

  const handleSuspend = async (userId: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Suspend this Account?',
      input: 'textarea',
      inputLabel: 'REASON FOR SUSPENSION',
      inputPlaceholder: 'Enter your reason for suspension...',
      showCancelButton: true,
      confirmButtonText: 'Confirm Suspension',
      confirmButtonColor: '#F26522',
      cancelButtonText: 'No, Go Back',
      customClass: {
        container: 'rounded-[32px]',
        popup: 'rounded-[32px]',
        confirmButton: 'rounded-full px-8 py-3',
        cancelButton: 'rounded-full px-8 py-3'
      }
    });

    if (reason) {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.post(`http://127.0.0.1:3000/admin/users/${userId}/suspend`, { reason }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Suspended!', 'User account has been suspended.', 'success');
        fetchUserDetail(userId);
      } catch (error) {
        console.error("SUSPEND ERROR", error);
        Swal.fire('Error', 'Failed to suspend account', 'error');
      }
    }
  };

  useEffect(() => {
    if (view === "list") fetchUsers();
  }, [view, fetchUsers]);

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <Header title="User Management" />

        <div className="p-8 max-w-6xl mx-auto w-full">
          {/* Back Button for Detail Views */}
          {view !== "list" && (
            <button 
              onClick={() => setView(view === "transactions" ? "profile" : "list")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#1E2633] mb-6 transition-colors"
            >
              <MdArrowBack />
              <span className="text-sm font-bold">{view === "transactions" ? "User Profile" : "User Management"}</span>
            </button>
          )}

          {/* View: User List */}
          {view === "list" && (
            <div className="space-y-6">
              <div className="relative">
                <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input 
                  type="text"
                  placeholder="Search by Name or Mobile Number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white rounded-full py-4 pl-14 pr-6 shadow-sm border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2">
                {["all", "Engineer", "Builder", "Mason", "Architect"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setProfessionFilter(p)}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      professionFilter === p ? "bg-[#1E2633] text-white" : "bg-white text-gray-400 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                <div className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      onClick={() => fetchUserDetail(user.id)}
                      className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} alt={user.fullName} />
                        </div>
                        <div>
                          <p className="text-md font-bold text-[#1E2633]">{user.fullName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.profession}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary">{user.loyaltyPoints.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">WALLET BALANCE</p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && !loading && (
                    <div className="p-20 text-center text-gray-400 italic">No users found matching your criteria.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* View: User Profile */}
          {view === "profile" && selectedUser && (
            <div className="space-y-8">
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-3xl overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=random`} alt={selectedUser.fullName} className="w-full h-full" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#1E2633]">{selectedUser.fullName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs font-bold text-green-500 uppercase tracking-widest">{selectedUser.isActive ? "ACCOUNT ACTIVE" : "SUSPENDED"}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleSuspend(selectedUser.id)}
                  className="p-4 bg-orange-50 text-primary rounded-2xl hover:bg-orange-100 transition-colors"
                >
                  <MdBlock className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[240px] relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-8 opacity-10">
                    <MdPerson className="text-8xl" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CURRENT WALLET BALANCE</p>
                    <p className="text-5xl font-black text-[#1E2633]">{selectedUser.loyaltyPoints.toLocaleString()} <span className="text-xl font-bold text-gray-400 uppercase">PTS</span></p>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Member Since {selectedUser.memberSinceYear}</p>
                </div>

                <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 space-y-6">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MdPerson /> User Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MOBILE NUMBER</p>
                      <p className="text-md font-bold text-[#1E2633]">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OFFICE ADDRESS</p>
                      <p className="text-md font-bold text-[#1E2633] leading-relaxed">{selectedUser.deliveryAddress || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button 
                      onClick={() => fetchTransactions(selectedUser.id)}
                      className="flex-1 bg-primary text-white py-4 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:bg-[#D9541E] transition-all"
                    >
                      View Transaction Ledger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View: Transactions */}
          {view === "transactions" && selectedUser && (
            <div className="space-y-8">
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=random`} alt={selectedUser.fullName} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1E2633]">{selectedUser.fullName}</h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">ACCOUNT ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E2633] rounded-[32px] p-10 shadow-lg text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 p-10 opacity-10">
                  <MdHistory className="text-9xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL POINTS BALANCE</p>
                  <p className="text-6xl font-black">{selectedUser.loyaltyPoints.toLocaleString()}</p>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <MdHistory className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{transactions.length}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">MONTHLY SCANS</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#1E2633]">Recent Transactions</h3>
                  <div className="flex gap-2">
                    <button className="bg-white px-4 py-2 rounded-full text-[10px] font-bold text-gray-400 shadow-sm">FILTER: THIS MONTH</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">
                          {tx.points > 0 ? "➕" : "➖"}
                        </div>
                        <div>
                          <p className="text-md font-bold text-[#1E2633]">{tx.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-black ${tx.points > 0 ? "text-green-500" : "text-primary"}`}>
                        {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="bg-white rounded-[24px] p-20 text-center text-gray-400 italic">No transactions found for this period.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
