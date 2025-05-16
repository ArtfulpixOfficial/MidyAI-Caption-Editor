import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import useStore from "../store/use-store";
import { dispatch } from "@designcombo/events";
import { PLAYER_SEEK } from "@/global";
import { ICaptionExtended } from "@/interfaces/captions";
import { useCurrentPlayerFrame } from "@/hooks/use-current-frame";

export const Captions = () => {
  const { trackItemsMap, tracks, playerRef } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef!);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Convert current frame to milliseconds (assuming 30fps)
  const currentTimeMs = (currentFrame / 30) * 1000;

  // Get all captions and sort them by start time
  const getCaptions = () => {
    const captions: ICaptionExtended[] = [];
    Object.keys(trackItemsMap).forEach((itemId) => {
      const item = trackItemsMap[itemId];
      if (item && item.type === "caption") {
        captions.push(item as ICaptionExtended);
      }
    });

    return captions.sort((a, b) => a.display.from - b.display.from);
  };

  const handleCaptionClick = (caption: ICaptionExtended) => {
    // Seek to the start time of the caption
    dispatch(PLAYER_SEEK, {
      payload: {
        time: caption.display.from,
      },
    });
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    const milliseconds = ms % 1000;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const isCaptionActive = (caption: ICaptionExtended) => {
    return (
      currentTimeMs >= caption.display.from &&
      currentTimeMs < caption.display.to
    );
  };

  // Add this useEffect for auto-scrolling
  useEffect(() => {
    const activeCaption = getCaptions().find(isCaptionActive);
    if (activeCaption) {
      const activeCaptionElement = document.getElementById(
        `caption-${activeCaption.id}`
      );
      if (activeCaptionElement && scrollAreaRef.current) {
        activeCaptionElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentTimeMs]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-md text-text-primary flex h-12 flex-none items-center px-4 font-medium">
        Captions
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4" ref={scrollAreaRef}>
          {getCaptions().map((caption, index) => (
            <div
              key={caption.id}
              id={`caption-${caption.id}`}
              onClick={() => handleCaptionClick(caption)}
              className={`group flex cursor-pointer flex-col gap-1.5 rounded-lg p-4 transition-all
                ${
                  isCaptionActive(caption)
                    ? "bg-zinc-800/80 border border-zinc-700"
                    : "bg-zinc-900/50 hover:bg-zinc-900/70"
                }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    isCaptionActive(caption) ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {formatTime(caption.display.from)} -
                  {formatTime(caption.display.to)}
                </span>
                <span className="text-xs text-zinc-500">
                  Caption {index + 1}
                </span>
              </div>

              <div
                className={`line-clamp-2 text-sm ${
                  isCaptionActive(caption) ? "text-white" : "text-zinc-100"
                }`}
              >
                {caption.metadata.words.map((word) => word.word).join(" ")}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
