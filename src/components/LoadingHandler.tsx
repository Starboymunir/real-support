"use client";
import { useAuthContext } from "@/providers/auth-providers";
import React, { ReactNode, useEffect } from "react";
import Loader from "./loader";

const LoadingHandler = ({ children }: { children: ReactNode }) => {
  const { loading } = useAuthContext();
  if (loading) {
    return <Loader />;
  }
  return <>{children}</>;
};

export default LoadingHandler;
