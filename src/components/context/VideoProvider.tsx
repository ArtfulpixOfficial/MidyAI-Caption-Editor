import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the structure of the context's value
interface VideoContextType {
  inputVideo: File | string | null;
  language: { name: string; code: string };
  setLanguage: (language: { name: string; code: string }) => void;
  setInputVideo: any;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  subtitle: any;
  setSubtitle: (subtitle: any) => void;
  loadingStatus: string;
  setLoadingStatus: (loadingStatus: string) => void;
  reset: () => void;
}

// Create the context with a default value
const VideoContext = createContext<VideoContextType>({
  inputVideo: null,
  language: { name: "English", code: "en" },
  setLanguage: () => {},
  setInputVideo: () => {},
  isLoading: false,
  setIsLoading: () => {},
  subtitle: "",
  setSubtitle: () => {},
  loadingStatus: "",
  setLoadingStatus: () => {},
  reset: () => {},
});

// Define the props for the provider component
interface CustomVideoProviderProps {
  children: ReactNode;
}

const CustomVideoProvider: React.FC<CustomVideoProviderProps> = ({
  children,
}) => {
  const [inputVideo, setInputVideo] = useState<File | null>(null);
  const [language, setLanguage] = useState<{ name: string; code: string }>({
    name: "English",
    code: "en",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subtitle, setSubtitle] = useState<string>("");
  const [loadingStatus, setLoadingStatus] = useState<string>("");

  const reset = () => {
    setLanguage({
      name: "English",
      code: "en",
    });
    setSubtitle("");
    setIsLoading(false);
    setLoadingStatus("");
    setInputVideo(null);
  };
  return (
    <VideoContext.Provider
      value={{
        inputVideo,
        language,
        setLanguage,
        setInputVideo,
        isLoading,
        setIsLoading,
        subtitle,
        setSubtitle,
        loadingStatus,
        setLoadingStatus,
        reset,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

// Custom hook to use the VideoContext
const useVideoContext = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error(
      "useVideoContext must be used within a CustomVideoProvider"
    );
  }
  return context;
};

export { CustomVideoProvider, useVideoContext };
