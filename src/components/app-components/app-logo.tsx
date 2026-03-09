import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import AppLogoSvg from "@/../public/logos/app-logo.svg";

export function AppLogo(
  props: Omit<React.ComponentPropsWithoutRef<typeof Link>, "href">,
) {
  return (
    <Link
      {...props}
      href="/"
      className={cn("font-bold font-mono inline-block ", props.className)}
    >
      <Image src={AppLogoSvg} alt={"App logo"} className={"h-full w-fit"} />
      {/*<span className="text-primary">Reel</span>Support*/}
    </Link>
  );
}

export function AppLogoAvatar() {
  return (
    <div className="font-bold font-mono py-3 inline-block">
      <span className="text-primary">Reel</span>
      <span className="text-sm block">Support</span>
    </div>
  );
}
