import { useMemo } from "react";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import SvgColor from "@/app/(RSAdmin)/admin/common/svg-color";
import { useAuth } from "@/lib/auth-context";

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const ICONS = {
  job: icon("ic_job"),
  blog: icon("ic_blog"),
  chat: icon("ic_chat"),
  mail: icon("ic_mail"),
  user: icon("ic_user"),
  file: icon("ic_file"),
  lock: icon("ic_lock"),
  tour: icon("ic_tour"),
  order: icon("ic_order"),
  label: icon("ic_label"),
  blank: icon("ic_blank"),
  kanban: icon("ic_kanban"),
  folder: icon("ic_folder"),
  banking: icon("ic_banking"),
  booking: icon("ic_booking"),
  invoice: icon("ic_invoice"),
  product: icon("ic_product"),
  calendar: icon("ic_calendar"),
  disabled: icon("ic_disabled"),
  external: icon("ic_external"),
  menuItem: icon("ic_menu_item"),
  ecommerce: icon("ic_ecommerce"),
  analytics: icon("ic_analytics"),
  dashboard: icon("ic_dashboard"),
  content: icon("ic_content"),
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
                { title: "create", path: paths.dashboard.user.new },
              ],
            },
          ]
        : []),
      {
        title: "Users",
        path: paths.dashboard.passengers.root,
        icon: ICONS.user,
        children: [{ title: "list", path: paths.dashboard.passengers.list }],
      },
      {
        title: "Drivers",
        path: paths.dashboard.drivers.root,
        icon: ICONS.label,
        children: [{ title: "list", path: paths.dashboard.drivers.list }],
      },
      {
        title: "booking-requests",
        path: paths.dashboard.requests.root,
        icon: ICONS.job,
        children: [
          { title: "list", path: paths.dashboard.requests.list },
          { title: "create", path: paths.dashboard.requests.new },
        ],
      },
      {
        title: "bookings",
        path: paths.dashboard.bookings.root,
        icon: ICONS.job,
        children: [{ title: "list", path: paths.dashboard.bookings.list }],
      },
      {
        title: "invoices",
        path: paths.dashboard.invoices.root,
        icon: ICONS.file,
        children: [{ title: "list", path: paths.dashboard.invoices.list }],
      },
      {
        title: "packages",
        path: paths.dashboard.packages.root,
        icon: ICONS.ecommerce,
        children: [
          { title: "list", path: paths.dashboard.packages.list },
          { title: "create", path: paths.dashboard.packages.new },
        ],
      },
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
      {
        title: "coupons",
        path: paths.dashboard.discountCoupons.root,
        icon: ICONS.invoice,
        children: [
          { title: "list", path: paths.dashboard.discountCoupons.list },
          { title: "create", path: paths.dashboard.discountCoupons.new },
        ],
      },
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
      {
        title: "chat",
        path: paths.dashboard.chat.root,
        icon: ICONS.chat,
      },
      {
        title: "work-summary",
        path: paths.dashboard.workSummary.root,
        icon: ICONS.menuItem,
      },
      {
        title: "User Feedbacks",
        path: paths.dashboard.userFeedbacks.root,
        icon: ICONS.mail,
        children: [{ title: "list", path: paths.dashboard.userFeedbacks.list }],
      },
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
