import { CalculateMetadataFunction } from "remotion";
// import { MetadataProps } from "../types";
import { IDesign, ISize, ITrackItemAndDetails } from "@designcombo/types";
// import { DEFAULT_FPS, NOT_FOUND_IMAGE_URL } from "../constants";

export type MetadataProps = {
  design: IDesign;
  size: {
    width: number;
    height: number;
  };
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const NOT_FOUND_IMAGE_URL =
  "https://remotion-images-video.s3.amazonaws.com/not_found.jpg";
type Props = {
  design: IDesign;
  size: ISize;
};

export const calcMetadata: CalculateMetadataFunction<MetadataProps> = async ({
  props,
}: {
  props: Props;
}) => {
  console.log(props);
  const { design } = props;
  const fps = design.fps ? design.fps : 30;

  const trackItems = design.trackItemsMap as Record<
    string,
    ITrackItemAndDetails
  >;

  for (const key in trackItems) {
    const trackItem = trackItems[key];
    if (trackItem.type === "image") {
      try {
        const response = await fetch(trackItem.details.src);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
      } catch (err) {
        trackItems[key] = {
          ...trackItem,
          details: {
            ...trackItem.details,
            src: NOT_FOUND_IMAGE_URL,
          },
        };
      }
    }
  }

  return {
    fps,
    durationInFrames: design.duration
      ? Math.floor((design.duration / 1000) * fps)
      : undefined,
    width: design.size.width,
    height: design.size.height,
    props: {
      ...props,
      size: design.size,
    },
  };
};
