import { interpolatePath } from './linkHelpers'
import type {
  RouteDefinitionsToRoutes,
  OptionalRouteOptions,
  ParamValue,
  ExpandRouteOnOptionalStaticSegments,
} from './types'

// PUBLIC API
export const routes = {
  LoginRoute: {
    to: "/login",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/login",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  SignupRoute: {
    to: "/signup",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/signup",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  ProfileRoute: {
    to: "/profile",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/profile",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  SearchExecutionRoute: {
    to: "/execute-search",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/execute-search",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  ResultsManagerRoute: {
    to: "/results",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/results",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  ReviewRoute: {
    to: "/review",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/review",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  ReportingRoute: {
    to: "/reporting",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/reporting",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  SearchStrategyRoute: {
    to: "/",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/",
        undefined,
        options?.search,
        options?.hash
      ),
  },
} as const;

// PRIVATE API
export type Routes = RouteDefinitionsToRoutes<typeof routes>

// PUBLIC API
export { Link } from './Link'
