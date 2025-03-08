import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import useTimelineEvents from "@/hooks/use-timeline-events";
import Scene from "./scene";
import StateManager, {
  DESIGN_LOAD,
  ADD_VIDEO,
  ADD_CAPTIONS,
} from "@designcombo/state";
import { ControlItem } from "./control-item";
import ControlList from "./control-list";
import { useEffect, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { generateId } from "@designcombo/timeline";
import { ImperativePanelHandle } from "react-resizable-panels";
import { dispatch } from "@designcombo/events";
import { data, empty, emptyDesignWidthMagneticTrack } from "./data";
import { useVideoContext } from "@/components/context/VideoProvider";

const stateManager = new StateManager({
  size: {
    width: 1920,
    height: 1080,
  },
  scale: {
    // 1x distance (second 0 to second 5, 5 segments).
    index: 7,
    unit: 300,
    zoom: 1 / 300,
    segments: 5,
  },
});

const App = () => {
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const { timeline, playerRef } = useStore();
  const { subtitle, inputVideo, reset } = useVideoContext();
  useTimelineEvents();

  useEffect(() => {
    if (!timeline) return;
    dispatch(DESIGN_LOAD, {
      payload: emptyDesignWidthMagneticTrack,
    });
  }, [timeline]);

  const checkVideoLoaded = async (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;

      video.onloadeddata = () => {
        resolve(true);
      };

      // Optional: Add timeout and error handling
      video.onerror = () => {
        resolve(false);
      };
    });
  };

  useEffect(() => {
    const handleVideoAndCaption = async () => {
      if (inputVideo) {
        // First dispatch ADD_VIDEO
        const videoId = generateId();
        dispatch(ADD_VIDEO, {
          payload: {
            id: videoId,
            details: {
              src: inputVideo,
              left: "26.5%",
              top: "25%",
              transform: "scale(2)",
            },
          },
          options: {
            resourceId: "main",
            scaleMode: "fit",
          },
        });

        // Wait for video to load
        const isLoaded = await checkVideoLoaded(inputVideo);

        if (isLoaded && subtitle && subtitle.length > 0) {
          // Now dispatch ADD_CAPTION after video is loaded
          dispatch(ADD_CAPTIONS, {
            payload: subtitle.map((_) => ({
              ..._,
              metadata: {
                ..._.metadata,
                parentId: videoId,
              },
            })),
          });
        }
      }
    };

    handleVideoAndCaption();
  }, [inputVideo, subtitle]);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desiredHeight = 300;
    const percentage = (desiredHeight / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  }, []);

  const handleTimelineResize = () => {
    const timelineContainer = document.getElementById("timeline-container");
    if (!timelineContainer) return;

    timeline?.resize(
      {
        height: timelineContainer.clientHeight - 90,
        width: timelineContainer.clientWidth - 40,
      },
      {
        force: true,
      },
    );
  };

  useEffect(() => {
    const onResize = () => handleTimelineResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [timeline]);

  return (
    <ResizablePanelGroup style={{ height: "100vh" }} direction="vertical">
      <ResizablePanel className="relative" defaultSize={70}>
        <Navbar />
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <MenuList />
          <MenuItem />
          <ControlList />
          <ControlItem />
          <Scene stateManager={stateManager} />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        className="min-h-[50px]"
        ref={timelinePanelRef}
        defaultSize={45}
        onResize={handleTimelineResize}
      >
        {playerRef && <Timeline stateManager={stateManager} />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default App;
