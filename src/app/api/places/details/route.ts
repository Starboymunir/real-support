import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('place_id');
  if (!placeId || !API_KEY) {
    return NextResponse.json({ result: null });
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'geometry,address_components',
    key: API_KEY,
  });

  const sessiontoken = req.nextUrl.searchParams.get('sessiontoken');
  if (sessiontoken) params.set('sessiontoken', sessiontoken);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
  );
  const data = await res.json();
  return NextResponse.json(data);
}
