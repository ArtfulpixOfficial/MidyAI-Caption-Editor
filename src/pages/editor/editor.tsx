import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import useTimelineEvents from "@/hooks/use-timeline-events";
import Scene from "./scene";
import StateManager from "@designcombo/state";
import { ControlItem } from "./control-item";
import ControlList from "./control-list";
import { useEffect } from "react";
import {
  DESIGN_LOAD,
  dispatch,
  ADD_VIDEO,
  ADD_CAPTION,
} from "@designcombo/events";

import { data1 } from "./data";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import { useVideoContext } from "@/components/context/VideoProvider";
const stateManager = new StateManager();

function App() {
  const { playerRef, activeIds } = useStore();
  const { subtitle, inputVideo, reset } = useVideoContext();

  useTimelineEvents();

  useEffect(() => {
    dispatch(DESIGN_LOAD, {
      payload: data1,
    });
  }, []);
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
        dispatch(ADD_VIDEO, {
          payload: {
            id: generateId(),
            details: {
              src: inputVideo,
            },
          },
          options: {
            resourceId: "main",
          },
        });

        // Wait for video to load
        const isLoaded = await checkVideoLoaded(inputVideo);

        if (isLoaded && subtitle) {
          // Now dispatch ADD_CAPTION after video is loaded
          dispatch(ADD_CAPTION, {
            payload: subtitle,
          });
        }
      }
    };

    handleVideoAndCaption();
  }, [inputVideo, subtitle]);
  // useEffect(() => {
  //   if (inputVideo) {
  //     dispatch(ADD_VIDEO, {
  //       payload: {
  //         id: generateId(),
  //         details: {
  //           src: inputVideo,
  //         },
  //       } as IVideo,
  //       options: {
  //         resourceId: "main",
  //       },
  //     });
  //   }
  // }, []);
  // console.log(activeIds);
  // console.log(playerRef);
  // useEffect(() => {
  //   if (subtitle) {
  //     setTimeout(() => {
  //       dispatch(ADD_CAPTION, {
  //         payload: subtitle,
  //       });
  //     }, 2000);
  //   }
  // }, []);

  return (
    <div className="relative flex h-screen w-screen flex-col bg-background">
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
      <div className="h-60 w-full">
        {playerRef && <Timeline stateManager={stateManager} />}
      </div>
    </div>
  );
}

export default App;
