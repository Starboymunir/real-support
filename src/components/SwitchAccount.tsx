"use client";

import { useAuthContext } from "@/providers/auth-providers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useSnackbar } from "notistack";
import Loader from "./loader";

const SwitchAccountButton = () => {
  const {
    driverProfile,
    mode,
    userId,
    refetchUser,
    loading,
    setLoading,
  } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const onModeChange = async () => {
    if (!userId) return;
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.patch(`/users/info/mode/${userId}`, {
        mode: mode === "PASSENGER" ? "DRIVER" : "PASSENGER",
      });

      if (data.success === true) {
        enqueueSnackbar("Switched successfully");
        router.push(
          mode === "PASSENGER"
            ? `/driver/${driverProfile?.id}`
            : `/rider/${userId}`
        );
      }
    } catch (error) {
      console.log("error--------", error);
      enqueueSnackbar("Something went wrong");
    } finally {
      setLoading(false);
      refetchUser();
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (userId && driverProfile) {
    return (
      <Button
        onClick={onModeChange}
        variant="ghost"
        className="rounded-lg p-0 h-6"
        size="lg"
      >
        SWITCH TO {mode == "PASSENGER" ? "DRIVER" : "RIDER"}
      </Button>
    );
  } else if (userId && !driverProfile) {
    return (
      <Link
        href="/driver"
        className="hover:bg-accent hover:text-accent-foreground"
      >
        Become a driver
      </Link>
    );
  }
};

export default SwitchAccountButton;
