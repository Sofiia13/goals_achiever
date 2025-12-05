export const ROUTE_PATHS = {
  AUTH: {
    ROOT: "/auth",
    REGISTRATION: "/auth/registration",
    LOGIN: "/auth/login",
    PASSWORD_RECOVERY: "/auth/password-recovery",
    NEW_PASSWORD: "/auth/new-password",
    UNAVAILABLE_REGISTRATION: "/auth/unavailable-password-recovery",
  },
  HOME: "/",
  ONBOARDING: "/onboarding",
  QANDA: "/qanda",
  DASHBOARD: {
    ROOT: "/dashboard",
    STRATEGIES: {
      ROOT: "/dashboard/strategies",
      NEW: "/dashboard/strategies/new",
      DETAIL: "/dashboard/strategies/:id",
      getDetail: (id: string | number) => `/dashboard/strategies/${id}`,
    },
    PROFILE: "/dashboard/profile",
    COMMUNITY_SURVEY: "/dashboard/community-survey",
  },
  CONFIRM_EMAIL: "/confirm-email",
  COMMUNITY_SURVEY: "/community-survey",
  AGREEMENT: {
    ROOT: "/agreement",
    TERMS: "/agreement/terms",
    CONDITIONS: "/agreement/conditions",
  },
  NOT_FOUND: "*",
  ...(import.meta.env.DEV
    ? {
        SHARED_COMPONENTS: "/shared-components",
      }
    : {}),
} as const;

export const ROUTE_SEGMENTS = {
  AUTH: {
    REGISTRATION: "registration",
    LOGIN: "login",
    PASSWORD_RECOVERY: "password-recovery",
    NEW_PASSWORD: "new-password",
    UNAVAILABLE_REGISTRATION: "unavailable-password-recovery",
  },
  MAIN: {
    ONBOARDING: "onboarding",
    QANDA: "qanda",
    ...(import.meta.env.DEV
      ? {
          SHARED_COMPONENTS: "shared-components",
        }
      : {}),
  },
  CONFIRM_EMAIL: "confirm-email",
  DASHBOARD: {
    STRATEGIES: "strategies",
    NEW: "new",
    PROFILE: "profile",
    COMMUNITY_SURVEY: "community-survey",
  },
  AGREEMENT: {
    TERMS: "terms",
    CONDITIONS: "conditions",
  },
} as const;
