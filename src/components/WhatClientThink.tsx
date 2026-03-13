"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const compliments = [
  "The ride share service is incredibly convenient. I can get a ride at any time, from anywhere.",
  "I appreciate the affordability of this ride share service. It's much cheaper than owning a car or taking a taxi.",
  "The drivers are always so friendly and professional. They make the ride enjoyable.",
  "I love how easy it is to use the app. I can book a ride in just a few taps.",
  "The ride share service is very reliable. I never have to worry about being late for an appointment.",
  "I'm impressed with the cleanliness of the cars. It's clear that hygiene is a priority.",
  "The ride share service is a great way to reduce carbon emissions and traffic congestion. It's a more sustainable option than driving alone.",
  "I appreciate the safety measures in place. I feel secure knowing that all drivers are thoroughly vetted.",
  "The ride share service is a great way to meet new people and have interesting conversations.",
  "I love the flexibility of being able to choose between different types of vehicles. Whether I need a luxury car for a special occasion or a budget option for everyday use, I can find it all in one place.",
];

const WhatClientThink = () => {
  return (
    <Carousel className="w-full overflow-hidden max-w-2xl">
      <CarouselContent>
        {compliments.map((compliment, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className=" rounded-sm bg-transparent border-none">
                <CardContent className="flex items-center justify-center  h-[60px] p-2">
                  <span className="text-sm">{compliment}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default WhatClientThink;
