"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const MainNav = ({ className, ...props }: {
  className?: string;
  [key: string]: any;
}) => {
  const pathname = usePathname();
  const params = useParams();
const { admin } = useAuth();
  const routes = [
    {
      href: `/`,
      label: "HOME",
      active: pathname === `/`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: "ABOUT",
      active: pathname === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/categories`,
      label: "SERVICES",
      active: pathname === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: "DRIVER",
      active: pathname === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/sizes`, // Note: This is a duplicate href; consider fixing
      label: "USER",
      active: pathname === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/colors`,
      label: "CONTACT",
      active: pathname === `/${params.storeId}/colors`,
    },
  ];

  // Define dashboard route separately
  const dashboardRoute = {
    href: "/admin/dashboard",
    label: "Dashboard",
    active: pathname === "/admin/dashboard",
  };

  // Check if user is an admin
  const isAdmin = !!admin;

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-12", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-m font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
      {/* Conditionally render Dashboard link for admins only */}
      {isAdmin && (
        <Link
          href={dashboardRoute.href}
          className={cn(
            "text-m font-medium transition-colors hover:text-primary",
            dashboardRoute.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {dashboardRoute.label}
        </Link>
      )}
    </nav>
  );
};

export default MainNav;