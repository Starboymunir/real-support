"use client";

import { m } from "framer-motion";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CompactLayout from "@/app/(RSAdmin)/admin/layouts/compact";
import { RouterLink } from "@/app/(RSAdmin)/admin/routes/components";
import {
  MotionContainer,
  varBounce,
} from "@/app/(RSAdmin)/admin/common/animate";
import { PageNotFoundIllustration } from "@/config/illustrations";
import { Suspense } from "react";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useSearchParams } from "next/navigation";

function NotFoundViewComponent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  return (
    <CompactLayout>
      <MotionContainer animate>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            Sorry, Page Not Found!
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: "text.secondary" }}>
            Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve
            mistyped the URL? Be sure to check your spelling.
          </Typography>
          {errorParam && (
            <Typography sx={{ color: "error.main", mt: 2 }}>
              Error: {errorParam}
            </Typography>
          )}
        </m.div>

        <m.div variants={varBounce().in}>
          <PageNotFoundIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>

        <Button
          component={RouterLink}
          href="/"
          size="large"
          variant="contained"
        >
          Go to Home
        </Button>
      </MotionContainer>
    </CompactLayout>
  );
}

export default function NotFoundView() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NotFoundViewComponent />
    </Suspense>
  );
}
