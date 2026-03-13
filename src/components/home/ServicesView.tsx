import React from 'react';
import Image from 'next/image';

const ServicesView = () => {
  return (
    <section>
      <div className=" bg-hero-pattern bg-cover bg-center py-10 md:py-32 w-full my-3 rounded-xl">
        <div className="mx-auto h-full flex items-center">
          <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 md:mx-10 mx-2 gap-4">
            {/* card 1 */}
            <div className="place-content-center h-full w-full rounded-2xl backdrop-blur-sm [ p-8 md:p-10 lg:p-10 ] [ bg-gradient-to-b from-white/30 to-white/20 ] relative transition duration-700 cursor-pointer ease-in-out hover:bg-none">
              <div className="flex flex-col items-center">
                <Image
                  className="h-25 w-25"
                  width={97}
                  height={97}
                  src={'/home/icon_3_a9a66a0fc3.png'}
                  alt=""
                />
                <div className="text-white font-poppins text-center">
                  <div className="text-2xl font-semibold p-5">
                    <h1>Choose Your Ride</h1>
                  </div>
                  <p className="font-poppins">
                    Select From A Wide Range Of Options And Get Your Ride Within
                    Minutes, Or Schedule One For Later.
                  </p>
                </div>
              </div>
            </div>
            {/* card 2 */}
            <div className="place-content-center h-full w-full rounded-2xl backdrop-blur-sm [ p-8 md:p-10 lg:p-10 ] [ bg-gradient-to-b from-white/30 to-white/20 ] relative transition duration-700 cursor-pointer ease-in-out hover:bg-none">
              <div className="flex flex-col items-center">
                <Image
                  className="h-25 w-25"
                  width={97}
                  height={97}
                  src={'/home/icon_2_61168d4d4f.png'}
                  alt=""
                />
                <div className="text-white font-poppins text-center">
                  <div className="text-2xl font-semibold p-5">
                    <h1>Track your ride</h1>
                  </div>
                  <p className="font-poppins">
                    Track Your Ride In Real Time From The Moment A Captain Is
                    Assigned Until You Arrive At Your Destination.
                  </p>
                </div>
              </div>
            </div>
            {/* card 3 */}
            <div className="place-content-center h-full w-full rounded-2xl backdrop-blur-sm [ p-8 md:p-10 lg:p-10 ] [ bg-gradient-to-b from-white/30 to-white/20 ] relative transition duration-700 cursor-pointer ease-in-out hover:bg-none">
              <div className="flex flex-col items-center">
                <Image
                  className="h-25 w-25"
                  width={97}
                  height={97}
                  src={'/home/icon_1_0d1b81d8e7.png'}
                  alt=""
                />
                <div className="text-white font-poppins text-center">
                  <div className="text-2xl font-semibold p-5">
                    <h1>Pay Securely</h1>
                  </div>
                  <p className="font-poppins">
                    Card, Careem Pay, Apple Pay Or Cash: You Con Pay Securely On
                    Careem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesView;
