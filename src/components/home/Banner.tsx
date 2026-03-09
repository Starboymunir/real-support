'use client';

import React from 'react';
import Image from 'next/image';

const Banner = () => {
  const handleClick = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.psslrscab&pli=1",
      "_blank",
      "noopener noreferrer"
    );
  };
  return (
    <section>
      <div className="md:mx-auto px-5 md:my-16 h-[430px] bg-custom rounded-xl relative p-5 md:ps-20">
        <div className="md:w-1/2 h-full flex flex-col justify-center gap-5">
          <div className="flex">
            <div className="">
              <Image
                className="w-[80px] object-contain"
                width={81}
                height={73}
                src={"/home/Group 394.png"}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center">
              <h5 className="text-blue font-poppins font-semibold mb-1 ">
                RS CAB APP
              </h5>
              <div className="flex space-x-2">
                <Image
                  className="w-5"
                  width={17}
                  height={17}
                  src={"/home/Icon ionic-ios-star.png"}
                  alt="star"
                />
                <Image
                  className="w-5"
                  width={17}
                  height={17}
                  src={"/home/Icon ionic-ios-star.png"}
                  alt="star"
                />
                <Image
                  className="w-5"
                  width={17}
                  height={17}
                  src={"/home/Icon ionic-ios-star.png"}
                  alt="star"
                />
                <Image
                  className="w-5"
                  width={17}
                  height={17}
                  src={"/home/Icon ionic-ios-star.png"}
                  alt="star"
                />
                <Image
                  className="w-5"
                  width={17}
                  height={17}
                  src={"/home/Icon ionic-ios-star.png"}
                  alt="star"
                />
              </div>
            </div>
          </div>

          <h1 className="text-blue text-6xl font-poppins font-semibold">
            Mobile App
          </h1>

          <p className="text-xl font-poppins">
            Freedom Of Choice And Movement - <br /> One App For Rides
          </p>

          <div>
            <button
              className="bg-primary font-poppins py-3 px-6 rounded-md font-semibold text-sm"
              onClick={handleClick}
            >
              DOWNLOAD THE APP
            </button>
          </div>
        </div>
        <Image
          width={510}
          height={400}
          src={"/home/Image 23.png"}
          className="w-1/3 absolute bottom-0 right-8"
          alt="mobile"
        />
      </div>
    </section>
  );
};

export default Banner;
