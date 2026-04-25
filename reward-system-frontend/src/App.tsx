import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import SignUp from "./pages/SignUp"
import Dashboard from "./pages/Dashboard"
import UserManagement from "./pages/UserManagement"
import RewardSystem from "./pages/RewardSystem"
import Settings from "./pages/Settings"
import CouponGeneration from "./pages/CouponGeneration"
import Approvals from "./pages/Approvals"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up" replace />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/rewards" element={<RewardSystem />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/coupons/generate" element={<CouponGeneration />} />
        <Route path="/approvals" element={<Approvals />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
