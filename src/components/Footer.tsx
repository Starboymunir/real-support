"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import WhatClientThink from "./WhatClientThink";
import { useAuthContext } from "@/providers/auth-providers";
const Footer = () => {
  const { user } = useAuthContext();

  return (
    <section className="bg-custom bg-cover px-5 bg-center rounded-tr-xl rounded-tl-xl  mt-8">
      <div className=" flex justify-center content-center ">
        <h1 className="max-w-full h-56 text-center md:text-7xl  font-semibold  md:pt-16 text-4xl pt-24 ">
          What Our Clients Think
        </h1>
      </div>
      <div className="flex content-center justify-center">
        <Image
          className="md:h-28 relative sm:right-[-65px] sm:h-24 h-14 right-[-40px]"
          width={210}
          height={120}
          src={"/home/client 03.png"}
          alt=""
        />
        <Image
          className="md:h-40 relative sm:bottom-[25px]  z-10 sm:h-36 h-20 bottom-[14px] left-[-10px]"
          width={280}
          height={150}
          src={"/home/client 01.png"}
          alt=""
        />
        <Image
          className="md:h-28 relative sm:left-[-65px] sm:h-24 h-14 left-[-40px]"
          width={210}
          height={120}
          src={"/home/client 02.png"}
          alt=""
        />
      </div>

      <div className="flex content-center justify-center">
        <WhatClientThink />
      </div>

      <div className="max-w-subContainer mx-auto mt-16 flex flex-wrap gap-4 mb-20  justify-between">
        {/* 1st block  */}
        <div className=" max-w-md  p-3 ">
          <Image
            className="mb-2"
            width={120}
            height={120}
            src={"/home/footer logo.png"}
            alt=""
          />
          <p className="pl-3 mb-8 text-[15px]">
            An ambitious vision to build a Ride-share company that is owned by
            drivers themselves is emerging, promising a fairer and more
            empowering future for those who hit the road day in and day out.
          </p>
          <div className="space-x-4 p-3 flex">
            <a
              href="https://www.facebook.com/profile.php?id=100069839359983"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="w-8"
                width={20}
                height={20}
                src="/home/facebook (2).png"
                alt="Facebook"
              />
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="w-8"
                width={20}
                height={20}
                src="/home/twitter (1).png"
                alt="Twitter"
              />
            </a>
            <a
              href="https://www.instagram.com/rs_cab"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="w-8"
                width={20}
                height={20}
                src="/home/instagram (2).png"
                alt="Instagram"
              />
            </a>
            <a
              href="https://www.threads.net/@rs_cab?xmt=AQGzbdRmoX8705ZwiV4ER1GeIrjzZcJIOfbvSaWaLAzfpIY"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="w-8"
                width={20}
                height={20}
                src="/home/threads.png"
                alt="LinkedIn"
              />
            </a>
          </div>
        </div>
        {/* second block  */}
        <div className="p-3">
          <h3 className="font-bold mb-5">QUICK LINKS</h3>
          <ul>
            <li className="mb-2">
              <Link className="text-sm" href="/">
                HOME
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="/about">
                ABOUT
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="/services">
                SERVICES
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="/contact">
                CONTACT
              </Link>
            </li>
            {!user && (
              <li className="mb-2">
                <Link className="text-sm" href="/company/company-login">
                  COMPANY LOGIN
                </Link>
              </li>
            )}
          </ul>
        </div>
        {/* 3rd block  */}
        {/* <div className="  p-3">
          <h3 className="font-bold mb-5">SERVICES</h3>
          <ul>
            <li className="mb-2">
              <Link className="text-sm" href="#">
                Lorem ipsum
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="#">
                Lorem ipsum
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="#">
                Lorem ipsum
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="#">
                Lorem ipsum
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="#">
                Lorem ipsum
              </Link>
            </li>
            <li className="mb-2">
              <Link className="text-sm" href="#">
                Lorem ipsum{" "}
              </Link>
            </li>
          </ul>
        </div> */}
        {/* 4th block  */}
        <div className="p-3 ">
          <h3 className="font-bold mb-5">CONTACT US </h3>
          <div className="flex mb-3 items-center">
            <div className="flex items-center">
              <Image width={11} height={8} src={"/home/Group 126.png"} alt="" />
            </div>
            <p className="ml-2 text-[14px] object-contain">
              93 Austin Road <br /> LU3 1TZ Luton
            </p>
          </div>
          <div className="flex mb-3">
            <div className="flex items-center">
              <Image
                width={11}
                height={11}
                src={"/home/Group 127.png"}
                alt=""
              />
            </div>
            <p className="ml-2 text-[14px] object-contain ">+44 7769372911</p>
          </div>
          <div className="flex mb-3">
            <div className="flex items-center">
              <Image
                width={11}
                height={11}
                src={"/home/Group 125.png"}
                alt=""
              />
            </div>
            <p className="ml-2 text-[14px] object-contain ">
              info@real-support.co.uk
            </p>
          </div>
          <div className="flex mt-16 flex-wrap gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.psslrscab&pli=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="w-40 mb-8"
                width={90}
                height={30}
                src="/home/Image 24.png"
                alt="Image 24"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.psslrscab&pli=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="w-40 mb-8"
                width={90}
                height={30}
                src="/home/Image 25.png"
                alt="Image 25"
              />
            </a>
          </div>
        </div>
      </div>
      <hr />
      <footer className="bg-gray-800 py-4">
        <p className="text-center text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} Professional Service Support Ltd.
          <a
            href="/privacy-policy"
            className="mx-2 underline hover:text-gray-400"
          >
            Privacy Policy
          </a>
          <a href="/terms-of-service" className="underline hover:text-gray-400">
            Terms of Service
          </a>
        </p>
      </footer>
    </section>
  );
};

export default Footer;
