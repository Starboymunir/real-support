import { useMemo } from "react";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import Iconify from "@/components/iconify/iconify";
import { useAuth } from "@/lib/auth-context";

// ----------------------------------------------------------------------

const icon = (name: string) => <Iconify icon={name} width={24} />;

const ICONS = {
  dashboard: icon("solar:widget-bold-duotone"),
  user: icon("solar:users-group-rounded-bold-duotone"),
  folder: icon("solar:folder-bold-duotone"),
  label: icon("solar:tag-bold-duotone"),
  job: icon("solar:clipboard-text-bold-duotone"),
  file: icon("solar:file-text-bold-duotone"),
  ecommerce: icon("solar:bag-bold-duotone"),
  content: icon("solar:document-text-bold-duotone"),
  invoice: icon("solar:bill-list-bold-duotone"),
  banking: icon("solar:card-bold-duotone"),
  chat: icon("solar:chat-round-dots-bold-duotone"),
  menuItem: icon("solar:checklist-minimalistic-bold-duotone"),
  mail: icon("solar:letter-bold-duotone"),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { user } = useAuth();
  const role = user?.Admin?.role;

  const data = useMemo(() => {
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isAdmin = role === "ADMIN";
    const isCompanyAdmin = role === "COMPANY_ADMIN";

    const items: any[] = [
      {
        title: "app",
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
      // Companies: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "companies",
              path: paths.dashboard.companies.root,
              icon: ICONS.folder,
              children: [
                { title: "list", path: paths.dashboard.companies.list },
                { title: "create", path: paths.dashboard.companies.new },
              ],
            },
          ]
        : []),
      // Admin users: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "admins",
              path: paths.dashboard.user.root,
              icon: ICONS.user,
              children: [
                { title: "list", path: paths.dashboard.user.list },
                ...(isSuperAdmin
                  ? [{ title: "create", path: paths.dashboard.user.new }]
                  : []),
              ],
            },
          ]
        : []),
      // Users (passengers): SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "Users",
              path: paths.dashboard.passengers.root,
              icon: ICONS.user,
              children: [{ title: "list", path: paths.dashboard.passengers.list }],
            },
          ]
        : []),
      // Drivers: all roles (CompanyAdmin sees own company drivers)
      {
        title: "Drivers",
        path: paths.dashboard.drivers.root,
        icon: ICONS.label,
        children: [
          { title: "list", path: paths.dashboard.drivers.list },
          ...(isSuperAdmin || isAdmin
            ? [{ title: "create", path: paths.dashboard.drivers.new }]
            : []),
        ],
      },
      // Booking requests: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "booking-requests",
              path: paths.dashboard.requests.root,
              icon: ICONS.job,
              children: [
                { title: "list", path: paths.dashboard.requests.list },
                { title: "create", path: paths.dashboard.requests.new },
              ],
            },
          ]
        : []),
      // Bookings: all roles can view
      {
        title: "bookings",
        path: paths.dashboard.bookings.root,
        icon: ICONS.job,
        children: [
          { title: "list", path: paths.dashboard.bookings.list },
          ...(isSuperAdmin || isAdmin
            ? [{ title: "create", path: paths.dashboard.bookings.new }]
            : []),
        ],
      },
      // Invoices: all roles
      {
        title: "invoices",
        path: paths.dashboard.invoices.root,
        icon: ICONS.file,
        children: [
          { title: "list", path: paths.dashboard.invoices.list },
          ...(isSuperAdmin || isAdmin
            ? [{ title: "create", path: paths.dashboard.invoices.new }]
            : []),
        ],
      },
      // Packages: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "packages",
              path: paths.dashboard.packages.root,
              icon: ICONS.ecommerce,
              children: [
                { title: "list", path: paths.dashboard.packages.list },
                { title: "create", path: paths.dashboard.packages.new },
              ],
            },
          ]
        : []),
      // Static Content: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "Static Content Management",
              path: paths.dashboard.staticContent.about,
              icon: ICONS.content,
              children: [
                { title: "About Us", path: paths.dashboard.staticContent.about },
                {
                  title: "Terms and Conditions",
                  path: paths.dashboard.staticContent.termsAndConditions,
                },
                {
                  title: "Privacy Policy",
                  path: paths.dashboard.staticContent.privacyPolicy,
                },
              ],
            },
          ]
        : []),
      // Coupons: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "coupons",
              path: paths.dashboard.discountCoupons.root,
              icon: ICONS.invoice,
              children: [
                { title: "list", path: paths.dashboard.discountCoupons.list },
                { title: "create", path: paths.dashboard.discountCoupons.new },
              ],
            },
          ]
        : []),
      // Wallet: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "wallet",
              path: paths.dashboard.wallet.root,
              icon: ICONS.banking,
              children: [
                {
                  title: "With Drawl Requests",
                  path: paths.dashboard.wallet.withDrawalRequests.list,
                },
                {
                  title: "User Transactions",
                  path: paths.dashboard.wallet.userTransaction.list,
                },
                {
                  title: "Transactions",
                  path: paths.dashboard.wallet.adminTransaction.list,
                  children: [
                    {
                      title: "Create",
                      path: paths.dashboard.wallet.adminTransaction.create,
                    },
                    {
                      title: "List",
                      path: paths.dashboard.wallet.adminTransaction.list,
                    },
                  ],
                },
              ],
            },
          ]
        : []),
      // Chat: all roles
      {
        title: "chat",
        path: paths.dashboard.chat.root,
        icon: ICONS.chat,
      },
      // Work Summary: all roles (CompanyAdmin sees own company drivers)
      {
        title: "work-summary",
        path: paths.dashboard.workSummary.root,
        icon: ICONS.menuItem,
      },
      // User Feedbacks: SUPER_ADMIN and ADMIN only
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "User Feedbacks",
              path: paths.dashboard.userFeedbacks.root,
              icon: ICONS.mail,
              children: [{ title: "list", path: paths.dashboard.userFeedbacks.list }],
            },
          ]
        : []),
    ];

    return [
      {
        subheader: "dashboard",
        items,
      },
    ];
  }, [role]);

  return data;
}
