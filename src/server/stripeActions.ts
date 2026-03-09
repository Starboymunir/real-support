"use server";
import Stripe from "stripe";

const secretKey: string = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY as string;
const options: Stripe.StripeConfig = {
  typescript: true,
  apiVersion: '2023-08-16', // Provide the appropriate API version here

};
const stripe = new Stripe(secretKey, options);

export const createPaymentIntent = async (amount: number) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency: "GBP",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { secret: paymentIntent.client_secret };
  } catch (error) {
    throw { message: (error as Error).message };
  }
};
