"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeSwitcher from "./ThemeSwitcher";
import MaxWidthWrapper from "./MaxWidthWrapper";
import NavItems from "./NavItem";
import { useAuthContext } from "@/providers/auth-providers";
import UserAccountNav from "./UserAccountNav";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import MobileNav from "./mobileNav";
import { useState } from "react";

const NavBar = () => {
  const { user, mode, menuOpen, setMenuOpen, company } = useAuthContext();
  const [activeItem, setActiveItem] = useState("home");

  const handleIsActive = (value: string) => {
    setActiveItem(value);
  };

  return (
    <MaxWidthWrapper className="max-w-[1666px] fixed top-0 inset-x-0 z-50 ">
      <header className="relative bg-background">
        <div className="flex items-center px-2">
          {/* larger screen navbar */}
          {/*  logo */}
          <div className="p-2 lg:ml-0">
            <Link href="/">
              <Image
                width={70}
                height={70}
                src={"/assets/logo.png"}
                alt="RS CAB"
              />
            </Link>
          </div>
          {/* nav items */}
          <div className="hidden lg:ml-8 lg:block justify-center items-center">
            <NavItems activeItem={activeItem} handleIsActive={handleIsActive} />
          </div>
          {/* buttons */}
          <div className="ml-auto flex items-center">
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
              {!user && !company && (
                <Link
                  href="/login"
                  className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md "
                >
                  SIGN IN
                </Link>
              )}

              {!user && company && (
                <Link
                  href="/company/company-login"
                  className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md "
                >
                  SIGN IN
                </Link>
              )}

              {!user && (
                <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
              )}

              {user && mode === "PASSENGER" && (
                <Link
                  className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md "
                  href={`/rider/${user?.id}/book-ride`}
                >
                  BOOK A RIDE
                </Link>
              )}

              {user && mode === "PASSENGER" && (
                <div className="flex lg:ml-6">
                  <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                </div>
              )}

              {user && <UserAccountNav />}

              {user && (
                <div className="flex lg:ml-6">
                  <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                </div>
              )}

              <div className="ml-4 flow-root lg:ml-6">
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          {/* small screen navbar */}
          <div
            className="lg:hidden flex"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <AiOutlineClose size={30} className="dark:bg-background" />
            ) : (
              <AiOutlineMenu size={30} className="dark:bg-background" />
            )}
          </div>
          <MobileNav />
        </div>
      </header>
    </MaxWidthWrapper>
  );
};

export default NavBar;
