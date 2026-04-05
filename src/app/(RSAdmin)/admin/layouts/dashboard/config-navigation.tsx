import { useMemo } from "react";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import Iconify from "@/components/iconify/iconify";
import { useAuth } from "@/lib/auth-context";

const icon = (name: string) => <Iconify icon={name} width={22} />;

const ICONS = {
  dashboard: icon("solar:widget-bold-duotone"),
  companies: icon("solar:buildings-bold-duotone"),
  admins: icon("solar:shield-user-bold-duotone"),
  users: icon("solar:users-group-rounded-bold-duotone"),
  drivers: icon("solar:wheel-bold-duotone"),
  requests: icon("solar:clipboard-text-bold-duotone"),
  bookings: icon("solar:calendar-bold-duotone"),
  invoices: icon("solar:bill-list-bold-duotone"),
  packages: icon("solar:box-bold-duotone"),
  content: icon("solar:document-text-bold-duotone"),
  coupons: icon("solar:ticket-sale-bold-duotone"),
  wallet: icon("solar:wallet-bold-duotone"),
  support: icon("solar:chat-round-dots-bold-duotone"),
  workSummary: icon("solar:chart-square-bold-duotone"),
  feedbacks: icon("solar:chat-line-bold-duotone"),
};

export function useNavData() {
  const { admin } = useAuth();
  const role = admin?.role;

  const data = useMemo(() => {
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isAdmin = role === "ADMIN";

    const overview: any[] = [
      { title: "Dashboard", path: paths.dashboard.root, icon: ICONS.dashboard },
    ];

    const management: any[] = [
      ...(isSuperAdmin || isAdmin
        ? [{ title: "Companies", path: paths.dashboard.companies.list, icon: ICONS.companies }]
        : []),
      ...(isSuperAdmin || isAdmin
        ? [{ title: "Admins", path: paths.dashboard.user.list, icon: ICONS.admins }]
        : []),
      ...(isSuperAdmin || isAdmin
        ? [{ title: "Users", path: paths.dashboard.passengers.list, icon: ICONS.users }]
        : []),
      { title: "Drivers", path: paths.dashboard.drivers.list, icon: ICONS.drivers },
    ];

    const operations: any[] = [
      ...(isSuperAdmin || isAdmin
        ? [{ title: "Requests", path: paths.dashboard.requests.list, icon: ICONS.requests }]
        : []),
      { title: "Bookings", path: paths.dashboard.bookings.list, icon: ICONS.bookings },
      { title: "Invoices", path: paths.dashboard.invoices.list, icon: ICONS.invoices },
      ...(isSuperAdmin || isAdmin
        ? [{ title: "Packages", path: paths.dashboard.packages.list, icon: ICONS.packages }]
        : []),
    ];

    const finance: any[] = [
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "Wallet",
              path: paths.dashboard.wallet.root,
              icon: ICONS.wallet,
              children: [
                { title: "Overview", path: paths.dashboard.wallet.root },
                { title: "Withdrawals", path: paths.dashboard.wallet.withDrawalRequests.list },
                { title: "User Transactions", path: paths.dashboard.wallet.userTransaction.list },
                { title: "Transactions", path: paths.dashboard.wallet.adminTransaction.list },
              ],
            },
          ]
        : []),
      ...(isSuperAdmin || isAdmin
        ? [{ title: "Coupons", path: paths.dashboard.discountCoupons.list, icon: ICONS.coupons }]
        : []),
    ];

    const other: any[] = [
      { title: "Support", path: paths.dashboard.chat.root, icon: ICONS.support },
      { title: "Work Summary", path: paths.dashboard.workSummary.root, icon: ICONS.workSummary },
      ...(isSuperAdmin || isAdmin
        ? [
            {
              title: "Content",
              path: paths.dashboard.staticContent.about,
              icon: ICONS.content,
              children: [
                { title: "About Us", path: paths.dashboard.staticContent.about },
                { title: "Terms & Conditions", path: paths.dashboard.staticContent.termsAndConditions },
                { title: "Privacy Policy", path: paths.dashboard.staticContent.privacyPolicy },
                { title: "Services", path: paths.dashboard.staticContent.services },
              ],
            },
          ]
        : []),
    ];

    return [
      { subheader: "overview", items: overview },
      { subheader: "management", items: management },
      { subheader: "operations", items: operations },
      ...(finance.length ? [{ subheader: "finance", items: finance }] : []),
      { subheader: "other", items: other },
    ];
  }, [role]);

  return data;
}
