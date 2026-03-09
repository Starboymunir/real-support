"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/auth-providers";
import { m } from "framer-motion";

export function ProfileAside() {
  const { user, driverProfile, mode } = useAuthContext();
  const currentPath = usePathname();

  if (!user) return <aside>Loading...</aside>;

  console.log("user - mode", mode);
  

  const MyProfileAsideLinks = [
    {
      title: (() => {
        if (currentPath?.match(/\/rider\/.*\/profile\//i))
          return "Profile Details";
        if (currentPath?.match(/\/driver\/.*\/profile\//i))
          return "Profile Details";
        if (currentPath?.match(/\/wallet\/.*/i)) return "My Wallet";
        if (currentPath?.match(/\/rider\/\w*\/$/i)) return "Dashboard";
        if (currentPath?.match(/\/driver\/\w*\/$/i)) return "Dashboard";
        return "Profile";
      })(),

      items: [
        {
          href:
            mode === "PASSENGER"
              ? `/rider/${user?.id}/profile`
              : `/driver/${driverProfile?.id}/profile`,
          label: "PROFILE",
          active: currentPath?.includes("/profile"),
        },
        {
          href: `/wallet/${user.id}`,
          label: "MY WALLET",
          active: currentPath?.includes("/wallet"),
        },
        {
          href:
            mode === "PASSENGER"
              ? `/rider/${user.id}`
              : `/driver/${driverProfile?.id ?? ""}`,
          label: "DASHBOARD",
          active: currentPath?.match(/\/rider\/\w*\/$/i),
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-card hidden md:block p-5 rounded-lg border-[1px] min-h-[75vh]">
      <div className="sticky top-24">
        <h1 className="text-2xl font-semibold font-sans text-center">
          My profile
        </h1>
        <br />
        <h2 className="text-center">{user.emailAddress}</h2>
        <h2 className="text-center">{user.phone_number}</h2>
        <hr className="my-5" />
        <ul className="mt-5">
          {MyProfileAsideLinks.map((group) => (
            <li key={group.title} className="mt-3">
              <h2 className="text-lg font-semibold font-sans">{group.title}</h2>
              <ul role={`${group.title} sections`} className="relative mt-2">
                <div className="absolute left-0 top-0 bottom-0 bg-muted w-1 rounded-full my-3"></div>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="block relative py-2 px-4">
                      {item.active && (
                        <m.div
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute left-0 top-0 bottom-0 bg-primary w-1 rounded-full my-2"
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
