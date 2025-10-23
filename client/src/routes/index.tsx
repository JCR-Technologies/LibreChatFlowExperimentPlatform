import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import {
  Login,
  VerifyEmail,
  Registration,
  ResetPassword,
  ApiErrorWatcher,
  TwoFactorScreen,
  RequestPasswordReset,
} from '~/components/Auth';
import AgentMarketplace from '~/components/Agents/Marketplace';
import { OAuthSuccess, OAuthError } from '~/components/OAuth';
import LandingPageWrapper from '~/components/Landing/LandingPageWrapper';
import ProtectedRoute from '~/components/ProtectedRoute';
import { AuthContextProvider } from '~/hooks/AuthContext';
import RouteErrorBoundary from './RouteErrorBoundary';
import StartupLayout from './Layouts/Startup';
import LoginLayout from './Layouts/Login';
import dashboardRoutes from './Dashboard';
import ShareRoute from './ShareRoute';
import ChatRoute from './ChatRoute';
import Search from './Search';
import Root from './Root';
import LandingPage from '~/components/Public/LandingPage';

const AuthLayout = () => (
  <AuthContextProvider>
    <Outlet />
    <ApiErrorWatcher />
  </AuthContextProvider>
);

const baseEl = document.querySelector('base');
const baseHref = baseEl?.getAttribute('href') || '/';

export const router = createBrowserRouter(
  [
    {
      path: 'share/:shareId',
      element: <ShareRoute />,
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: 'oauth',
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: 'success',
          element: <OAuthSuccess />,
        },
        {
          path: 'error',
          element: <OAuthError />,
        },
      ],
    },
    {
      path: 'verify',
      element: <VerifyEmail />,
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: '/',
      element: <LandingPage />,
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: 'register',
      element: <StartupLayout />,
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          index: true,
          element: <Registration />,
        },
        {
          path: 'forgot-password',
          element: <RequestPasswordReset />,
        },
        {
          path: 'reset-password',
          element: <ResetPassword />,
        },
      ],
    },
    {
      path: 'verify',
      element: <VerifyEmail />,
      errorElement: <RouteErrorBoundary />,
    },
    {
      element: <AuthLayout />,
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: 'login',
          element: <LoginLayout />,
          children: [
            {
              index: true,
              element: <Login />,
            },
            {
              path: '2fa',
              element: <TwoFactorScreen />,
            },
          ],
        },
        dashboardRoutes,
        {
          path: 'c',
          element: <Root />,
          children: [
            {
              path: ':conversationId?',
              element: <ChatRoute />,
            },
            {
              path: 'search',
              element: (
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              ),
            },
            {
              path: 'agents',
              element: (
                <ProtectedRoute>
                  <AgentMarketplace />
                </ProtectedRoute>
              ),
            },
            {
              path: 'agents/:category',
              element: (
                <ProtectedRoute>
                  <AgentMarketplace />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ],
    },
  ],
  { basename: baseHref },
);
