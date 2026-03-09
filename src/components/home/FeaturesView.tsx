import Image from "next/image";
import { Button } from "@/components/ui/button";

const FeaturesView = () => {
  return (
    <section className="relative">
      <div className="min-h-[600px] md:mx-auto md:my-16 bg-custom rounded-xl md:p-16 p-2 grid md:grid-cols-2">
        <div className="lg:w-[540px] flex flex-col justify-center">
          <h3 className="text-blue font-poppins md:text-6xl text-4xl font-medium">
            Relax, You are In Control
          </h3>

          <p className="font-poppins my-5">
            We make sure that your every trip is comfortable The cost of our
            service often beats expensive airport parking charges. We offer
            affordable and reliable airport Transport services.
          </p>
          <p className="font-poppins mb-2">London Heathrow Airport (LHR)</p>
          <p className="font-poppins mb-2">London Gatwick Airport (LGW)</p>
          <p className="font-poppins mb-2">Stansted Airport (STN)</p>
          <p className="font-poppins mb-2">Luton Airport (LTN)</p>
          <p className="font-poppins mb-2">London City Airport</p>
          <p className="font-poppins mb-2">Manchester Glasgow Airport</p>

          <div className="flex justify-end md:justify-start mt-5 ">
            <Button size="lg">KNOW MORE</Button>
          </div>
        </div>
        <div className="md:relative md:w-full">
          {/* line image  */}
          <div className="md:absolute md:top-[-20px] md:right-0 md:flex md:justify-end hidden">
            <Image
              className="w-2/3"
              width={430}
              height={153}
              src={"/home/newHomeVector.png"}
              alt=""
            />
          </div>
          {/* 1st block  */}
          <div className="md:w-[350px] lg:w-[407px] px-10 py-6 mt-9 bg-sky-600 md:absolute">
            <Image
              className="w-14 mb-5"
              width={57}
              height={50}
              src={"/home/Icon material-local-car-wash.png"}
              alt=""
            />
            <p className="text-white text-lg md:w-3/5 font-poppins">
              Reliable & On-Time Business Transport
            </p>
          </div>
          {/* 2nd block  */}
          <div className="md:w-[350px] lg:w-[407px] px-10 md:my-[-10px] my-6 py-6 bg-blue md:absolute md:top-48 md:right-0 md:ps-28 box-border">
            <Image
              className="w-14 mb-5"
              width={57}
              height={50}
              src={"/home/Icon ionic-md-call.png"}
              alt=""
            />
            <p className="text-white text-lg md:w-1/1 font-poppins">
              Customer Services You Can Talk To
            </p>
          </div>
          {/* 3rd block  */}
          <div className="md:w-[350px] lg:w-[407px] px-10 py-6 bg-primary md:absolute md:bottom-[30px] md:left-[-80px]">
            <Image
              className="w-14 mb-5"
              width={57}
              height={50}
              src={"/home/Icon ionic-ios-happy.png"}
              alt=""
            />
            <p className="text-white text-lg md:w-4/5 font-poppins">
              Technology That is <br />
              Insightful & A Joy To Use
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesView;
