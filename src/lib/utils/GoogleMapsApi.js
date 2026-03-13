"use server";
import axios from "axios";

let apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function fetchPredictions(newInputValue) {
  try {
    const countryFilter = "country:UK";

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${newInputValue}&key=${apiKey}&components=${countryFilter}`
    );
    return response.data.predictions;
  } catch (error) {
    console.error("Error fetching predictions:", error);
    throw error;
  }
}

// calculateDistance.js

export const calculateTotalDistance = async (locations, departure_time) => {
  const { startAddress, stoppages, destinationAddress } = locations;
  const waypoints = [
    startAddress.description,
    ...stoppages?.map((stopage) => stopage.description),
    destinationAddress.description,
  ].join("|");

  var parts = departure_time.split(/[-T:.Z]/);
  var year = parseInt(parts[0]);
  var month = parseInt(parts[1]) - 1; // Months are zero-based in JavaScript
  var day = parseInt(parts[2]);
  var hour = parseInt(parts[3]);
  var minute = parseInt(parts[4]);
  var second = parseInt(parts[5]);

  // Create a new Date object
  var date = new Date(Date.UTC(year, month, day, hour, minute, second));
  var timestamp = Math.floor(date.getTime() / 1000);

  let totalDistance = 0;
  let totalDuration = 0;

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startAddress.description}&destination=${destinationAddress.description}&waypoints=${waypoints}&key=${apiKey}&departure_time=${timestamp}`;
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
      console.error("Error calculating distance:", data);
      return null;
    }

    // const totalDistanceMiles = totalDistance / 1609.34;
    // const totalDurationMinetes = Math.floor(totalDuration / 60);
    return { totalDistance, totalDuration };
  } catch (error) {
    console.error("Error calculating total distance:", error);
    return null;
  }
};

export async function fetchPlaceDetails(place) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry,address_components&key=${apiKey}`
    );

    const { lat, lng } = response?.data?.result?.geometry?.location || {};

    const addressComponents = response?.data?.result?.address_components;
    let postCode = "";
    let houseNumber = "";
    let city = "";
    let streetName = "";

    for (const component of addressComponents) {
      if (component?.types?.includes("postal_code")) {
        postCode = component.short_name;
      }
      if (component?.types?.includes("route")) {
        streetName = component?.short_name;
      }
      if (component.types.includes("street_number")) {
        houseNumber = component?.short_name;
      }
      if (
        component.types.includes("locality") ||
        component.types.includes("postal_town")
      ) {
        city = component?.long_name;
      }
    }
    const data = {
      name: place?.description?.split(",")[0],
      description: place?.description,
      latitude: lat?.toString(),
      longitude: lng?.toString(),
      postCode,
      houseNumber,
      streetName,
      city,
    };
    return data;
  } catch (error) {
    console.error("Error fetching predictions:", error);
    throw error;
  }
}
