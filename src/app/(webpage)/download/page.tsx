"use client";

import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import React, { Suspense } from "react";

const ServicesPageComp = () => {
  return (
    <MaxWidthWrapper className="flex flex-col items-center justify-center rounded-md bg-custom p-5 md:p-32 rich-text text-white">
      <h1>Download App</h1>
      <h3 className="mb-6 text-center">
        Join thousands of riders—download the app today!
      </h3>
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        <a
          href="https://play.google.com/store/apps/details?id=com.psslrscab&pli=1"
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 md:my-0 md:mx-4" // y-margin in col, x-margin in row
        >
          <Image
            className="w-40 md:mb-0" // Remove bottom margin in row layout
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
          className="my-4 md:my-0 md:mx-4"
        >
          <Image
            className="w-40 md:mb-0"
            width={90}
            height={30}
            src="/home/Image 25.png"
            alt="Image 25"
          />
        </a>
      </div>
      <div className="flex justify-center rich-text">
        <a
          href="http://real-support.co.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 text-center"
        >
          RS CAB – Your City’s Most Trusted Ride-Share
        </a>
      </div>
    </MaxWidthWrapper>
  );
};

const ServicesPage = () => {
  return (
    <Suspense fallback={<LoadingScreen sx={{}} />}>
      <ServicesPageComp />
    </Suspense>
  );
};

export default ServicesPage;
