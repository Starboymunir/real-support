"use client";

import { ComponentProps, useEffect, useState } from "react";
import Image from "next/image";
import { getUrl } from "aws-amplify/storage";

export function AppImage(
  props: ComponentProps<typeof Image> & { defaultTo?: string }
) {
  const [url, setUrl] = useState<(typeof props)["src"] | null>(null);

  useEffect(() => {
    console.log("AppImage mounted");
  }, []);

  useEffect(() => {
    if (typeof props.src != "string") {
      setUrl(props.src ?? props.defaultTo ?? null);
      return;
    }

    if (
      props.src.startsWith("public/") ||
      props.src.startsWith("protected/") ||
      props.src.startsWith("private/")
    ) {
      console.log("getting url");

      getUrl({ path: props.src, options: { validateObjectExistence: false } })
        .then((url) => {
          setUrl(url.url.toString());
        })
        .catch((e) => {
          console.error(e);
          setUrl(props.defaultTo || null);
        });

      return;
    }

    setUrl(props.src);
  }, [props.src, props.defaultTo]);

  if (!url) return <div className={props.className}>No Image</div>;

  return <Image {...props} src={url} alt={props.alt} />;
}
