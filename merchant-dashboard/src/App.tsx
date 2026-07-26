import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PATHS } from "./router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import Login from "./pages/Login";
import DashboardHome from "./pages/DashboardHome";
import GuestList from "./pages/Guests/GuestList";
import GuestProfile from "./pages/Guests/GuestProfile";
import OutletList from "./pages/Outlets/OutletList";
import OutletDetail from "./pages/Outlets/OutletDetail";
import RewardList from "./pages/Rewards/RewardList";
import RewardForm from "./pages/Rewards/RewardForm";
import TierList from "./pages/Memberships/TierList";
import TierForm from "./pages/Memberships/TierForm";
import CampaignList from "./pages/Campaigns/CampaignList";
import CampaignForm from "./pages/Campaigns/CampaignForm";
import MessageLog from "./pages/Messages/MessageLog";
import ReviewList from "./pages/Reviews/ReviewList";
import ReferralSettingsPage from "./pages/Referrals/ReferralSettings";
import StaffList from "./pages/Staff/StaffList";
import MerchantSettings from "./pages/Settings/MerchantSettings";

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function protect(children: ReactNode) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<Login />} />

      <Route path={PATHS.dashboard} element={protect(<DashboardHome />)} />
      <Route path={PATHS.guests} element={protect(<GuestList />)} />
      <Route path={PATHS.guestDetail()} element={protect(<GuestProfile />)} />
      <Route path={PATHS.outlets} element={protect(<OutletList />)} />
      <Route path={PATHS.outletDetail()} element={protect(<OutletDetail />)} />
      <Route path={PATHS.rewards} element={protect(<RewardList />)} />
      <Route path={PATHS.rewardNew} element={protect(<RewardForm />)} />
      <Route path={PATHS.rewardEdit()} element={protect(<RewardForm />)} />
      <Route path={PATHS.memberships} element={protect(<TierList />)} />
      <Route path={PATHS.membershipNew} element={protect(<TierForm />)} />
      <Route path={PATHS.membershipEdit()} element={protect(<TierForm />)} />
      <Route path={PATHS.campaigns} element={protect(<CampaignList />)} />
      <Route path={PATHS.campaignNew} element={protect(<CampaignForm />)} />
      <Route path={PATHS.campaignEdit()} element={protect(<CampaignForm />)} />
      <Route path={PATHS.messages} element={protect(<MessageLog />)} />
      <Route path={PATHS.reviews} element={protect(<ReviewList />)} />
      <Route path={PATHS.referrals} element={protect(<ReferralSettingsPage />)} />
      <Route path={PATHS.staff} element={protect(<StaffList />)} />
      <Route path={PATHS.settings} element={protect(<MerchantSettings />)} />

      <Route path="*" element={<Navigate to={PATHS.dashboard} replace />} />
    </Routes>
  );
}
