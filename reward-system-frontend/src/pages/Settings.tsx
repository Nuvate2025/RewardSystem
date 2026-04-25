import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { MdArrowBack, MdSecurity, MdNotifications, MdChevronRight, MdLogout } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

type ViewState = "profile" | "security" | "notifications";

interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface AdminPreferences {
  quickLoginPinEnabled: boolean;
  highValueAlertsEnabled: boolean;
}

const Settings = () => {
  const [view, setView] = useState<ViewState>("profile");
  const [profile, setProfile] = useState<AdminProfile>({
    fullName: "Jamie Barnes",
    email: "jamie.barnes@bestbonds.com",
    phone: "+1 202-555-0156",
    role: "SUPER ADMIN"
  });
  const [preferences, setPreferences] = useState<AdminPreferences>({
    quickLoginPinEnabled: true,
    highValueAlertsEnabled: true
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("http://127.0.0.1:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setProfile({
            fullName: res.data.fullName || "Admin",
            email: res.data.email || "admin@bestbonds.com",
            phone: res.data.phone || "Not provided",
            role: "SUPER ADMIN"
          });
        }
      } catch (error) {
        console.error("FETCH PROFILE ERROR", error);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      return Swal.fire("Error", "Passwords do not match", "error");
    }
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Swal.fire("Success", "Password updated successfully", "success");
      setPasswords({ current: "", new: "", confirm: "" });
      setView("profile");
    } catch (error) {
      console.error("PASSWORD UPDATE ERROR", error);
      Swal.fire("Error", "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/sign-up");
  };

  const togglePreference = (key: keyof AdminPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    // In a real app, call API here to persist
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <Header title="Account Management" />

        <div className="p-8 max-w-4xl mx-auto w-full">
          {/* Back Button */}
          {view !== "profile" && (
            <button 
              onClick={() => setView("profile")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#1E2633] mb-6 transition-colors"
            >
              <MdArrowBack />
              <span className="text-sm font-bold">
                {view === "security" ? "Security & Preferences" : "System Notifications"}
              </span>
            </button>
          )}

          {/* View: Main Profile */}
          {view === "profile" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-white rounded-[32px] p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName}&background=1E2633&color=fff&size=256`} 
                    alt="Admin" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#1E2633]">{profile.fullName}</h2>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase mt-1">{profile.role}</p>
                </div>
                <div className="flex flex-col gap-1 text-gray-400 font-medium text-sm">
                  <p>{profile.phone}</p>
                  <p>{profile.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setView("security")}
                  className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                      <MdSecurity className="text-2xl" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-md font-bold text-[#1E2633]">Security & Preferences</h4>
                      <p className="text-xs text-gray-400 font-medium">Manage authentication settings</p>
                    </div>
                  </div>
                  <MdChevronRight className="text-2xl text-gray-300 group-hover:text-primary transition-colors" />
                </button>

                <button 
                  onClick={() => setView("notifications")}
                  className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                      <MdNotifications className="text-2xl" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-md font-bold text-[#1E2633]">System Notifications</h4>
                      <p className="text-xs text-gray-400 font-medium">Manage real-time alert protocols</p>
                    </div>
                  </div>
                  <MdChevronRight className="text-2xl text-gray-300 group-hover:text-primary transition-colors" />
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-8 py-3 bg-orange-50 text-primary rounded-full font-bold text-sm hover:bg-orange-100 transition-all"
                >
                  <MdLogout /> Log Out
                </button>
              </div>
            </div>
          )}

          {/* View: Security & Preferences */}
          {view === "security" && (
            <div className="space-y-12 animate-in slide-in-from-right duration-500">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-[#1E2633]">Authentication</h2>
                  <p className="text-gray-400 text-sm mt-1">Update your access credentials regularly to maintain high-integrity security protocols for your account.</p>
                </div>

                <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 space-y-6">
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                      <input 
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-6 py-4 text-[#1E2633] outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                      <input 
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-6 py-4 text-[#1E2633] outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input 
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-6 py-4 text-[#1E2633] outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="pt-4">
                      <button 
                        onClick={handleUpdatePassword}
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:bg-[#D9541E] transition-all"
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[#1E2633]">Efficiency</h3>
                  <p className="text-gray-400 text-sm mt-1">Streamline your workflow with optimized account accessibility settings.</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-bold text-[#1E2633]">Quick Login PIN</h4>
                    <p className="text-xs text-gray-400 font-medium">Enable 4-digit PIN for faster authentication</p>
                  </div>
                  <button 
                    onClick={() => togglePreference("quickLoginPinEnabled")}
                    className={`w-12 h-6 rounded-full transition-colors relative ${preferences.quickLoginPinEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${preferences.quickLoginPinEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View: System Notifications */}
          {view === "notifications" && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div>
                <h2 className="text-3xl font-black text-[#1E2633]">Alert Protocols</h2>
                <p className="text-gray-400 text-sm mt-1">Configure high-priority system signal thresholds to maintain real-time oversight of critical activities.</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">PUSH ALERTS</p>
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                      <MdNotifications className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-md font-bold text-[#1E2633]">High-Value Redemptions</h4>
                      <p className="text-xs text-gray-400 font-medium">Threshold: {">"} 50,000 Pts</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => togglePreference("highValueAlertsEnabled")}
                    className={`w-14 h-7 rounded-full transition-colors relative ${preferences.highValueAlertsEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${preferences.highValueAlertsEnabled ? 'left-8' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
