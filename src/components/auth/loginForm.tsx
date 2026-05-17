"use client";

import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import SocialButton from "@/components/SocialButton";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import {
  LoginFromSchema,
  TLoginValidator,
} from "@/lib/validators/user-login-validator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signInWithRedirect,
} from "aws-amplify/auth";
import { useAuthContext } from "@/providers/auth-providers";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
import SeparatorLine from "@/components/SeparatorLine";
import axiosInstance from "@/lib/axios";
import { useSnackbar } from "notistack";

const modifyJson = {
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
  },
};

Amplify.configure(modifyJson);
type providerType = "Google" | "Facebook" | { custom: string } | undefined;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const {
    user,
    loading,
    setLoading,
    setConfirmationEmail,
    handleSocialLogin,
  } = useAuthContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TLoginValidator>({
    resolver: zodResolver(LoginFromSchema),
  });

  async function handleSignIn({ emailAddress, password }: TLoginValidator) {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const {
        nextStep: { signInStep },
      } = await signIn({ username: emailAddress, password });
      if (signInStep === "CONFIRM_SIGN_UP") {
        setConfirmationEmail(emailAddress);
        router.push("/register/confirm-email");
        return;
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
      reset();
    }
  }

  async function socialLogin(provider: providerType) {
    try { 
      await signInWithRedirect({ provider });
    } catch (error) {
      console.log("Social login error:", error);
      const user = await getCurrentUser();
      if (user) {
        handleSocialLogin();
        return;
      }
      enqueueSnackbar(error as string, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="max-w-[693px] mx-auto mt-5 bg-gradient-to-b from-white/20 to-white/0 rounded-sm p-5 md:p-10">
        <div className="grid place-items-center gap-8">
          <Image
            width={120}
            height={120}
            src={"/home/header logo.png"}
            alt="One App"
            className="mx-auto"
          />

          <p className=" text-primary font-poppins mb-5 text-4xl font-semibold ">
            Sign in account
          </p>

          <SocialButton
            social="Google"
            imgSrc="/images/signup/Group879.png"
            bgColor="bg-sky-500 hover:bg-sky-600"
            onClick={() => socialLogin("Google")}
          />
          <SocialButton
            social="Facebook"
            imgSrc="/images/signup/Group878.png"
            bgColor="bg-sky-700 hover:bg-sky-800"
            onClick={() => socialLogin("Facebook")}
          />

          <SeparatorLine />

          <form
            className="w-full flex flex-col items-center gap-4"
            onSubmit={handleSubmit(handleSignIn)}
          >
            <div className="w-full space-y-1">
              <Label className="font-semibold text-white">
                Email Address *
              </Label>
              <Input
                {...register("emailAddress")}
                placeholder="Email Address"
                className={cn("w-full outline-none p-4 rounded-sm", {
                  "focus-visible:ring-red-500": errors?.emailAddress,
                })}
                type="email"
              />
              {errors?.emailAddress && (
                <p className="text-red-500 text-sm text-pretty ring-red-500">
                  {errors?.emailAddress?.message}
                </p>
              )}
            </div>

            <div className="w-full space-y-1">
              <Label className="font-semibold text-white">Password *</Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={cn("w-full outline-none p-4 rounded-sm", {
                    "focus-visible:ring-red-500": errors?.password,
                  })}
                />
                <div
                  className="absolute right-[5%] top-[30%] cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <Icon
                    icon={
                      showPassword ? "solar:eye-closed-bold" : "solar:eye-bold"
                    }
                    fontSize={20}
                  />
                </div>
              </div>
              {errors?.password && (
                <p className="text-red-500 text-sm text-pretty ring-red-500">
                  {errors?.password?.message}
                </p>
              )}
            </div>
            <div className="w-full flex flex-col items-end">
              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "gap-1.5",
                })}
                href="/forget-password"
              >
                Forget Password ?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Button
              disabled={loading}
              className="w-full flex justify-center"
              type="submit"
            >
              Login
            </Button>

            <div className="w-full flex flex-col items-end">
              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "gap-1.5",
                })}
                href="/register"
              >
                Don&apos;t have an account? Register
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default LoginForm;
