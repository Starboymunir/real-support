"use client";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PaymentIntent, StripePaymentElementOptions } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { TopupWallet } from "@/server/payment";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/providers/auth-providers";
import { useSnackbar } from "notistack";
import { useCallback, useState } from "react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userId, refetchWallet } = useAuthContext();
  const navigation = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const params = useSearchParams();
  const amountInCents = Number(params.get("amount")); // string -> number
  const amount = amountInCents ? (amountInCents / 100).toFixed(2) : null;

  const onSuccessPayment = useCallback(
    async (paymentIntent: PaymentIntent) => {
      try {
        await TopupWallet(
          userId as string,
          Number(paymentIntent.amount) / 100,
          paymentIntent.id as string
        );
        enqueueSnackbar("Top up successful");
        refetchWallet();
        const redirectUrl = localStorage.getItem("topupRedirect");
        if (redirectUrl) {
          localStorage.removeItem("topupRedirect");
          navigation.push(redirectUrl);
        } else {
          navigation.push(`/wallet/${userId}`);
        }
      } catch (err) {
        console.error("Error when trying to top up wallet", err);
        enqueueSnackbar(
          `An error occurred while processing your payment: ${
            (err as Error)?.message
          }`,
          { variant: "error" }
        );
      }
    },
    [enqueueSnackbar, navigation, refetchWallet, userId]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }
      setIsLoading(true);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("[Payment Error]", error);
        enqueueSnackbar(error.message || "Payment failed. Please try again.", {
          variant: "error",
        });
        setIsLoading(false);
        return;
      } else if (
        paymentIntent &&
        ["succeeded", "processing"].includes(paymentIntent.status)
      ) {
        await onSuccessPayment(paymentIntent);
      } else {
        enqueueSnackbar("Payment failed. Please try again.", {
          variant: "error",
        });
      }
    },
    [elements, enqueueSnackbar, onSuccessPayment, stripe]
  );

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <Button
        className="w-full bg-black mt-4  text-xs dark:bg-white dark:hover:bg-slate-300 hover:bg-slate-900 flex justify-center"
        disabled={isLoading || !stripe || !elements}
        id="submit"
      >
        <span id="button-text">
          {isLoading
            ? "Processing..."
            : amount
            ? `Pay Now £${amount}`
            : "Pay Now"}
        </span>
      </Button>
    </form>
  );
}
