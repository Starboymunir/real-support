"use client";
import React, { useEffect } from "react";

export const usePersistForm = ({ value, localStorageKey }) => {
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(value));

  }, [value, localStorageKey]);

  return;
};

