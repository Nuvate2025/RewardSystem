import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import SignUp from "./pages/SignUp"
import Dashboard from "./pages/Dashboard"
import UserList from "./pages/UserList"
import UserProfile from "./pages/UserProfile"
import UserTransactions from "./pages/UserTransactions"
import AccountManagement from "./pages/AccountManagement"
import SecurityPreferences from "./pages/SecurityPreferences"
import SystemNotifications from "./pages/SystemNotifications"
import CouponGeneration from "./pages/CouponGeneration"
import ApprovalList from "./pages/ApprovalList"
import ApprovalDetails from "./pages/ApprovalDetails"
import CouponPreview from "./pages/CouponPreview"
import CouponExport from "./pages/CouponExport"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up" replace />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/profile/:userId" element={<UserProfile />} />
        <Route path="/users/transactions/:userId" element={<UserTransactions />} />
        <Route path="/settings" element={<AccountManagement />} />
        <Route path="/settings/security" element={<SecurityPreferences />} />
        <Route path="/settings/notifications" element={<SystemNotifications />} />
        <Route path="/coupon-generation/form" element={<CouponGeneration />} />
        <Route path="/coupon-generation/preview/:batchId" element={<CouponPreview />} />
        <Route path="/coupon-generation/export/:batchId" element={<CouponExport />} />
        <Route path="/approvals" element={<ApprovalList />} />
        <Route path="/approvals/details/:requestId" element={<ApprovalDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
