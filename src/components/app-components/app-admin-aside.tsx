"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppLogo } from "./app-logo";

import dashboardIcon from "../../../public/icons/dashboard.svg";
import shakeIcon from "../../../public/icons/shake.svg";
import chatsIcon from "../../../public/icons/chat.svg";
import usersIcon from "../../../public/icons/users.svg";
import selectionIcon from "../../../public/icons/selection.svg";
import calendarIcon from "../../../public/icons/calendar.svg";
import requestIcon from "../../../public/icons/request.svg";
import couponIcon from "../../../public/icons/coupon.svg";
import serviceIcon from "../../../public/icons/service.svg";
import areaIcon from "../../../public/icons/area.svg";
import promotionIcon from "../../../public/icons/promotion.svg";

interface AdminSection {
  title?: string;
  items: AdminItem[];
  lastItem?: boolean;
}

interface AdminItem {
  title: string;
  icon: any;
  link: string;
  muted?: boolean;
}

const adminSections: AdminSection[] = [
  {
    items: [
      {
        title: "Dashboard",
        icon: dashboardIcon,
        link: "/admin/analytics/",
        muted: true,
      },
      {
        title: "Service",
        icon: serviceIcon,
        link: "/admin/analytics/services/",
        muted: true,
      },
      {
        title: "Top Partners",
        icon: shakeIcon,
        link: "/admin/analytics/top-partners/",
        muted: true,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        icon: usersIcon,
        link: "/admin/management/users/",
      },
      {
        title: "Chats",
        icon: chatsIcon,
        link: "/admin/chats",
      },
      {
        title: "Jobs",
        icon: selectionIcon,
        link: "/admin/management/jobs/",
        muted: true,
      },
      {
        title: "Bookings",
        icon: calendarIcon,
        link: "/admin/management/bookings/",
        muted: true,
      },
      {
        title: "Partner Requests",
        icon: requestIcon,
        link: "/admin/management/partner-requests/",
        muted: true,
      },
    ],
  },
  {
    title: "Settings",
    lastItem: true,
    items: [
      {
        title: "Coupons",
        icon: couponIcon,
        link: "/admin/settings/coupons/",
        muted: true,
      },
      {
        title: "Services",
        icon: serviceIcon,
        link: "/admin/settings/services/",
        muted: true,
      },
      {
        title: "Areas",
        icon: areaIcon,
        link: "/admin/settings/areas/",
        muted: true,
      },
      {
        title: "Promotions",
        icon: promotionIcon,
        link: "/admin/settings/promotions/",
        muted: true,
      },
    ],
  },
];

export function AppAdminAside() {
  const path = usePathname();
  const [hoveredItem, setHoveredItem] = useState(path);

  useEffect(() => {
    setHoveredItem(path);
  }, [path]);

  return (
    <aside className="w-80 shadow-border shadow-md sticky top-0 h-screen overflow-y-auto bg-card">
      <AppLogo className="ms-10 mt-5 h-6 text-xl" />

      <div
        className=""
        onMouseLeave={() => {
          setHoveredItem(path);
        }}
      >
        {adminSections.map((section, index) => (
          <ul key={index} className="mt-6">
            {section.title && (
              <li className="text-sm font-semibold px-6 mb-3 text-muted-foreground">
                {section.title}
              </li>
            )}
            {section.items.map((item, index) => (
              <DashboardItem
                key={index}
                item={item}
                active={hoveredItem == item.link}
                onMouseEnter={() => setHoveredItem(item.link)}
              />
            ))}
            {!section.lastItem && <hr className="mt-6"></hr>}
          </ul>
        ))}
      </div>
    </aside>
  );
}

export function DashboardItem({
  active,
  item,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  item: AdminItem;
  active: boolean;
}) {
  return (
    <li className="relative" {...props}>
      <Link
        href={item.link}
        className={cn("flex items-center", {
          "text-muted-foreground": item.muted,
        })}
      >
        {active && (
          <motion.div
            layout
            layoutId="admin-dashboard-liner"
            className="w-1 h-full bg-primary my-1 rounded-e-full absolute"
          ></motion.div>
        )}

        <div
          className={cn("p-4 flex flex-1 mx-5 rounded-md", {
            "bg-primary font-semibold": active,
          })}
        >
          <Image
            alt={item.title}
            color="red"
            className={cn("dark:invert size-6", {
              invert: active,
            })}
            src={item.icon}
          />
          <span className={cn("ml-4", { "text-white": active })}>
            {item.title}
          </span>
        </div>
      </Link>
    </li>
  );
}
