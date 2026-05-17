"use client";

import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  LoginFromSchema,
  TLoginValidator,
} from "@/lib/validators/user-login-validator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn,  } from "aws-amplify/auth";
import { useAuthContext } from "@/providers/auth-providers";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
import { useSnackbar } from "notistack";
import axios from "axios";

const modifyJson = {
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
  },
};

Amplify.configure(modifyJson);
type providerType = "Google" | "Facebook" | { custom: string } | undefined;

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    loading,
    setLoading,
    company
  } = useAuthContext();

  const {
    register,
    handleSubmit,
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

      await signIn({ username: emailAddress, password });
    } catch (error) {      
      if (axios.isAxiosError(error) && error.response) {
        // Handle error response from the API
        const errorMessage = error.response.data.message || "Something went wrong.";
        enqueueSnackbar(errorMessage, { variant: "error" });
      } else {
        // Handle general errors
        enqueueSnackbar("An unexpected error occurred", { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  }

  if (company) {
    return redirect("/company/dashboard");
  }
  

  return (
    <main className="h-full bg-hero-section bg-cover bg-center pt-28">
      <section className="max-w-[693px] mx-auto mt-5 bg-gradient-to-b from-white/20 to-white/0 rounded-sm p-5 md:p-10">
        <div className="grid place-items-center gap-8">
          <Image
            width={120}
            height={120}
            src={"/home/header logo.png"}
            alt="RS Ride"
            className="mx-auto"
          />

          <p className=" text-primary font-poppins mb-5 text-4xl font-semibold ">
            Sign in Company Account
          </p>

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
          </form>
        </div>
      </section>
    </main>
  );
};

export default LoginForm;
