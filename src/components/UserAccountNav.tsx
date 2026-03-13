"use client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import SwitchAccountButton from "./SwitchAccount";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/auth-providers";

const UserAccountNav = () => {
  const {
    user,
    driverProfile,
    mode,
    menuOpen,
    setMenuOpen,
    logoutUser,
    loading,
    setLoading,
  } = useAuthContext();

  const path = usePathname();

  const logout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      localStorage.setItem("lastVisitedPage", path);
      logoutUser();
      setMenuOpen(!menuOpen);
    } catch (error) {
      console.log("Error in logout", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button variant="ghost" className="relative text-md outline-none">
          MY ACCOUNT
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 left-[30px]" align="end">
        <DropdownMenuItem onClick={() => setMenuOpen(!menuOpen)} asChild>
          <Link
            href={
              mode === "PASSENGER"
                ? `/rider/${user?.id}`
                : `/driver/${driverProfile?.id}`
            }
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground h-9 rounded-md py-3 mb-1"
          >
            DASHBOARD
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="mb-1 w-full">
          <SwitchAccountButton />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/80 h-9 rounded-sm py-3 gap-2"
        >
          <LogOut size={20} />
          LOG OUT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
