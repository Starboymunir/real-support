import React, { useState, useEffect, useRef, useMemo, MouseEvent } from "react";
import GoogleMap from "google-maps-react-markers";
import Iconify from "@/components/iconify/iconify";
import { Avatar, Popover, Typography, Stack, Rating } from "@mui/material";
import AwsImageAvatar from "../../common/aws-image-avatar/Avatar";
import { fDate } from "@/lib/utils/format-time";
import { useOnlineDriversQuery } from "@/hooks/Drivers";
import { useRequestsQuery } from "@/hooks/Requests";
import { useSocket } from "@/providers/SocketProvider";
import { SOCKET_EVENT_ENUM } from "@/helpers/constants";
import { useSnackbar } from "notistack";

type MarkerProps = {
  lat: number;
  lng: number;
  onHover?: {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
  };
};


// -------------------- Marker Components --------------------

const MarkerWrapper = React.memo(
  ({ children, onMouseEnter, onMouseLeave }: any) => (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "auto",
        height: "auto",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  )
);

const CabMarker = React.memo(({ lat, lng, onHover }: MarkerProps) => (
  <MarkerWrapper {...onHover}>
    <Avatar
      sx={{
        bgcolor: "white",
        boxShadow: 1,
        width: 20,
        height: 20,
      }}
    >
      <Iconify
        icon="ion:car-outline"
        sx={{ color: "primary.main" }}
        width={17}
      />
    </Avatar>
  </MarkerWrapper>
));

const PassengerMarker = React.memo(({ lat, lng, onHover }: MarkerProps) => (
  <MarkerWrapper {...onHover}>
    <Avatar
      sx={{
        bgcolor: "white",
        boxShadow: 1,
        width: 30,
        height: 30,
      }}
    >
      <Iconify icon="el:person" sx={{ color: "primary.main" }} width={24} />
    </Avatar>
  </MarkerWrapper>
));

const UserMarker = React.memo(({ lat, lng, onHover }: MarkerProps) => (
  <MarkerWrapper>
    <Avatar
      sx={{
        bgcolor: "primary.main",
        width: 24,
        height: 24,
      }}
    >
      <Iconify icon="mdi:map-marker" sx={{ color: "red" }} width={24} />
    </Avatar>
  </MarkerWrapper>
));

// -------------------- Detail Popover Components --------------------

const CabDetail = ({ detail }: any) => (
  <Stack spacing={1}>
    <Stack direction="row" alignItems="center">
      <AwsImageAvatar
        alt={detail?.userInfo?.firstName}
        imageKey={detail?.userInfo?.coverImage || detail?.userInfo?.profileImageUrl}
        sx={{ mr: 2 }}
      />
      <Typography>
        {detail?.userInfo?.firstName} {detail?.userInfo?.lastName}
      </Typography>
    </Stack>
    <Stack direction="row" alignItems="center">
      <Typography>Rating:</Typography>
      <Rating value={detail?.ratings} readOnly size="small" />
    </Stack>
    <Typography>Phone: {detail?.userInfo?.phone_number}</Typography>
    <Typography>Email: {detail?.userInfo?.emailAddress}</Typography>
  </Stack>
);

const PassengerDetail = ({ detail }: any) => (
  <Stack spacing={1}>
    <Stack direction="row" alignItems="center">
      <AwsImageAvatar
        alt={detail?.riderInfo?.firstName}
        imageKey={detail?.riderInfo?.coverImage}
        sx={{ mr: 2 }}
      />
      <Typography>
        {detail?.riderInfo?.firstName} {detail?.riderInfo?.lastName}
      </Typography>
    </Stack>
    <Typography>Date: {fDate(detail?.bookingDate)}</Typography>
    <Typography>Time: {detail?.bookingTime}</Typography>
    <Typography>Phone: {detail?.clientPhone}</Typography>
    <Typography>Email: {detail?.clientEmail}</Typography>
  </Stack>
);

// -------------------- Main Component --------------------

export default function GoogleMapComponent() {
  const { socket } = useSocket();
  const { enqueueSnackbar } = useSnackbar();
  const mapRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 51.88425369999999,
    lng: -0.4316344999999999,
  });

  const { data: onlineDrivers = [], refetch: driverFetch } =
    useOnlineDriversQuery();
  const { data: currentRequest = [], refetch: requestFetch } =
    useRequestsQuery();

  const onGoogleApiLoaded = ({ map }: any) => {
    mapRef.current = map;
  };

  const markerData = useMemo(() => {
    const requestMarkers = currentRequest
      .filter(
        (req: any) => req?.startFrom?.latitude && req?.startFrom?.longitude
      )
      .map((req: any, index: number) => ({
        ...req,
        id: `request-${index}`,
        type: "request",
        lat: req.startFrom.latitude,
        lng: req.startFrom.longitude,
      }));

    const driverMarkers = onlineDrivers
      .map((drv: any) => {
        const loc =
          drv?.userInfo?.currentLocation ??
          drv?.currentLocation ??
          (drv?.currentLatitude && drv?.currentLongitude
            ? { latitude: drv.currentLatitude, longitude: drv.currentLongitude }
            : null);
        if (!loc?.latitude || !loc?.longitude) return null;
        return { drv, lat: Number(loc.latitude), lng: Number(loc.longitude) };
      })
      .filter((m: any): m is { drv: any; lat: number; lng: number } => m !== null)
      .map(({ drv, lat, lng }, index: number) => ({
        ...drv,
        id: `cab-${index}`,
        type: "cab",
        lat,
        lng,
      }));

    return [...requestMarkers, ...driverMarkers];
  }, [currentRequest, onlineDrivers]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) =>
        setCurrentLocation({ lat: coords.latitude, lng: coords.longitude }),
      (err) => console.warn("Geolocation error:", err.message)
    );
  }, []);

  const handleMarkerHover = (e: MouseEvent<HTMLElement>, marker: any) => {
    setAnchorEl(e.currentTarget);
    setHoveredMarker(marker);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setHoveredMarker(null);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENT_ENUM.DRIVER.DRIVER_ONLINE, () => {
      enqueueSnackbar("Driver Updated", { variant: "success" });
      driverFetch();
    });

    // Location pings come through DRIVER_PROFILE_UPDATED; refetch silently so
    // markers move without spamming snackbar toasts.
    socket.on(SOCKET_EVENT_ENUM.DRIVER.DRIVER_PROFILE_UPDATED, () => {
      driverFetch();
    });

    socket.on(SOCKET_EVENT_ENUM.DRIVER.DRIVER_OFFLINE, () => {
      driverFetch();
    });

    socket.on(SOCKET_EVENT_ENUM.REQUEST.NEW_REQUEST, () => {
      enqueueSnackbar("Request Received", { variant: "success" });
      requestFetch();
    });

    return () => {
      socket.off(SOCKET_EVENT_ENUM.DRIVER.DRIVER_ONLINE);
      socket.off(SOCKET_EVENT_ENUM.DRIVER.DRIVER_PROFILE_UPDATED);
      socket.off(SOCKET_EVENT_ENUM.DRIVER.DRIVER_OFFLINE);
      socket.off(SOCKET_EVENT_ENUM.REQUEST.NEW_REQUEST);
    };
  }, [socket, enqueueSnackbar, driverFetch, requestFetch]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100%", minHeight: 400, width: "100%" }}
      >
        <Iconify
          icon="solar:map-bold-duotone"
          width={64}
          sx={{ color: "text.disabled", opacity: 0.4, mb: 2 }}
        />
        <Typography variant="body2" sx={{ color: "text.disabled" }}>
          Map requires a Google Maps API key
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled", opacity: 0.6 }}>
          Set NEXT_PUBLIC_GOOGLE_PLACES_API_KEY in .env.local
        </Typography>
      </Stack>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", minHeight: 400 }}>
      <GoogleMap
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!}
        defaultCenter={currentLocation}
        defaultZoom={10}
        mapMinHeight="400px"
        onGoogleApiLoaded={onGoogleApiLoaded}
      >
        <UserMarker lat={currentLocation.lat} lng={currentLocation.lng} />

        {markerData.map((marker) =>
          marker.type === "cab" ? (
            <CabMarker
              key={marker.id}
              lat={marker.lat}
              lng={marker.lng}
              onHover={{
                onMouseEnter: (e: MouseEvent<HTMLElement>) =>
                  handleMarkerHover(e, marker),
                onMouseLeave: handleClosePopover,
              }}
            />
          ) : (
            <PassengerMarker
              key={marker.id}
              lat={marker.lat}
              lng={marker.lng}
              onHover={{
                onMouseEnter: (e: MouseEvent<HTMLElement>) =>
                  handleMarkerHover(e, marker),
                onMouseLeave: handleClosePopover,
              }}
            />
          )
        )}
      </GoogleMap>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div style={{ padding: 16 }}>
          {hoveredMarker?.type === "cab" ? (
            <CabDetail detail={hoveredMarker} />
          ) : (
            <PassengerDetail detail={hoveredMarker} />
          )}
        </div>
      </Popover>
    </div>
  );
}
