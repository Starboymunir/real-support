import axiosInstance from "./axios";
import adminAxios from "./admin-axios";

interface PriceData {
  pricePerMilage: number;
  drivingProMin: number;
  serviceFee: number;
  minBill: number;
}

export const calculatePrice2 = (
  distance: number,
  travelTime: number,
  discount: number,
  data: PriceData
): [number, number] => {
  if (!distance || !travelTime || !data) {
    return 0 as unknown as [number, number];
  }
  // Calculate price based on distance
  const distanceInMiles = distance / 1609.34;
  const travelTimeInMinutes = travelTime / 60;

  let distancePrice: number;

  if (distanceInMiles <= 10) {
    distancePrice = distanceInMiles * data.pricePerMilage;
  } else if (distanceInMiles <= 30) {
    distancePrice =
      10 * data.pricePerMilage +
      (distanceInMiles - 10) *
        (data.pricePerMilage - data.pricePerMilage * 0.1); // 10% discount
  } else {
    distancePrice =
      10 * data.pricePerMilage +
      20 * (data.pricePerMilage - data.pricePerMilage * 0.1) +
      (distanceInMiles - 30) *
        (data.pricePerMilage - data.pricePerMilage * 0.2); // 25% discount
  }

  // Calculate price based on travel time
  const travelTimePrice = travelTimeInMinutes * data.drivingProMin;

  // Compare prices and return the maximum, or minimum of 7
  const price = Math.max(distancePrice, travelTimePrice) + data.serviceFee;

  const totalBill = Number(price)?.toFixed(2);
  const discountDecimal = discount ? Number(discount | 0) / 100 : 0;
  const discountAmount = discount ? Number(totalBill) * discountDecimal : 0;
  const formatedTotalBill = Number(totalBill) - discountAmount;

  return [Math.max(formatedTotalBill, data.minBill), discountAmount];
};

export const calculatePrice = async ({
  distance,
  time,
  couponDiscount,
  packageId,
  useAdmin,
}: {
  distance: number;
  time: number;
  couponDiscount: number;
  packageId: string;
  useAdmin?: boolean;
}) => {
  const client = useAdmin ? adminAxios : axiosInstance;
  const { data } = await client.post("/others/calculate-price", {
    distance,
    time,
    couponDiscount,
    packageId,
  });
  console.log(data.data, "<---");

  return data.data;
};
