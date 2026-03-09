"use server";
import axios from "axios";
import { AxiosResponse } from "axios";
import { TAddressSchema } from "../validators/booking-detail-validator";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

interface Location {
  description: string;
}

interface Locations {
  startFrom: Location;
  stoppages: Location[];
  destination: Location;
}
interface TotalDistanceAndDuration {
  totalDistance: Number;
  totalDuration: Number;
}

interface GoogleApiResponse {
  status: string;

  routes: {
    legs: {
      duration: {
        value: number;
      };
      distance: {
        value: number;
      };
    }[];
  }[];
}

export interface Prediction {
  description: string;
  place_id: string;
  // Add other properties if needed
}

interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
  // Add other properties if needed
}

export interface AddressComponent {
  short_name: string;
  long_name: string;
  types: string[];
  // Add other properties if needed
}

export interface PlaceDetailsResponse {
  geometry: Geometry;
  address_components: AddressComponent[];
  // Add other properties if needed
  // Add other properties if needed
}
export interface placeDetailResult {
  name?: string;
  description: string;
  latitude: string;
  longitude: string;
  postCode: string | null | undefined;
  houseNumber: string | null | undefined;
  streetName: string | null | undefined;
  city: string | null | undefined;
}

export async function fetchPredictions(inputValue: string): Promise<any> {
  try {
    const countryFilter = "country:UK";

    const response: AxiosResponse<{ predictions: Prediction[] }> =
      await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${inputValue}&key=${apiKey}&components=${countryFilter}`
      );
    console.log("response of fetch predications", response);

    return response?.data?.predictions;
  } catch (error) {
    console.error("Error fetching predictions:", error);
    throw error;
  }
}

export async function fetchPlaceDetails(
  place: Prediction
): Promise<TAddressSchema> {
  try {
    const response: AxiosResponse<{ result: PlaceDetailsResponse }> =
      await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry,address_components&key=${apiKey}`
      );

    const { lat, lng } = response?.data?.result?.geometry?.location;

    const addressComponents = response?.data?.result?.address_components;
    let postCode = "";
    let houseNumber = "";
    let city = "";
    let streetName = "";

    for (const component of addressComponents) {
      if (component?.types?.includes("postal_code")) {
        postCode = component?.short_name;
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
    const data: TAddressSchema = {
      name: place.description.split(",")[0],
      description: place.description,
      latitude: lat.toString(),
      longitude: lng.toString(),
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

export const calculateTotalDistanceAndDuration = async (
  locations: Locations,
  departure_time: string
): Promise<TotalDistanceAndDuration | null> => {
  var parts = departure_time.split(/[-T:.Z]/);
  var year = parseInt(parts[0]);
  var month = parseInt(parts[1]) - 1; // Months are zero-based in JavaScript
  var day = parseInt(parts[2]);
  var hour = parseInt(parts[3]);
  var minute = parseInt(parts[4]);
  var second = parseInt(parts[5]);

  // Create a new Date object
  var date = new Date(Date.UTC(year, month, day, hour, minute, second));

  // Convert the Date object to a Unix timestamp
  var timestamp = Math.floor(date.getTime() / 1000);

  const { startFrom, stoppages, destination } = locations;
  const waypoints = [
    startFrom.description,
    ...stoppages?.map((stopage) => stopage.description),
    destination.description,
  ].join("|");

  let totalDistance = 0;
  let totalDuration = 0;

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startFrom.description}&destination=${destination.description}&waypoints=${waypoints}&key=${apiKey}&departure_time=${timestamp}`;

    console.log("Url:", url);
    const response: AxiosResponse<GoogleApiResponse> = await axios.get(url);
    const data: GoogleApiResponse = response.data;
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
    // const totalDurationMinutes = Math.floor(totalDuration / 60);
    return { totalDistance, totalDuration };
  } catch (error) {
    console.error("Error calculating total distance:", error);
    return null;
  }
};
