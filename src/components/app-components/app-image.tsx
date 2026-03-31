"use client";

import { ComponentProps, useEffect, useState } from "react";
import Image from "next/image";
import { resolveS3Url } from '@/lib/api';

export function AppImage(
  props: ComponentProps<typeof Image> & { defaultTo?: string }
) {
  const [url, setUrl] = useState<(typeof props)["src"] | null>(null);

  useEffect(() => {
    if (typeof props.src != "string") {
      setUrl(props.src ?? props.defaultTo ?? null);
      return;
    }

    // Route all string URLs through resolveS3Url so S3 keys and full S3 URLs
    // are proxied through the backend presigned endpoint
    setUrl(resolveS3Url(props.src) ?? props.defaultTo ?? null);
  }, [props.src, props.defaultTo]);

  if (!url) return <div className={props.className}>No Image</div>;

  return <Image {...props} src={url} alt={props.alt} />;
}
