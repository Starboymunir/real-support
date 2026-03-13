import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatToLocalDate, formattedPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IRequestType } from "@/types/type";

interface IBookingCard {
  data: IRequestType;
  cancelRide: (id: string) => void;
}

const BookingCard = ({ data, cancelRide }: IBookingCard) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data?.clientName}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between">
        <CardDescription>{data.packageInfo?.name}</CardDescription>
        <CardDescription>{formattedPrice(data.totalBill || 0)}</CardDescription>
      </CardContent>
      <CardContent className="text-primary pb-3 ">
        <p>Starting Point : </p>
        <CardDescription>{data?.startFrom?.name}</CardDescription>
      </CardContent>
      <CardContent className="text-primary pb-3">
        <p>Destination :</p>
        <CardDescription>{data?.destination?.name}</CardDescription>
      </CardContent>
      <CardContent className="flex justify-between pb-3">
        <p className="text-primary">Date & Time :</p>
        <CardDescription>
          {data.bookingDate
            ? formatToLocalDate(data.bookingDate)
            : "Date Not Selected"}
        </CardDescription>
        <CardDescription>{data.bookingTime}</CardDescription>
      </CardContent>
      <CardContent className="flex justify-between pb-3">
        <p className="text-primary">Payment option :</p>
        <CardDescription>{data.paymentType}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => cancelRide(data.id)}
        >
          Cancel Ride
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
