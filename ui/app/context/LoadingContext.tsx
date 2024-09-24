'use client'
import React, { createContext, useState, useContext, ReactNode } from "react";

// Define context type
type LoadingContextType = {
  loading: boolean;
  loadEvent: string; // Add loadEvent to the context type
  setLoading: (state: boolean, event?: string) => void;
};

// Create the context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Provider component
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoadingState] = useState(false);
  const [loadEvent, setLoadEvent] = useState("");

  // Updated setLoading to handle both loading state and loadEvent
  const setLoading = (state: boolean, event: string = "") => {
    setLoadingState(state);
    setLoadEvent(event); // Update loadEvent
  };

  return (
    <LoadingContext.Provider value={{ loading, loadEvent, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the context
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
