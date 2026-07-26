import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PATHS } from "./router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BottomNav } from "./components/BottomNav";
import LandingScan from "./pages/LandingScan";
import ScanQr from "./pages/ScanQr";
import Join from "./pages/Join";
import OtpRequest from "./pages/OtpRequest";
import OtpVerify from "./pages/OtpVerify";
import Home from "./pages/Home";
import Rewards from "./pages/Rewards";
import Membership from "./pages/Membership";
import History from "./pages/History";
import ReviewSubmit from "./pages/ReviewSubmit";
import Referral from "./pages/Referral";
import Profile from "./pages/Profile";

const NAV_PATHS: string[] = [PATHS.home, PATHS.rewards, PATHS.membership, PATHS.history, PATHS.profile];

export default function App() {
  const location = useLocation();
  const showNav = NAV_PATHS.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path={PATHS.scan()} element={<LandingScan />} />
        <Route path={PATHS.join()} element={<Join />} />
        <Route path={PATHS.login} element={<OtpRequest />} />
        <Route path={PATHS.loginVerify} element={<OtpVerify />} />

        <Route
          path={PATHS.scanQr}
          element={
            <ProtectedRoute>
              <ScanQr />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.home}
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.rewards}
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.membership}
          element={
            <ProtectedRoute>
              <Membership />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.history}
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.review()}
          element={
            <ProtectedRoute>
              <ReviewSubmit />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.referral}
          element={
            <ProtectedRoute>
              <Referral />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.profile}
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={PATHS.login} replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}
