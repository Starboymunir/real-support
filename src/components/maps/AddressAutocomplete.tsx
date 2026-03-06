'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export interface PlaceResult {
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
  city: string;
  postcode: string;
}

interface AddressAutocompleteProps {
  placeholder?: string;
  label?: string;
  value?: string;
  onSelect: (place: PlaceResult) => void;
  onChange?: (text: string) => void;
  icon?: React.ElementType;
  iconColor?: string;
  className?: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  context?: { id: string; text: string; short_code?: string }[];
}

export default function AddressAutocomplete({
  placeholder = 'Search for a location...',
  label,
  value = '',
  onSelect,
  onChange,
  icon: Icon = MapPin,
  iconColor = 'text-white/25',
  className = '',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (text: string) => {
    if (!text || text.length < 3 || !MAPBOX_TOKEN) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&country=gb&types=address,poi,place,locality,neighborhood&limit=5&language=en`
      );
      const data = await res.json();
      setResults(data.features || []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange?.(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 350);
  };

  const handleSelect = (feature: MapboxFeature) => {
    const cityFromContext = feature.context?.find((c) => c.id.startsWith('place'))?.text;
    // If the selected feature IS a city (type=place), use its own name
    const city = cityFromContext || (feature.id.startsWith('place') ? feature.text : feature.place_name.split(',').slice(-2, -1)[0]?.trim() || feature.text);
    const postcode = feature.context?.find((c) => c.id.startsWith('postcode'))?.text || '';

    const place: PlaceResult = {
      name: feature.text,
      fullAddress: feature.place_name,
      lng: feature.center[0],
      lat: feature.center[1],
      city,
      postcode,
    };

    setQuery(feature.place_name);
    setIsOpen(false);
    onSelect(place);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place&limit=1&language=en`
          );
          const data = await res.json();
          if (data.features?.[0]) {
            handleSelect(data.features[0]);
          }
        } catch {
          // fallback
        }
        setGeolocating(false);
      },
      () => setGeolocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onChange?.('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-white/50 text-sm font-medium mb-2">{label}</label>
      )}
      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor} pointer-events-none`} />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="input-dark w-full pl-12 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
          {query && !loading && (
            <button onClick={clear} className="p-1 rounded-md hover:bg-white/[0.06] text-white/30 hover:text-white/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleUseCurrentLocation}
            disabled={geolocating}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-white/30 hover:text-secondary transition-colors"
            title="Use current location"
          >
            {geolocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 rounded-xl border border-white/[0.08] bg-[#0D1420] shadow-2xl overflow-hidden">
          {results.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleSelect(feature)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.04] last:border-0"
            >
              <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{feature.text}</p>
                <p className="text-xs text-white/40 truncate">{feature.place_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
