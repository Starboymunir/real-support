import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuthContext } from "@/providers/auth-providers";
import UserAccountNav from "./UserAccountNav";
import { Button } from "@/components/ui/button";
import NavItems from "./NavItem";
import { useState } from "react";

const MobileNav = () => {
  const { user, menuOpen, setMenuOpen, mode } = useAuthContext();
  const [activeItem, setActiveItem] = useState("home");
  
  const handleIsActive = (value: string) => {
    setActiveItem(value);
  };

  return (
    <div
      className={
        menuOpen
          ? "lg:hidden absolute top-[80px] right-0  left-0 px-4 bottom-0 flex flex-col items-start w-full h-screen bg-background text-center  ease-in duration-300"
          : "lg:hidden absolute top-[80px] right-0 left-[-100%] px-4 flex flex-col items-start w-full h-screen text-center bg-background ease-in duration-300"
      }
    >
      <div className="lg:hidden">
        <NavItems activeItem={activeItem} handleIsActive={handleIsActive} />
      </div>
      {user && mode === "user" && (
        <Button
          className="gap-1.5 text-md"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Link
            className="hover:bg-accent hover:text-accent-foreground py-2 px-4 rounded-md "
            href={`/rider/${user?.id}/book-ride`}
          >
            BOOK A RIDE
          </Link>
        </Button>
      )}
      <div className="lg:hidden w-full">
        <div className="flex flex-col items-start">
          {!user ? (
            <Button
              className="gap-1.5 text-md flex flex-col items-start"
              variant="ghost"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Link
                href="/login"
                className="hover:bg-accent hover:text-accent-foreground py-2 px-4 rounded-md "
              >
                SIGN IN
              </Link>
            </Button>
          ) : (
            <UserAccountNav />
          )}
        </div>
      </div>
      <div className="lg:ml-6 my-2 px-4">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default MobileNav;
