import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get('input');
  if (!input || !API_KEY) {
    return NextResponse.json({ predictions: [] });
  }

  const params = new URLSearchParams({
    input,
    key: API_KEY,
    components: 'country:gb',
    language: 'en',
  });

  const sessiontoken = req.nextUrl.searchParams.get('sessiontoken');
  if (sessiontoken) params.set('sessiontoken', sessiontoken);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
  );
  const data = await res.json();
  return NextResponse.json(data);
}
