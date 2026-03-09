"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

type PropsType = {
  Icon:React.ComponentType<{ className?: string }>;
  link:string;
  tab:string;
}
const Tab = ({ Icon, link, tab }: PropsType) => {
  const pathname = usePathname();
  console.log(pathname, "pathname");
  const isCurrentUrl = pathname?.endsWith(link);
  return (
    <li className="me-2">
      <Link
        href={link}
        className={` md:text-md text-sm  font-poppins inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group ${
          isCurrentUrl
            ? "text-gray-600  shadow-inner dark:shadow-white dark:text-gray-300 border-gray-300"
            : ""
        }`}
      >
        <Icon
          className={`${
            isCurrentUrl ? "dark:text-gray-300 text-gray-500" : ""
          } me-2 w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300`}
        />
        {tab}
      </Link>
    </li>
  );
};

export default Tab;
