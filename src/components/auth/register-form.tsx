"use client";
import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import SocialButton from "@/components/SocialButton";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  UserSchema,
  TUserCredentialsValidator,
} from "@/lib/validators/user-validation";
import { AuthContextType, useAuthContext } from "@/providers/auth-providers";
import { signUp, signInWithRedirect } from "aws-amplify/auth";
import { toast } from "sonner";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";
import axios from "axios";
import SeparatorLine from "@/components/SeparatorLine";
import { checkPhoneUnique } from "@/server/user";

const modifyJson = {
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn:
      process.env.NODE_ENV !== "production"
        ? "http://localhost:3000/register/"
        : "https://real-support.co.uk/register/",
  },
};

Amplify.configure(modifyJson);

type providerType = "Google" | "Facebook" | { custom: string } | undefined;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { loading, setLoading, setConfirmationEmail }: AuthContextType = useAuthContext();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<TUserCredentialsValidator>({
    resolver: zodResolver(UserSchema),
  });

  const onSubmit = async ({
    firstName,
    lastName,
    password,
    emailAddress,
    phone_number,
  }: TUserCredentialsValidator) => {
    setLoading(true);
    const formatedPhone = phone_number.split(" ").join("");
    const phone = phone_number.startsWith("+")
      ? formatedPhone
      : `+${formatedPhone}`;
    try {
      const existingUser = await checkPhoneUnique(phone);
      if (existingUser) {
        toast.error("This number is already registered");
        return;
      }
      const {
        isSignUpComplete,
        nextStep: { signUpStep },
        userId,
      } = await signUp({
        username: emailAddress,
        password,
        options: {
          userAttributes: {
            email: emailAddress,
            phone_number: phone,
            given_name: firstName,
            name: lastName,
          },
          autoSignIn: false,
        },
      });
      const createUserPayload = {
        firstName,
        lastName,
        phone_number: phone,
        emailAddress,
        cognitoId: userId,
      };
      console.log('createUserPayload', createUserPayload);
      
      await axios.post("/api/users/auth/register", createUserPayload);
      if (signUpStep === "CONFIRM_SIGN_UP") {
        setConfirmationEmail(emailAddress)
        router.push("/register/confirm-email");
      }
      if (signUpStep === "DONE" && isSignUpComplete) {
        toast.success("user sign up successfully");
        router.push("/login");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
      reset();
    }
  };

  async function handleSocialLogin(provider: providerType) {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithRedirect({ provider: provider });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md:py-8">
      <section className="max-w-[693px] mx-auto mt-5 bg-gradient-to-b from-white/20 to-white/0 rounded-sm p-5 md:p-10">
        <div className="grid place-items-center gap-5">
          <Image
            width={120}
            height={120}
            src={"/home/header logo.png"}
            alt="RS CAB"
            className="mx-auto"
          />

          <p className=" text-primary font-poppins mb-5 text-4xl font-semibold ">
            Create Account
          </p>
          <SocialButton
            social="Google"
            imgSrc="/images/signup/Group879.png"
            bgColor="bg-sky-500 hover:bg-sky-600"
            onClick={() => handleSocialLogin("Google")}
            disabled={loading}
          />
          <SocialButton
            social="Facebook"
            imgSrc="/images/signup/Group878.png"
            bgColor="bg-sky-700 hover:bg-sky-800"
            onClick={() => handleSocialLogin("Facebook")}
            disabled={loading}
          />
          <SeparatorLine />
          <form
            className="w-full flex flex-col items-center gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className=" w-full space-y-1">
              <Label className="font-semibold text-white">First Name *</Label>
              <Input
                {...register("firstName")}
                placeholder="First Name"
                className={cn("w-full outline-none p-4 rounded-sm", {
                  "focus-visible:ring-red-500": errors?.firstName,
                })}
              />
              {errors?.firstName && (
                <p className="text-red-500 text-sm text-pretty ring-red-500">
                  {errors?.firstName?.message}
                </p>
              )}
            </div>

            <div className=" w-full space-y-1">
              <Label className="font-semibold text-white">Last Name *</Label>
              <Input
                {...register("lastName")}
                placeholder="Last Name"
                className={cn("w-full outline-none p-4 rounded-sm", {
                  "focus-visible:ring-red-500": errors?.lastName,
                })}
              />
              {errors?.lastName && (
                <p className="text-red-500 text-sm text-pretty ring-red-500">
                  {errors?.lastName?.message}
                </p>
              )}
            </div>

            <div className=" w-full space-y-1">
              <Label className="font-semibold text-white">Phone Number *</Label>
              <PhoneInput
                country={"gb"}
                value={getValues().phone_number}
                onChange={(value) => setValue("phone_number", value)}
                inputClass="!relative !outline-none !border-none !px-4 py-3 !ps-24 !rounded-sm !h-full !w-full !bg-custom"
                buttonClass="!absolute !top-0 !bottom-0 !left-0 !w-[80px] !grid !place-content-center !rounded-tl-sm !rounded-bl-sm !bg-custom !border-none "
              />
              {errors?.phone_number && (
                <p className="text-red-500 text-sm text-pretty ring-red-500">
                  {errors?.phone_number?.message}
                </p>
              )}
            </div>

            <div className=" w-full space-y-1">
              <Label className="font-semibold text-white">
                Email Address *
              </Label>
              <Input
                {...register("emailAddress")}
                placeholder="Email Address"
                className={cn("w-full outline-none p-4 rounded-sm", {
                  "focus-visible:ring-red-500": errors?.emailAddress,
                })}
              />
              {errors?.emailAddress && (
                <p className="text-red-500 text-sm text-pretty ring-red-500">
                  {errors?.emailAddress?.message}
                </p>
              )}
            </div>

            <div className=" w-full space-y-1">
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

            <div className=" w-full space-y-1">
              <Label className="font-semibold text-white">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={cn("w-full outline-none p-4 rounded-sm", {
                    "focus-visible:ring-red-500": errors?.confirmPassword,
                  })}
                />
                <div
                  className="absolute right-[5%] top-[30%] cursor-pointer"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  <Icon
                    icon={
                      showConfirmPassword
                        ? "solar:eye-closed-bold"
                        : "solar:eye-bold"
                    }
                    fontSize={20}
                  />
                </div>
              </div>
              {errors?.confirmPassword && (
                <p className="text-red-500 text-sm text-pretty ring-red-500">
                  {errors?.confirmPassword?.message}
                </p>
              )}
            </div>

            <div className="w-full  flex flex-col items-end">
              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "gap-1.5",
                })}
                href="/login"
              >
                Already have an account? Sign-in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <Button disabled={loading} className="w-full " type="submit">
              Sign Up
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default RegisterForm;
