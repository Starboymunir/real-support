// utils
import { paramCase } from "@/lib/utils/change-case";

const ROOTS = {
  AUTH: "/admin/auth",
  AUTH_DEMO: "/auth-demo",
  DASHBOARD: "/admin/dashboard"
};

export const paths = {
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",

  faqs: "/faqs",
  page403: "/403",
  page404: "/404",
  page500: "/500",
  components: "/components",
  docs: "https://docs.minimals.cc",
  changelog: "https://docs.minimals.cc/changelog",
  zoneUI: "https://mui.com/store/items/zone-landing-page/",
  minimalUI: "https://mui.com/store/items/minimal-dashboard/",
  freeUI: "https://mui.com/store/items/minimal-dashboard-free/",
  figma:
    "https://www.figma.com/file/kAYnYYdib0aQPNKZpgJT6J/%5BPreview%5D-Minimal-Web.v5.0.0?type=design&node-id=0%3A1&t=Al4jScQq97Aly0Mn-1",
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id: string) => `/product/${id}`,
  },
  post: {
    root: `/post`,
    details: (title: string) => `/post/${paramCase(title)}`,
  },
  // AUTH
  auth: {
    amplify: {
      login: `${ROOTS.AUTH}/amplify/login`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      register: `${ROOTS.AUTH}/amplify/register`,
      newPassword: `${ROOTS.AUTH}/amplify/new-password`,
      forgotPassword: `${ROOTS.AUTH}/amplify/forgot-password`,
    },
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`,
      verify: `${ROOTS.AUTH}/jwt/verify`,
      newPassword: `${ROOTS.AUTH}/jwt/new-password`,
    },
    firebase: {
      login: `${ROOTS.AUTH}/firebase/login`,
      register: `${ROOTS.AUTH}/firebase/register`,
    },
    auth0: {
      login: `${ROOTS.AUTH}/auth0/login`,
    },
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    companies: {
      root: `${ROOTS.DASHBOARD}/companies`,
      new: `${ROOTS.DASHBOARD}/companies/new`,
      list: `${ROOTS.DASHBOARD}/companies`,
      details: (id: string) => `${ROOTS.DASHBOARD}/companies/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/companies/${id}/edit`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/admin-users`,
      new: `${ROOTS.DASHBOARD}/admin-users/new`,
      list: `${ROOTS.DASHBOARD}/admin-users`,
      changePassword: `${ROOTS.DASHBOARD}/new-password`,
      cards: `${ROOTS.DASHBOARD}/admin-users/cards`,
      profile: `${ROOTS.DASHBOARD}/admin-users/profile`,
      account: `${ROOTS.DASHBOARD}/admin-users/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/admin-users/${id}/edit`,
    },
    staticContent: {
      about: `${ROOTS.DASHBOARD}/static-content/about-us`,
      termsAndConditions: `${ROOTS.DASHBOARD}/static-content/terms-and-conditions`,
      privacyPolicy: `${ROOTS.DASHBOARD}/static-content/privacy-policy`,
    },
    drivers: {
      root: `${ROOTS.DASHBOARD}/drivers`,
      list: `${ROOTS.DASHBOARD}/drivers`,
      new: `${ROOTS.DASHBOARD}/drivers/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/drivers/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/drivers/${id}/edit`,
      carDetail: (driverId: string, id: string) =>
        `${ROOTS.DASHBOARD}/drivers/${driverId}/cars/${id}`,
    },
    passengers: {
      root: `${ROOTS.DASHBOARD}/passengers`,
      list: `${ROOTS.DASHBOARD}/passengers`,
      new: `${ROOTS.DASHBOARD}/passengers/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/passengers/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/passengers/${id}/edit`,
    },
    bookings: {
      root: `${ROOTS.DASHBOARD}/bookings`,
      new: `${ROOTS.DASHBOARD}/bookings/new`,
      list: `${ROOTS.DASHBOARD}/bookings`,
      details: (id: string) => `${ROOTS.DASHBOARD}/bookings/details/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/bookings/edit/${id}/`,
    },
    invoices: {
      root: `${ROOTS.DASHBOARD}/invoices/list`,
      new: `${ROOTS.DASHBOARD}/invoices/new`,
      list: `${ROOTS.DASHBOARD}/invoices/list`,
      details: (id: string) => `${ROOTS.DASHBOARD}/invoices/details/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/invoices/edit/${id}/`,
    },
    requests: {
      root: `${ROOTS.DASHBOARD}/booking-requests`,
      list: `${ROOTS.DASHBOARD}/booking-requests`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/booking-requests/edit/${id}`,
      new: `${ROOTS.DASHBOARD}/booking-requests/new`,
      details: (id: string) =>
        `${ROOTS.DASHBOARD}/booking-requests/details/${id}`,
    },
    packages: {
      root: `${ROOTS.DASHBOARD}/packages`,
      new: `${ROOTS.DASHBOARD}/packages/new`,
      list: `${ROOTS.DASHBOARD}/packages`,
      details: (id: string) => `${ROOTS.DASHBOARD}/packages/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/packages/${id}/edit`,
    },
    discountCoupons: {
      root: `${ROOTS.DASHBOARD}/discount-coupons`,
      new: `${ROOTS.DASHBOARD}/discount-coupons/new`,
      list: `${ROOTS.DASHBOARD}/discount-coupons`,
      details: (id: string) => `${ROOTS.DASHBOARD}/discount-coupons/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/discount-coupons/${id}/edit`,
    },
    wallet: {
      root: `${ROOTS.DASHBOARD}/wallet`,
      withDrawalRequests: {
        root: `${ROOTS.DASHBOARD}/wallet/withDrawelRequests/`,
        list: `${ROOTS.DASHBOARD}/wallet/withDrawelRequests/`,
      },
      adminTransaction: {
        root: `${ROOTS.DASHBOARD}/wallet/transactions/`,
        list: `${ROOTS.DASHBOARD}/wallet/transactions/`,
        create: `${ROOTS.DASHBOARD}/wallet/transactions/create`,
      },
      userTransaction: {
        root: `${ROOTS.DASHBOARD}/wallet/userTransactions/`,
        list: `${ROOTS.DASHBOARD}/wallet/userTransactions/`,
      },
    },
    workSummary: {
      root: `${ROOTS.DASHBOARD}/work-summary`,
      view: (driverId: string) => `${ROOTS.DASHBOARD}/work-summary/${driverId}`,
    },
    userFeedbacks: {
      root: `${ROOTS.DASHBOARD}/user-feedbacks`,
      list: `${ROOTS.DASHBOARD}/user-feedbacks`,
      details: (id: string) => `${ROOTS.DASHBOARD}/user-feedbacks/${id}/details`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user-feedbacks/${id}/edit`,
    },
    chat: {
      root: `${ROOTS.DASHBOARD}/chat`,
    },
  },
};
