import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import createAuthRequiredPage from "./auth/pages/createAuthRequiredPage"

import { LoginPage } from '../../../../src/client/auth/pages/LoginPage'
import { SignupPage } from '../../../../src/client/auth/pages/SignupPage'
import { EmailVerificationPage } from '../../../../src/client/auth/pages/EmailVerificationPage'
import { PasswordResetPage } from '../../../../src/client/auth/pages/PasswordResetPage'
import { RequestPasswordResetPage } from '../../../../src/client/auth/pages/RequestPasswordResetPage'
import { ProfilePage } from '../../../../src/client/auth/pages/ProfilePage'
import { SearchExecutionPage } from '../../../../src/client/serpExecution/pages/SearchExecutionPage'
import { ResultsManagerPage } from '../../../../src/client/resultsManager/pages/ResultsManagerPage'
import { ReviewPage } from '../../../../src/client/reviewResults/pages/ReviewPage'
import { ReportingPage } from '../../../../src/client/reporting/pages/ReportingPage'
import { SearchStrategyPage } from '../../../../src/client/searchStrategy/pages/SearchStrategyPage'


import { DefaultRootErrorBoundary } from './components/DefaultRootErrorBoundary'

import { routes } from 'wasp/client/router'

export const routeNameToRouteComponent = {
  LoginRoute: LoginPage,
  SignupRoute: SignupPage,
  EmailVerificationRoute: EmailVerificationPage,
  PasswordResetRoute: PasswordResetPage,
  RequestPasswordResetRoute: RequestPasswordResetPage,
  ProfileRoute: createAuthRequiredPage(ProfilePage),
  SearchExecutionRoute: createAuthRequiredPage(SearchExecutionPage),
  ResultsManagerRoute: createAuthRequiredPage(ResultsManagerPage),
  ReviewRoute: createAuthRequiredPage(ReviewPage),
  ReportingRoute: createAuthRequiredPage(ReportingPage),
  SearchStrategyRoute: createAuthRequiredPage(SearchStrategyPage),
} as const;

const waspDefinedRoutes = [
]
const userDefinedRoutes = Object.entries(routes).map(([routeKey, route]) => {
  return {
    path: route.to,
    Component: routeNameToRouteComponent[routeKey],
  }
})

const browserRouter = createBrowserRouter([{
  path: '/',
  ErrorBoundary: DefaultRootErrorBoundary,
  children: [
    ...waspDefinedRoutes,
    ...userDefinedRoutes,
  ],
}])

export const router = <RouterProvider router={browserRouter} />
