import { Card } from "@/components/ui/card";
import BookingItem from "./BookingCard";
import { Separator } from "@/components/ui/separator";
import { Booking } from "@/lib/types";

type CardProps = {
  tableData: Booking[];
} & React.ComponentProps<typeof Card>;

export default function PreviousBookingCard({
  tableData,
}: CardProps) {  
  return (
    <div className="bg-card mt-5 w-full flex py-5 h-full flex-col shadow-lg p-2 rounded-2xl ">
      {tableData?.map((booking, i: number) => (
        <div key={i}>
          <BookingItem id={booking.id} />
          <Separator className="my-4" />
        </div>
      ))}
    </div>
  );
}
