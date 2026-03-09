"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSnackbar } from "notistack";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API;

const EmailSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  html: z.string().min(1, { message: "Content is required" }),
  bcc: z.array(z.string().email({ message: "Invalid BCC email" })).optional(),
});

type EmailFormData = z.infer<typeof EmailSchema>;

const SendEmailPage = () => {
  const [bccList, setBccList] = useState<string[]>([]);
  const [bccInput, setBccInput] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
  });

  const handleBccKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      const input = bccInput.trim().replace(/,$/, "");

      if (input && !bccList.includes(input)) {
        const isValid = z.string().email().safeParse(input);
        if (isValid.success) {
          setBccList((prev) => [...prev, input]);
          setBccInput("");
        } else {
          enqueueSnackbar("Invalid BCC email", { variant: "error" });
        }
      }
    }

    if (e.key === "Backspace" && bccInput === "" && bccList.length > 0) {
      setBccList((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const removeBcc = (email: string) => {
    setBccList((prev) => prev.filter((e) => e !== email));
  };

  const onSubmit = async (data: EmailFormData) => {
    try {
      const idToken = localStorage.getItem("idToken");
      const payload: EmailFormData = {
        ...data,
        ...(bccList.length > 0 && { bcc: bccList }),
      };

      await axios.post(`${baseUrl}/api/mail/send-bcc`, payload, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      enqueueSnackbar("Email sent successfully!", { variant: "success" });
      reset();
      setBccList([]);
      setBccInput("");
    } catch (error) {
      enqueueSnackbar("Failed to send email.", { variant: "error" });
      console.error("Error sending email:", error);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
        Send Email
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* To Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-gray-700">
            To Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="recipient@example.com"
            className={cn(
              "p-3 border border-gray-300 rounded-md bg-white text-black",
              "focus:ring-2 focus:ring-blue-600 focus:border-transparent",
              errors.email && "border-red-500 focus:ring-red-500"
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* BCC Field */}
        <div className="space-y-2">
          <Label htmlFor="bcc" className="font-semibold text-gray-700">
            BCC (type and press Enter)
          </Label>
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-md bg-white min-h-[56px]",
              errors.bcc && "border-red-500"
            )}
          >
            {bccList.map((email) => (
              <span
                key={email}
                className="flex items-center bg-blue text-white px-3 py-1 rounded-full text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeBcc(email)}
                  className="ml-2 text-white hover:text-red-300 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="bcc"
              type="text"
              value={bccInput}
              onChange={(e) => setBccInput(e.target.value)}
              onKeyDown={handleBccKeyDown}
              placeholder="Add BCC email"
              className="flex-1 min-w-[150px] border-none outline-none bg-transparent text-black placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="font-semibold text-gray-700">
            Subject <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            {...register("subject")}
            placeholder="Email subject"
            className={cn(
              "p-3 border border-gray-300 rounded-md bg-white text-black",
              "focus:ring-2 focus:ring-blue-600 focus:border-transparent",
              errors.subject && "border-red-500 focus:ring-red-500"
            )}
          />
          {errors.subject && (
            <p className="text-red-500 text-sm">{errors.subject.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="html" className="font-semibold text-gray-700">
            Content <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="html"
            {...register("html")}
            placeholder="Enter HTML or plain text content"
            rows={8}
            className={cn(
              "p-3 w-full border border-gray-300 rounded-md bg-white text-black",
              "focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-y",
              errors.html && "border-red-500 focus:ring-red-500"
            )}
          />
          {errors.html && (
            <p className="text-red-500 text-sm">{errors.html.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue hover:bg-blue-700 text-white py-3 rounded-md mt-4"
        >
          Send Email
        </Button>
      </form>
    </div>
  );
};

export default SendEmailPage;
