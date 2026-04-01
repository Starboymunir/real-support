"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Hub } from "aws-amplify/utils";
import {
  AuthUser,
  fetchAuthSession,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/type";
import { Company, Driver, Wallet } from "@/types/prisma-types";
import { useSnackbar } from "notistack";
import { useWalletQuery } from "@/hooks/Payments";
import axiosInstance from "@/lib/axios";
import { useUserByIdQuery } from "@/hooks/Users";

type WalletResponse = Wallet | { message: string; statusCode: number };

export type AuthContextType = {
  user: IUser | null;
  company: Company | null;
  setCompany: Dispatch<SetStateAction<Company | null>>;
  userId: string | null;
  companyId: string | null;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  forgetPasswordEmail: string | undefined | null;
  setForgetPasswordEmail: Dispatch<SetStateAction<string | null>>;
  confirmationEmail: string | undefined | null;
  setConfirmationEmail: Dispatch<SetStateAction<string | null>>;
  driverProfile: Driver | null | undefined;
  mode: string;
  setMode: Dispatch<SetStateAction<string>>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  logoutUser: () => void;
  userWallet: Wallet | undefined;
  refetchWallet: () => void;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
  handleSocialLogin: () => void;
  refetchUser: () => void;
};

type UserType = AuthUser | null | undefined;

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  forgetPasswordEmail: undefined,
  setForgetPasswordEmail: () => {},
  confirmationEmail: undefined,
  setConfirmationEmail: () => {},
  setLoading: () => {},
  driverProfile: null,
  mode: "PASSENGER",
  setMode: () => {},
  menuOpen: false,
  setMenuOpen: () => {},
  logoutUser: () => {},
  userWallet: undefined,
  refetchWallet: () => {},
  userId: null,
  companyId: null,
  reload: false,
  setReload: () => {},
  handleSocialLogin: () => {},
  company: null,
  setCompany: () => {},
  refetchUser: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null
  );
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState<string | null>(
    null
  );
  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
  const [mode, setMode] = useState<string>("PASSENGER");

  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const getUser = async (redirectUrl: boolean): Promise<void> => {
    try {
      const user: UserType = await getCurrentUser();
      if (!user) {
        return;
      }

      if (user) {
        const { data } = await axiosInstance.get(`/users/info/${user.userId}`);
        const newUser = data.data;
        if (!newUser) {
          enqueueSnackbar("User doesn't exists", { variant: "error" });
          const { data: companyData } = await axiosInstance.get(
            `/company/info/${user.userId}`
          );
          const company = companyData.data;
          if (company) {
            setCompany(company);
            setCompanyId(company?.id);
          }
          return;
        }
        setUserId(newUser?.id);
        setMode(newUser?.mode);
        if (newUser?.driver) {
          setDriverProfile(newUser?.driver);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUserId(null);
        if (error?.response?.data?.message) {
          signOut();
          enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
        }
      } else {
        // Handle non-Axios errors here if needed
        console.log("Non-Axios error:", error);
      }
    } finally {
      if (redirectUrl && user) {
        const lastVisitedUrl = localStorage.getItem("lastVisitedPage");
        console.log("Last Visited Url", lastVisitedUrl);
        if (lastVisitedUrl) {
          router.push(lastVisitedUrl);
        } else {
          router.push(`/rider/${user?.id}`);
        }
      }
      setLoading(false);
    }
  };

  const handleSocialLogin = async (): Promise<void> => {
    try {
      const tokens = (await fetchAuthSession()).tokens;

      if (!tokens?.accessToken) {
        throw new Error("No access token found");
      }

      const { data } = await axiosInstance.get(
        `/users/info/${tokens.idToken?.payload.sub}`
      );
      if (data.success === false) {
        const payload = {
          firstName: tokens.idToken?.payload.given_name,
          lastName: tokens.idToken?.payload.name,
          emailAddress: tokens.idToken?.payload.email,
          phone_number: tokens.idToken?.payload.phone_number,
          cognitoId: tokens.idToken?.payload.sub,
        };
        const { data } = await axiosInstance.post(
          `/auth/register/social`,
          payload
        );
      }
      await getUser(true);
    } catch (error) {
      console.log("error", error);
      setUserId(null);
      await signOut();
    }
  };

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          handleSocialLogin();
          break;
        case "signInWithRedirect_failure":
          enqueueSnackbar("An error has occurred during the OAuth flow.", {
            variant: "error",
          });
          break;
        case "signedOut":
          setUserId(null);
          setCompany(null);
          break;
        case "signedIn":
          getUser(true);
          break;
      }
    });

    getUser(true);
    return unsubscribe;
  }, []);

  useEffect(() => {
    (async () => {
      await getUser(true);
    })();
  }, [reload]);

  const logoutUser = async () => {
    if (!user) return;
    try {
      await signOut();
      setUserId(null);
      router.push("/");
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const { data: userWallet, refetch: refetchWallet } = useWalletQuery(
    userId as string
  );

  const { data: userData, refetch: refetchUser } = useUserByIdQuery(
    userId as string
  );
  const user = userData ?? null;

  // console.log("user in auth context- ", user);
  // console.log("company in auth context- ", company);

  return (
    <AuthContext.Provider
      value={{
        confirmationEmail,
        setConfirmationEmail,
        forgetPasswordEmail,
        setForgetPasswordEmail,
        user,
        userId,
        loading,
        setLoading,
        mode,
        setMode,
        driverProfile,
        menuOpen,
        logoutUser,
        setMenuOpen,
        userWallet,
        refetchWallet,
        reload,
        setReload,
        handleSocialLogin,
        company,
        setCompany,
        companyId,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
