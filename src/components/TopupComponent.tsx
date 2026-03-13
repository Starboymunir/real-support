"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TopupSchema, TTopupSchema } from "@/lib/validators/wallet-validator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-providers";
import axiosInstance from "@/lib/axios";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";

const TopupDialog = () => {
  const navigation = useRouter();
  const { userId, user } = useAuthContext();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TTopupSchema>({
    resolver: zodResolver(TopupSchema),
  });

  // ✅ Prefill amount if passed in query param
  useEffect(() => {
    const queryAmount = searchParams.get("amount");
    if (queryAmount) {
      reset({ amount: Number(queryAmount) });
    }
  }, [searchParams, reset]);

  const onNext = async (values: TTopupSchema) => {
    if (loading) return;
    setLoading(true);

    try {
      const amountInCents = Math.round(Number(values.amount) * 100); // <-- round it

      const payload = {
        amount: amountInCents,
        userId: userId,
        email: user?.emailAddress,
        cognitoId: user?.cognitoId,
      };

      const { data } = await axiosInstance.post(
        "/payment-transaction/intent",
        payload
      );

      if (data.success) {
        const secret = data.data.paymentIntent;
        navigation.push(
          `/wallet/${userId}/top-up/payment/${secret}?amount=${amountInCents}`
        );
      }
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    } finally {
      reset();
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <form
      className="w-full flex flex-col gap-4"
      onSubmit={handleSubmit(onNext)}
    >
      <div className="w-full space-y-2">
        <Label className="font-semibold">amount*</Label>
        <Input
          {...register("amount", { valueAsNumber: true })}
          placeholder="0.00"
          className={cn("w-full outline-none p-4 rounded-sm", {
            "focus-visible:ring-red-500": errors?.amount,
          })}
          type="number"
          step={0.01}
        />
        {errors?.amount && (
          <p className="text-red-500 text-sm">{errors?.amount?.message}</p>
        )}
      </div>
      <Button
        className="w-full bg-black mt-4 text-xs dark:bg-white dark:hover:bg-slate-300 hover:bg-slate-900 flex justify-center"
        type="submit"
        disabled={isSubmitting || loading}
      >
        Processed
        <ArrowRight size={15} className="ml-3 text-xs" />
      </Button>
    </form>
  );
};

export default TopupDialog;
