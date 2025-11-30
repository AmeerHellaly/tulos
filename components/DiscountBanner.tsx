


import Image from "next/image";
import React from "react";


import { Card, CardContent } from "./ui/card";


import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import image1 from '@/images/payment.png'

import { Badge } from "./ui/badge";


import { Button } from "./ui/button";

const DiscountBanner = async () => {
  return (
    <Carousel className="w-full max-w-screen-xl mx-auto mt-10 mb-5">
      <CarouselContent>
      
          <CarouselItem>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 p-6 md:px-12">
                    <Badge
                      variant="secondary"
                      className="mb-2 md:mb-4 text-darkBlue capitalize"
                    >
                    
                    </Badge>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-4">
                  
                    </h2>
                    <p className="text-muted-foreground mb-4">
                 
                    </p>
                    <p className="mb-4">
                      Use code:{" "}
                      <span className="font-semibold text-darkColor uppercase">
                      
                      </span>{" "}
                      for{" "}
                      <span className="font-semibold">
                       
                      </span>{" "}
                      OFF
                    </p>
                    <Button>Shop Now</Button>
                  </div>

                 
                    <div className="w-full md:w-1/2 h-auto relative flex items-center justify-center py-2">
                      <Image
                        src={image1}
                        alt={"bannerImage"}
                        width={500}
                        height={500}
                        priority
                        className="h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                      />
                    </div>
                
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
       
      </CarouselContent>
      <CarouselPrevious className="absolute left-2" />
      <CarouselNext className="absolute right-2" />
    </Carousel>
  );
};

export default DiscountBanner;