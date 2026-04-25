import { useState } from "react"
import Sidebar from "../components/layout/Sidebar"
import Header from "../components/layout/Header"

const RewardSystem = () => {
  const [rewards] = useState([
    {
      id: 1,
      name: "Performance Bonus",
      description: "Monthly performance achievement reward",
      points: 500,
      category: "Performance",
      totalClaimed: 1240,
      active: true,
    },
    {
      id: 2,
      name: "Attendance Badge",
      description: "Perfect attendance for a month",
      points: 100,
      category: "Attendance",
      totalClaimed: 2450,
      active: true,
    },
    {
      id: 3,
      name: "Team Collaboration",
      description: "Outstanding team contribution",
      points: 250,
      category: "Collaboration",
      totalClaimed: 890,
      active: true,
    },
    {
      id: 4,
      name: "Innovation Award",
      description: "Creative solution implementation",
      points: 750,
      category: "Innovation",
      totalClaimed: 340,
      active: false,
    },
  ])

  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex h-screen bg-bg-offwhite">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Rewards System" />
        <div className="p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-bg-white p-4 rounded-xl border border-border">
              <p className="text-text-muted text-xs uppercase font-semibold mb-2">Total Rewards</p>
              <p className="text-2xl font-bold text-text-primary">{rewards.length}</p>
            </div>
            <div className="bg-bg-white p-4 rounded-xl border border-border">
              <p className="text-text-muted text-xs uppercase font-semibold mb-2">Active Rewards</p>
              <p className="text-2xl font-bold text-brand-orange">{rewards.filter((r) => r.active).length}</p>
            </div>
            <div className="bg-bg-white p-4 rounded-xl border border-border">
              <p className="text-text-muted text-xs uppercase font-semibold mb-2">Total Claimed</p>
              <p className="text-2xl font-bold text-green-600">{rewards.reduce((acc, r) => acc + r.totalClaimed, 0)}</p>
            </div>
            <div className="bg-bg-white p-4 rounded-xl border border-border">
              <p className="text-text-muted text-xs uppercase font-semibold mb-2">Avg Points</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(rewards.reduce((acc, r) => acc + r.points, 0) / rewards.length)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors"
            >
              + Create Reward
            </button>
            <button className="px-6 py-3 border border-border text-text-secondary rounded-lg font-semibold hover:bg-bg-white transition-colors">
              📊 Export Report
            </button>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-bg-white p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🎁</span>
                      <h3 className="text-lg font-bold text-text-primary">{reward.name}</h3>
                    </div>
                    <p className="text-sm text-text-secondary">{reward.description}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      reward.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {reward.active ? "🟢 Active" : "⚪ Inactive"}
                  </span>
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Points</span>
                    <span className="font-bold text-text-primary">{reward.points} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Category</span>
                    <span className="font-semibold text-text-primary">{reward.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Total Claimed</span>
                    <span className="font-bold text-brand-orange">{reward.totalClaimed}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-muted font-semibold">Claim Progress</span>
                    <span className="text-xs text-text-primary font-bold">
                      {Math.round((reward.totalClaimed / 3000) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-bg-offwhite rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-brand-orange to-brand-orange-dark h-2 rounded-full transition-all"
                      style={{ width: `${(reward.totalClaimed / 3000) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg font-semibold hover:bg-bg-offwhite transition-colors text-sm">
                    ✏️ Edit
                  </button>
                  <button className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg font-semibold hover:bg-bg-offwhite transition-colors text-sm">
                    👁️ View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Create New Reward</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Reward Name</label>
                <input
                  type="text"
                  placeholder="Enter reward name"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-brand-orange"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Points</label>
                <input
                  type="number"
                  placeholder="Enter points"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-brand-orange"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Category</label>
                <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-brand-orange">
                  <option>Performance</option>
                  <option>Attendance</option>
                  <option>Collaboration</option>
                  <option>Innovation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Description</label>
                <textarea
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg font-semibold hover:bg-bg-offwhite transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RewardSystem
