"use client";

import { useAuthContext } from "@/providers/auth-providers";
import Image from "next/image";
import Link from "next/link";

const HeroView = () => {
  const { user } = useAuthContext();

  // const handleClick = () => {
  //   console.log("Downloading the app");
  //   window.open(
  //     "https://play.google.com/store/apps/details?id=com.realsupport.app&pli=1",
  //     "_blank",
  //     "noopener noreferrer"
  //   );
  // };

  return (
    <section>
      <div className="py-10 min-h-[700px] rounded-xl bg-hero-section bg-cover bg-center flex items-center">
        <div className="h-full mx-auto md:px-8 flex flex-col-reverse md:flex-row md:justify-between md:items-center">
          <div className="flex justify-center flex-col md:w-1/2 px-2">
            <h3 className="text-primary font-poppins text-6xl font-medium text-center md:text-left">
              RS Ride
            </h3>
            <h3 className="text-blue font-poppins text-3xl font-medium leading-normal">
              Rides in Seconds With Service You&apos;re Going With Confidence
              and Peace of Mind !
            </h3>
            <p className="text-white my-5 text-md font-poppins leading-loose">
              Every driver is background checked and safety certified. Get where
              you&apos;re going with confidence and peace of mind. With the RS
              CAB app, a ride is just a tap away. Book a car anytime, anywhere -
              all from your phone. Compare rates for different vehicles and get
              fare quotes in the app. Get connected to your personal driver and
              check the progress of your car at any time. Sit back, relax, and
              go anywhere you want. We&apos;ll email you a receipt when you
              arrive at your destination.
            </p>
            <div className="flex justify-center md:justify-start space-x-3">
              {!user ? (
                <Link href={"/login"} className="md:mr-5 mr-auto">
                  <button className="bg-primary py-3 px-6 rounded-md font-semibold text-sm">
                    SIGN IN
                  </button>
                </Link>
              ) : (
                <Link
                  href={`/rider/${user?.id}/book-ride`}
                  className="md:mr-5 mr-auto"
                >
                  <button className="bg-primary py-3 px-6 rounded-md font-semibold text-sm">
                    Book a ride
                  </button>
                </Link>
              )}
              {/* <button
                className="bg-primary py-3 px-6 rounded-md font-semibold text-sm font-poppins"
                onClick={handleClick}
              >
                DOWNLOAD THE APP
              </button> */}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
              className=""
              width={425}
              height={425}
              src={"/home/header logo.png"}
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroView;
