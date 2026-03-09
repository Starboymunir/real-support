import axios, { AxiosResponse } from "axios";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

interface Location {
  description: string;
}

interface Locations {
  startAddress: Location;
  stoppages: Location[];
  destinationAddress: Location;
}

interface TotalDistanceAndDuration {
  totalDistance: number;
  totalDuration: number;
}

interface Prediction {
  place_id: string | number;
  description: string;
}

interface PlaceDetailsData {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  postCode: string;
  houseNumber: string;
  streetName: string;
  city: string;
}

interface GoogleRouteLeg {
  duration: {
    value: number;
  };
  distance: {
    value: number;
  };
}

interface GoogleRoute {
  legs: GoogleRouteLeg[];
}

interface GoogleApiResponse {
  status: string;
  routes: GoogleRoute[];
}

export async function fetchPredictions(
  inputValue: string
): Promise<Prediction[]> {
  try {
    const countryFilter = "country:UK";

    const response: AxiosResponse<any> = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${inputValue}&key=${apiKey}&components=${countryFilter}`
    );

    return response.data.predictions;
  } catch (error) {
    console.error("Error fetching predictions:", error);
    throw error;
  }
}

export async function fetchPlaceDetails(
  place: Prediction
): Promise<PlaceDetailsData> {
  try {
    const response: AxiosResponse<any> = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry,address_components&key=${apiKey}`
    );

    const { lat, lng } = response.data.result.geometry.location;

    const addressComponents = response.data.result.address_components;
    let postCode = "";
    let houseNumber = "";
    let city = "";
    let streetName = "";

    for (const component of addressComponents) {
      if (component.types.includes("postal_code")) {
        postCode = component.short_name;
      }
      if (component.types.includes("route")) {
        streetName = component.short_name;
      }
      if (component.types.includes("street_number")) {
        houseNumber = component.short_name;
      }
      if (
        component.types.includes("locality") ||
        component.types.includes("postal_town")
      ) {
        city = component.long_name;
      }
    }
    const data: PlaceDetailsData = {
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
  const { startAddress, stoppages, destinationAddress } = locations;
  const waypoints = [
    startAddress.description,
    ...stoppages.map((stopage) => stopage.description),
    destinationAddress.description,
  ].join("|");

  let totalDistance = 0;
  let totalDuration = 0;

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startAddress.description}&destination=${destinationAddress.description}&waypoints=${waypoints}&key=${apiKey}&departure_time=${departure_time}`;
    const response = await axios.get<GoogleApiResponse>(url);
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
    console.error("Error calculating total distance:", error);
    return null;
  }
};
