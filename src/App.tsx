import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NavigationBar } from "./components/NavigationBar";
import { BookingPage } from "./pages/BookingPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { MembershipPage } from "./pages/MembershipPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { StatsPage } from "./pages/StatsPage";
import { useAuthUser } from "./auth";
import { fetchMyMembership } from "./services/membership";

const DASHBOARD_VIEW_STORAGE_KEY = "admiralty.dashboard.view";

// Views each access level may visit
const GUEST_VIEWS = new Set(["leaderboard", "stats", "membership", "profile"]);
const MEMBER_VIEWS = new Set([
  "booking",
  "myBookings",
  "leaderboard",
  "stats",
  "membership",
  "profile",
]);
const ADMIN_VIEWS = new Set(["admin", "profile"]);

interface AppProps {
  onLogout: () => void;
  stripeSessionId?: string | null;
  initialView?: string | null;
  onSearchConsumed?: () => void;
}

export function App({
  onLogout,
  stripeSessionId,
  initialView,
  onSearchConsumed,
}: AppProps) {
  const router = useRouter();
  const { data: authUser } = useAuthUser();

  const role = authUser?.role ?? "MEMBER";
  const isAdmin = role === "ADMIN";

  const { data: membership } = useQuery({
    queryKey: ["membership"],
    queryFn: fetchMyMembership,
  });

  const hasActiveMembership =
    membership?.status === "active" &&
    (membership?.type === "MONTHLY" || membership?.type === "YEARLY");
  // Admin always has full access; MONTHLY/YEARLY active membership grants member-level access
  const isActiveMember = isAdmin || hasActiveMembership;
  // A GUEST with no active membership is restricted to the guest tab set
  const isRestrictedGuest = role === "GUEST" && !hasActiveMembership;

  const allowedViews = isAdmin
    ? ADMIN_VIEWS
    : isRestrictedGuest
      ? GUEST_VIEWS
      : MEMBER_VIEWS;
  const defaultView = isRestrictedGuest ? "leaderboard" : "booking";

  const [currentView, setCurrentView] = useState(() => {
    const stored =
      initialView ||
      localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY) ||
      defaultView;
    return stored;
  });

  useEffect(() => {
    if (stripeSessionId || initialView) {
      onSearchConsumed?.();
    }
  }, []);

  // Allow child pages (e.g. BookingPage gate) to trigger navigation
  useEffect(() => {
    const handler = (e: Event) => {
      const view = (e as CustomEvent<string>).detail;
      if (view) setAndPersistView(view);
    };
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, [allowedViews]);

  // Redirect to default if current view is not allowed for this user's access level
  useEffect(() => {
    if (!allowedViews.has(currentView)) {
      setCurrentView(defaultView);
      localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, defaultView);
    }
  }, [role, hasActiveMembership, currentView]);

  const setAndPersistView = (view: string) => {
    if (!allowedViews.has(view)) return;
    setCurrentView(view);
    localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, view);
  };

  const visibleTabIds = Array.from(allowedViews).filter((v) => v !== "profile");

  const renderView = () => {
    if (!allowedViews.has(currentView)) return null;
    switch (currentView) {
      case "booking":
        return <BookingPage canBook={isActiveMember} />;
      case "admin":
        return <AdminPage />;
      case "membership":
        return <MembershipPage stripeSessionId={stripeSessionId} />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "stats":
        return <StatsPage canAddScore={isActiveMember} />;
      case "myBookings":
        return <MyBookingsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 font-sans text-slate-300">
      <NavigationBar
        currentView={currentView}
        onNavigate={setAndPersistView}
        visibleTabIds={visibleTabIds}
        onLogout={() => {
          onLogout();
          localStorage.removeItem(DASHBOARD_VIEW_STORAGE_KEY);
          setCurrentView("booking");
          void router.navigate({ to: "/", search: {} });
        }}
      />
      <main>{renderView()}</main>
    </div>
  );
}

// import { useState } from 'react';
// import { useRouter } from '@tanstack/react-router';
// import { NavigationBar } from './components/NavigationBar';
// import { BookingPage } from './pages/BookingPage';
// import { AdminPage } from './pages/admin/AdminPage';
// import { MembershipPage } from './pages/MembershipPage';
// import { MyBookingsPage } from './pages/MyBookingsPage';
// import { ProfilePage } from './pages/ProfilePage';
// import { LeaderboardPage } from './pages/LeaderboardPage';
// import { StatsPage } from './pages/StatsPage';

// const DASHBOARD_VIEW_STORAGE_KEY = 'admiralty.dashboard.view';

// interface AppProps {
//   onLogout: () => void;
// }

// export function App({ onLogout }: AppProps) {
//   const router = useRouter();

//   const [currentView, setCurrentView] = useState(() => {
//     const params = new URLSearchParams(window.location.search);

//     // Handle Stripe success redirect
//     const sessionId = params.get('session_id');
//     if (sessionId) {
//       window.history.replaceState({}, '', window.location.pathname);
//       return 'membership';
//     }

//     // Handle ?view= param
//     const viewFromUrl = params.get('view');
//     if (viewFromUrl) {
//       window.history.replaceState({}, '', window.location.pathname);
//       return viewFromUrl;
//     }

//     return localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY) || 'booking';
//   });

//   const [stripeSessionId] = useState(() => {
//     const params = new URLSearchParams(window.location.search);
//     return params.get('session_id') ?? null;
//   });

//   // const [currentView, setCurrentView] = useState(() => {
//   //   // Check if Stripe redirected back with a ?view= param
//   //   const params = new URLSearchParams(window.location.search);
//   //   const viewFromUrl = params.get('view');
//   //   if (viewFromUrl) {
//   //     // Clean URL without reload
//   //     window.history.replaceState({}, '', window.location.pathname);
//   //     return viewFromUrl;
//   //   }
//   //   return localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY) || 'booking';
//   // });

//   const setAndPersistView = (view: string) => {
//     setCurrentView(view);
//     localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, view);
//   };

//   const renderView = () => {
//     switch (currentView) {
//       case 'booking': return <BookingPage />;
//       case 'admin': return <AdminPage />;
//       // case 'membership': return <MembershipPage />;
//       case 'membership': return <MembershipPage stripeSessionId={stripeSessionId} />;
//       case 'leaderboard': return <LeaderboardPage />;
//       case 'stats': return <StatsPage />;
//       case 'myBookings': return <MyBookingsPage />;
//       case 'profile': return <ProfilePage />;
//       default: return <BookingPage />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-navy-900 font-sans text-slate-300">
//       <NavigationBar
//         currentView={currentView}
//         onNavigate={setAndPersistView}
//         onLogout={() => {
//           onLogout();
//           localStorage.removeItem(DASHBOARD_VIEW_STORAGE_KEY);
//           setCurrentView('booking');
//           void router.navigate({ to: '/' });
//         }}
//       />
//       <main>{renderView()}</main>
//     </div>
//   );
// }
