"use client";

import { AppInput } from "@/components/app-components";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SocialMediaProviderDetails } from "@/app/constant/SocialProviders";
import Configurations from "@/app/constant/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { SocialProvider } from "@/types/prisma-types";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createSocialMediaLink } from "@/server/user";
import { useAuthContext } from "@/providers/auth-providers";
import { useSnackbar } from "@/components/snackbar";

export default function SocialLinkForm() {
  const [active, setActive] = useState<SocialProvider | undefined>(undefined);
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(e) => {
        if (e) {
          setOpen(true);
        } else {
          if (active) {
            setActive(undefined);
          } else {
            setOpen(false);
          }
        }
      }}
    >
      <AlertDialogTrigger className="text-primary flex items-center gap-1">
        <Plus size={18} /> Link Social
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Link your {active ?? "social media"} account
            <AlertDialogCancel className="absolute top-3 right-3 p-2  border-none text-destructive ">
              x
            </AlertDialogCancel>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {active ? (
                <SocialLinkFormInput
                  provider={active}
                  onClose={() => {
                    setOpen(false);
                    setActive(undefined);
                  }}
                />
              ) : (
                Object.entries(Configurations.SocialMediaProviders).map(
                  ([key, provider]) => (
                    <div
                      key={provider.name}
                      className="flex items-center cursor-pointer gap-3 pe-10 ps-3 py-3 rounded-md hover:bg-accent"
                      role="button"
                      onClick={() => setActive(key as SocialProvider)}
                    >
                      <Image
                        src={provider.icon}
                        width={20}
                        height={20}
                        alt={provider.name}
                      />
                      <span className="ms-2 text-card-foreground text-xl">
                        {provider.name}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const validation = (provider: SocialMediaProviderDetails) =>
  z.object({
    provider: z.string().min(1).regex(provider.urlMatcher, "Invalid URL"),
  });

export const SocialLinkFormInput = ({
  provider,
  onClose,
}: {
  provider: SocialProvider;
  onClose?: () => void;
}) => {
  const socialProvider = Configurations.SocialMediaProviders[provider];
  const validator = validation(socialProvider);

  const { userId, refetchUser } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const form = useForm({
    resolver: zodResolver(validator),
    defaultValues: {
      provider: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof validator>) => {
    try {
      await createSocialMediaLink(provider, data.provider, userId as string);
      enqueueSnackbar("Account linked successfully");
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
      console.error("Error linking account:", error);
    } finally {
      onClose?.();
      refetchUser();
    }
  };

  return (
    <Form {...form}>
      <form className="mt-5" onSubmit={form.handleSubmit(onSubmit)}>
        <AppInput
          form={form}
          name="provider"
          label={provider}
          description="Enter a full url to your account"
        />

        <Button type="submit" className="float-right mt-5">
          Link Account
        </Button>
      </form>
    </Form>
  );
};
