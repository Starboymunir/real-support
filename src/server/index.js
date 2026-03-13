"use server";

import axios from "axios";

export const calculateTotalDistanceAndDuration = async (locations) => {
  const { startAddress, stoppages, destinationAddress } = locations || {};
  const waypoints = [startAddress, ...stoppages, destinationAddress].join("|");

  let totalDistance = 0;
  let totalDuration = 0;

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startAddress}&destination=${destinationAddress}&waypoints=${waypoints}&key=${apiKey}`;
    console.log({ waypoints, apiKey, url });
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === "OK") {
      totalDistance = data.routes[0].legs.reduce(
        (acc, leg) => acc + leg.distance.value,
        0
      );
      totalDuration = data.routes[0].legs.reduce(
        (acc, leg) => acc + leg.duration.value,
        0
      );
    } else {
      console.error("Error calculating distance:", data.status);
      return null;
    }

    // const totalDistanceMiles = totalDistance / 1609.34;
    // const totalDurationMinetes = Math.floor(totalDuration / 60);
    return { totalDistance, totalDuration };
  } catch (error) {
    console.log("Error calculating total distance:", error);
    return null;
  }
};
