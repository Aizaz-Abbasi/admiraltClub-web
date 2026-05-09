import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { App } from "./App";
import { SignupPage } from "./pages/SignupPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { getStoredUser, useAuthActions, useAuthUser } from "./auth";

const EMPTY_SEARCH = {
  session_id: undefined,
  cancelled: undefined,
  view: undefined,
};

function RootLayout() {
  const router = useRouter();
  console.log("Current path:", router.state.location.pathname);
  console.log("Current search:", router.state.location.search);
  return <Outlet />;
}

function AuthPage() {
  const { authMutation } = useAuthActions();
  const { data: user } = useAuthUser();

  if (user) {
    return <Navigate to="/dashboard" search={EMPTY_SEARCH} replace />;
  }

  return (
    <SignupPage
      onAuth={async (payload) => {
        await authMutation.mutateAsync(payload);
      }}
      isSubmitting={authMutation.isPending}
      submitError={authMutation.error?.message}
    />
  );
}

function ProtectedAppPage() {
  const { logout } = useAuthActions();
  const search = useSearch({ from: "/dashboard" });
  const navigate = useNavigate();

  return (
    <App
      onLogout={logout}
      stripeSessionId={search.session_id ?? null}
      initialView={search.session_id ? "membership" : (search.view ?? null)}
      onSearchConsumed={() =>
        navigate({ to: "/dashboard", search: EMPTY_SEARCH, replace: true })
      }
    />
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: AuthPage,
  beforeLoad: () => {
    if (getStoredUser()) {
      throw redirect({ to: "/dashboard", search: EMPTY_SEARCH });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: ProtectedAppPage,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: search.session_id as string | undefined,
    cancelled: search.cancelled as string | undefined,
    view: search.view as string | undefined,
  }),
  beforeLoad: () => {
    if (!getStoredUser()) {
      throw redirect({ to: "/", search: {} });
    }
  },
});

function ResetPasswordPageWrapper() {
  const search = useSearch({ from: "/reset-password" });
  return <ResetPasswordPage token={search.token ?? ""} />;
}

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: ResetPasswordPageWrapper,
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string | undefined,
  }),
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  resetPasswordRoute,
  termsRoute,
  privacyRoute,
]);

// export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-xl mb-2">Page not found</p>
        <p className="text-slate-400 text-sm" id="debug-path"></p>
      </div>
    </div>
  ),
});

// import {
//   Navigate,
//   Outlet,
//   RouterProvider,
//   createRootRoute,
//   createRoute,
//   createRouter,
//   redirect,
// } from '@tanstack/react-router';
// import { App } from './App';
// import { SignupPage } from './pages/SignupPage';
// import { getStoredUser, useAuthActions, useAuthUser } from './auth';

// function RootLayout() {
//   return <Outlet />;
// }

// function AuthPage() {
//   const { authMutation } = useAuthActions();
//   const { data: user } = useAuthUser();

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return (
//     <SignupPage
//       onAuth={async (payload) => {
//         await authMutation.mutateAsync(payload);
//       }}
//       isSubmitting={authMutation.isPending}
//       submitError={authMutation.error?.message}
//     />
//   );
// }

// function ProtectedAppPage() {
//   const { logout } = useAuthActions();
//   return <App onLogout={logout} />;
// }

// const rootRoute = createRootRoute({
//   component: RootLayout,
// });

// const indexRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/',
//   component: AuthPage,
//   beforeLoad: () => {
//     if (getStoredUser()) {
//       throw redirect({ to: '/dashboard' });
//     }
//   },
// });

// const dashboardRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/dashboard',
//   component: ProtectedAppPage,
//   beforeLoad: () => {
//     if (!getStoredUser()) {
//       throw redirect({ to: '/' });
//     }
//   },
// });

// const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute]);

// export const router = createRouter({
//   routeTree,
// });

// declare module '@tanstack/react-router' {
//   interface Register {
//     router: typeof router;
//   }
// }

// export function AppRouterProvider() {
//   return <RouterProvider router={router} />;
// }
