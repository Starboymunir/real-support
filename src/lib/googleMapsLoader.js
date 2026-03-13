import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
  apiKey: "AIzaSyBuwXGvLQksDL69Nl7QwCHcJbU2aNlAXR8",
  version: "weekly",
  libraries: ["places"],
});
export default loader;
