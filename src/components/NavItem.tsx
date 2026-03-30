"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/auth-providers";

interface NavItemProps {
  activeItem: string;
  handleIsActive: (value: string) => void;
}

const MENU_ITEMS = [
  { label: "HOME", href: "/", value: "home" },
  { label: "SERVICES", href: "/services", value: "services" },
  { label: "ABOUT", href: "/about", value: "about" },
  { label: "CONTACT", href: "/contact", value: "contact" },
  // { label: "COMPANY", href: "/company-login", value: "company" },
];

const NavItem = ({ activeItem, handleIsActive }: NavItemProps) => {
  const { user, mode } = useAuthContext();
  const menuItems = [
    ...MENU_ITEMS,
    ...(user ? [{ label: "CHAT", href: "/chat", value: "chat" }] : []),
  ];

  return (
    <div className="flex">
      {menuItems.map((item) => (
        <div key={item.value} className="relative flex lg:items-center">
          <Button
            className="gap-1.5 text-md relative ml-2"
            onClick={() => handleIsActive(item.value)}
            variant={activeItem === item.value ? "default" : "ghost"}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default NavItem;
