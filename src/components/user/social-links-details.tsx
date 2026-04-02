"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Configurations from "@/app/constant/constants";
import { SocialLink } from "@/lib/types";
import Image from "next/image";
import { ProfileSectionTitle } from "./profile-section";
import SocialLinkForm from "./social-link-from";
import { deleteSocialMediaLink } from "@/server/user";
import { useAuthContext } from "@/providers/auth-providers";
import { useSnackbar } from "@/components/snackbar";

export function SocialLinksDetails(params: {
  socialLinks: SocialLink[];
}) {
  // const router = useRouter();
  const { userId, refetchUser } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async (id: string, userId: string) => {
    try {
      await deleteSocialMediaLink(id, userId);
      enqueueSnackbar("Social link removed successfully");
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
      console.log("Failed to remove social link:", error);
    } finally {
      refetchUser();
    }
  };

  return (
    <Card className="mt-10 p-5">
      <ProfileSectionTitle
        className="ms-3"
        title="Social links"
        subtitle="Give people way to find you on the internet"
        button={<SocialLinkForm />}
      />

      {params.socialLinks.length == 0 && (
        <div className="h-40 flex items-center justify-center flex-col gap-3">
          <p>There are no Social Media links just yet.</p>
          <SocialLinkForm />
        </div>
      )}

      <div className="mt-10">
        {params.socialLinks.map((social) => (
          <div className="flex items-center gap-5 mt-5 px-5" key={social.id}>
            <Image
              src={Configurations.SocialMediaProviders[social.type].icon}
              width={40}
              height={40}
              alt={social.type}
            />

            <div className="">
              <div className="text-xl font-semibold">{social.type}</div>
              <a href={social.link} target="_blank" rel="noreferrer">
                {social.link}
              </a>
            </div>
            <div className="flex-1"></div>
            <Button
              variant="link"
              className="hover:no-underline text-destructive "
              onClick={() => handleDelete(social.id, userId as string)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
