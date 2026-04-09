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
import { Company, Driver, Wallet } from "@/lib/types";
import { useSnackbar } from "notistack";
import { useWalletQuery } from "@/hooks/Payments";
import axiosInstance from "@/lib/axios";
import { useUserByIdQuery } from "@/hooks/Users";
import { setToken } from "@/lib/api";

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
    let cognitoUser: UserType = null;
    try {
      cognitoUser = await getCurrentUser();
      if (!cognitoUser) {
        return;
      }

      // Get the email from the Cognito session to look up the backend user.
      // We cannot use cognitoUser.userId (Cognito sub) directly because the
      // backend uses MongoDB ObjectIDs — passing a UUID causes a Prisma
      // "Malformed ObjectID" error.
      const session = await fetchAuthSession();
      const email = session.tokens?.idToken?.payload?.email as string | undefined;

      if (!email) {
        console.log("No email in Cognito token, cannot look up backend user");
        return;
      }

      // Step 1: Look up user by email to get the MongoDB ObjectID
      const { data: lookupData } = await axiosInstance.get(
        `/users/lookup?email=${encodeURIComponent(email)}`
      );
      const lookupUser = lookupData?.data;

      if (!lookupUser?.id) {
        // User exists in Cognito but not in the backend DB yet.
        // Try company lookup by email as well.
        try {
          const { data: companyData } = await axiosInstance.get(
            `/company/lookup?email=${encodeURIComponent(email)}`
          );
          const comp = companyData?.data;
          if (comp) {
            setCompany(comp);
            setCompanyId(comp?.id);
          }
        } catch {
          // company lookup failed — ignore
        }
        return;
      }

      // Step 2: Get full user profile using the MongoDB ObjectID
      const { data } = await axiosInstance.get(`/users/info/${lookupUser.id}`);
      const newUser = data?.data;
      if (!newUser) {
        return;
      }
      setUserId(newUser.id);
      setMode(newUser.mode);
      if (newUser.driver) {
        setDriverProfile(newUser.driver);
      }

      // Sync the backend token into rs_token so api.ts (fetch client) works
      if (newUser.token) {
        setToken(newUser.token);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUserId(null);
        if (error?.response?.data?.message) {
          signOut();
          enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
        }
      } else {
        console.log("Non-Axios error:", error);
      }
    } finally {
      if (redirectUrl && cognitoUser) {
        const lastVisitedUrl = localStorage.getItem("lastVisitedPage");
        if (lastVisitedUrl) {
          router.push(lastVisitedUrl);
        } else {
          router.push(`/rider/dashboard`);
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

      const email = tokens.idToken?.payload?.email as string | undefined;
      if (!email) {
        throw new Error("No email found in social login token");
      }

      // Look up user by email instead of cognitoSub (avoids Prisma ObjectID error)
      let userExists = false;
      try {
        const { data: lookupData } = await axiosInstance.get(
          `/users/lookup?email=${encodeURIComponent(email)}`
        );
        userExists = !!lookupData?.data?.id;
      } catch {
        // 404 or error means user doesn't exist yet
      }

      if (!userExists) {
        // Register the social user in the backend DB
        const payload = {
          firstName: (tokens.idToken?.payload?.given_name as string) || (tokens.idToken?.payload?.name as string) || "User",
          lastName: (tokens.idToken?.payload?.family_name as string) || (tokens.idToken?.payload?.name as string) || "",
          emailAddress: email,
          phone_number: (tokens.idToken?.payload?.phone_number as string) || "",
          cognitoId: tokens.idToken?.payload?.sub as string,
        };
        await axiosInstance.post(`/auth/register/social`, payload);
      }

      await getUser(true);
    } catch (error) {
      console.log("Social login error:", error);
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
