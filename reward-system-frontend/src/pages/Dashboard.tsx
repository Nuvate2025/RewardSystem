import Sidebar from "../components/layout/Sidebar"
import Header from "../components/layout/Header"

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <Header title="Dashboard" />
        
        <div className="p-8 max-w-6xl mx-auto w-full space-y-10">
          {/* Greeting Section */}
          <div>
            <h2 className="text-3xl font-bold text-[#1E2633]">
              Good Morning, <span className="text-[#1E2633]">Admin</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              System status: <span className="text-gray-400">All services operational.</span>
            </p>
          </div>

          {/* Pending Approvals Card */}
          <div className="relative bg-white rounded-[32px] p-10 overflow-hidden shadow-sm border border-gray-100">
            {/* Background Wavy Decoration */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 pointer-events-none">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <path 
                  d="M0,100 C50,150 150,50 200,100 C250,150 350,50 400,100" 
                  fill="none" 
                  stroke="#F26522" 
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ACTION QUEUE</span>
                  <h3 className="text-3xl font-bold text-[#1E2633] mt-2">Pending Approvals</h3>
                  <p className="text-gray-500 text-sm mt-1">Requires validation for high-value reward redemptions</p>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-[#1E2633]">4</span>
                  <span className="text-xl font-bold text-gray-400">requests</span>
                </div>
              </div>

              <button className="bg-[#F26522] hover:bg-[#D9541E] text-white px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#F26522]/20">
                Request Queue
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-400">Key Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Total Points Issued */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">
                  📝
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL POINTS ISSUED</p>
                  <p className="text-4xl font-black text-[#1E2633] mt-2">1,284,000</p>
                </div>
                <div className="flex items-center gap-2 text-[#27AE60] text-sm font-bold">
                  <span>📈</span>
                  <span>+12.4% increase in last week</span>
                </div>
              </div>

              {/* Points Redeemed */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">
                  🛒
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">POINTS REDEEMED</p>
                  <p className="text-4xl font-black text-[#1E2633] mt-2">856,200</p>
                </div>
                <div className="flex items-center gap-2 text-[#27AE60] text-sm font-bold">
                  <span>📈</span>
                  <span>+8.2% increase in last week</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Engagement Metrics */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-400">User Engagement Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              {/* Total Active Users */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[320px]">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">REAL-TIME</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL ACTIVE USERS</p>
                  <p className="text-5xl font-black text-[#1E2633] mt-2">856,200</p>
                </div>
                {/* Simple Bar Chart Mockup */}
                <div className="flex items-end gap-1.5 h-16 mt-4">
                  {[30, 45, 60, 40, 80].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 rounded-t-lg bg-[#F26522]" 
                      style={{ height: `${h}%`, opacity: (i + 1) / 5 }}
                    />
                  ))}
                </div>
              </div>

              {/* Coupons Scanned Today */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[320px]">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                    🔳
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">DAILY TOTAL</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COUPONS SCANNED TODAY</p>
                  <p className="text-5xl font-black text-[#1E2633] mt-2">4,212</p>
                </div>
                
                {/* Recent Activity Footer */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <img 
                          key={i}
                          src={`https://ui-avatars.com/api/?name=User${i}&background=random`} 
                          className="w-8 h-8 rounded-full border-2 border-white"
                          alt="user"
                        />
                      ))}
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                        +8
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 leading-tight">Last 5 min<br/>activity</span>
                  </div>
                  <span className="text-[#F26522] text-xl font-bold">↗</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
