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

interface GooglePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
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
  const [results, setResults] = useState<GooglePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string>(crypto.randomUUID());

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
    if (!text || text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        input: text,
        sessiontoken: sessionTokenRef.current,
      });
      const res = await fetch(`/api/places/autocomplete?${params}`);
      const data = await res.json();
      setResults(data.predictions || []);
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
    debounceRef.current = setTimeout(() => search(text), 300);
  };

  const handleSelect = async (prediction: GooglePrediction) => {
    setQuery(prediction.description);
    setIsOpen(false);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        place_id: prediction.place_id,
        sessiontoken: sessionTokenRef.current,
      });
      const res = await fetch(`/api/places/details?${params}`);
      const data = await res.json();
      const result = data.result;

      // New session token for next search+select cycle
      sessionTokenRef.current = crypto.randomUUID();

      let city = '';
      let postcode = '';
      for (const comp of result.address_components || []) {
        if (comp.types.includes('postal_code')) postcode = comp.short_name;
        if (comp.types.includes('locality') || comp.types.includes('postal_town'))
          city = city || comp.long_name;
      }

      const place: PlaceResult = {
        name: prediction.structured_formatting.main_text,
        fullAddress: prediction.description,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        city,
        postcode,
      };

      onSelect(place);
    } catch {
      // If place details fail, still update text
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode with Mapbox (no CORS issues)
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place&limit=1&language=en`
          );
          const data = await res.json();
          const feature = data.features?.[0];
          if (feature) {
            const cityCtx = feature.context?.find((c: { id: string }) => c.id.startsWith('place'))?.text;
            const postcodeCtx = feature.context?.find((c: { id: string }) => c.id.startsWith('postcode'))?.text;
            const place: PlaceResult = {
              name: feature.text,
              fullAddress: feature.place_name,
              lng: feature.center[0],
              lat: feature.center[1],
              city: cityCtx || feature.text,
              postcode: postcodeCtx || '',
            };
            setQuery(feature.place_name);
            onSelect(place);
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
          {results.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handleSelect(prediction)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.04] last:border-0"
            >
              <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{prediction.structured_formatting.main_text}</p>
                <p className="text-xs text-white/40 truncate">{prediction.structured_formatting.secondary_text}</p>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 border-t border-white/[0.04] flex justify-end">
            <img src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-non-white.png" alt="Powered by Google" className="h-3 opacity-50" />
          </div>
        </div>
      )}
    </div>
  );
}
