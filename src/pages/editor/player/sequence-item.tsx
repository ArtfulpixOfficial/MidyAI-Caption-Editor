/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence } from "remotion";
import TextLayer from "./editable-text";
import { IAudio, IImage, IItem, IText, IVideo } from "@designcombo/types";
import { ICaptionExtended } from "@/interfaces/captions";
import useStore from "../store/use-store";
import { useCurrentPlayerFrame } from "@/hooks/use-current-frame";
import { calculateFrames } from "../utils/frames";
import { Animated } from "./animated";
import { CaptionWord } from "./CaptionWord";
import {
  calculateContainerStyles,
  calculateMediaStyles,
  calculateTextStyles,
} from "./styles";
import { getAnimations } from "../utils/get-animations";

const REMOTION_SAFE_FRAME = 1;
interface SequenceItemOptions {
  handleTextChange?: (id: string, text: string) => void;
  fps: number;
  editableTextId?: string | null;
  currentTime?: number;
  zIndex?: number;
  active?: boolean;
  onTextBlur?: (id: string, text: string) => void;
}

export const SequenceItem: Record<
  string,
  (item: IItem, options: SequenceItemOptions) => JSX.Element
> = {
  text: (item, options: SequenceItemOptions) => {
    const { handleTextChange, onTextBlur, fps, editableTextId, zIndex } =
      options;
    const { id, details, animations } = item as IText;
    const { from, durationInFrames } = calculateFrames(item.display, fps);
    const { animationIn, animationOut } = getAnimations(animations!, item);
    return (
      <Sequence
        key={item.id}
        from={from}
        durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
        style={{ pointerEvents: "none", zIndex }}
      >
        {/* positioning layer */}
        <AbsoluteFill
          data-track-item="transition-element"
          className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
          style={calculateContainerStyles(details)}
        >
          {/* animation layer */}
          <Animated
            style={calculateContainerStyles(details)}
            animationIn={editableTextId === id ? null : animationIn}
            animationOut={editableTextId === id ? null : animationOut}
            durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
          >
            {/* text layer */}
            <TextLayer
              key={id}
              id={id}
              content={details.text}
              editable={editableTextId === id}
              onChange={handleTextChange}
              onBlur={onTextBlur}
              style={calculateTextStyles(details)}
            />
          </Animated>
        </AbsoluteFill>
      </Sequence>
    );
  },
  caption: (item, options: SequenceItemOptions) => {
    const { fps, zIndex, handleTextChange, onTextBlur, editableTextId } =
      options;
    const { id, details, metadata, display, animations } =
      item as ICaptionExtended;
    const { from, durationInFrames } = calculateFrames(item.display, fps);
    const { animationIn, animationOut } = getAnimations(animations!, item);
    const [firstWord] = metadata.words;
    const offsetFrom = display.from - firstWord.start;
    // Get caption styling options from details if available
    const activeColor = details.activeColor || "#50FF12";
    const activeBackgroundColor = details.activeBackgroundColor || "#7E12FF";
    // console.log(item.metadata.words);
    return (
      <Sequence
        key={item.id}
        from={from}
        durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
        data-track-item="transition-element"
        style={{ pointerEvents: "none", zIndex }}
      >
        {/* positioning layer */}
        <AbsoluteFill
          data-track-item="transition-element"
          className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
          style={calculateContainerStyles(details)}
        >
          <Animated
            style={calculateContainerStyles(details)}
            animationIn={editableTextId === id ? null : animationIn}
            animationOut={editableTextId === id ? null : animationOut}
            durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
          >
            {editableTextId === id ? (
              // Show TextLayer when in edit mode
              <TextLayer
                key={id}
                id={id}
                // Use the full text from metadata words
                content={metadata.words.map((word) => word.word).join(" ")}
                editable={true}
                onChange={(id, text) => {
                  handleTextChange?.(id, text);
                }}
                onBlur={(id, text) => {
                  // When editing is done, update the text and timing data
                  onTextBlur?.(id, text);
                }}
                style={{
                  ...calculateTextStyles(details),
                  // WebkitTextStroke: "10px #000000",
                  paintOrder: "stroke fill",
                }}
              />
            ) : (
              // Show animated caption words when not in edit mode
              <div
                style={{
                  ...calculateTextStyles(details),
                  // WebkitTextStroke: "10px #000000",
                  paintOrder: "stroke fill",
                }}
              >
                {item.metadata.words.map((word: any, index: number) => (
                  <CaptionWord
                    offsetFrom={offsetFrom}
                    word={word}
                    key={index}
                    captionColor={details.color}
                    activeColor={activeColor}
                    activeBackgroundColor={activeBackgroundColor}
                  />
                ))}
              </div>
            )}
            {/* <div
              style={{
                ...calculateTextStyles(details),
                WebkitTextStroke: "10px #000000",
                paintOrder: "stroke fill",
              }}
            >
              {item.metadata.words.map((word: any, index: number) => (
                <CaptionWord
                  offsetFrom={offsetFrom}
                  word={word}
                  key={index}
                  captionColor={details.color}
                  activeColor={activeColor}
                  activeBackgroundColor={activeBackgroundColor}
                />
              ))}
            </div> */}

            {/* <TextLayer
              key={id}
              id={id}
              content={details.text}
              editable={editableTextId === id}
              onChange={handleTextChange}
              onBlur={onTextBlur}
              style={calculateTextStyles(details)}
            /> */}
          </Animated>
        </AbsoluteFill>
      </Sequence>
    );
  },
  image: (item, options: SequenceItemOptions) => {
    const { fps, zIndex } = options;
    const { details, animations } = item as IImage;
    const { from, durationInFrames } = calculateFrames(item.display, fps);
    const { animationIn, animationOut } = getAnimations(animations!, item);
    const crop = details.crop || {
      x: 0,
      y: 0,
      width: item.details.width,
      height: item.details.height,
    };
    return (
      <Sequence
        key={item.id}
        from={from}
        durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
        style={{ pointerEvents: "none", zIndex }}
      >
        {/* position layer */}
        <AbsoluteFill
          data-track-item="transition-element"
          className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
          style={calculateContainerStyles(details, crop)}
        >
          {/* animation layer */}
          <Animated
            style={calculateContainerStyles(details, crop, {
              overflow: "hidden",
            })}
            animationIn={animationIn!}
            animationOut={animationOut!}
            durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
          >
            <div style={calculateMediaStyles(details, crop)}>
              <Img data-id={item.id} src={details.src} />
            </div>
          </Animated>
        </AbsoluteFill>
      </Sequence>
    );
  },
  video: (item, options: SequenceItemOptions) => {
    const { fps, zIndex } = options;
    const { details, animations } = item as IVideo;
    const { animationIn, animationOut } = getAnimations(animations!, item);
    const playbackRate = item.playbackRate || 1;
    const { from, durationInFrames } = calculateFrames(
      {
        from: item.display.from / playbackRate,
        to: item.display.to / playbackRate,
      },
      fps
    );
    const crop = details.crop || {
      x: 0,
      y: 0,
      width: item.details.width,
      height: item.details.height,
    };

    return (
      <Sequence
        key={item.id}
        from={from}
        durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
        style={{ pointerEvents: "none", zIndex }}
      >
        <AbsoluteFill
          data-track-item="transition-element"
          className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
          style={calculateContainerStyles(details, crop)}
        >
          {/* animation layer */}
          <Animated
            style={calculateContainerStyles(details, crop, {
              overflow: "hidden",
            })}
            animationIn={animationIn}
            animationOut={animationOut}
            durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
          >
            <div style={calculateMediaStyles(details, crop)}>
              <OffthreadVideo
                startFrom={(item.trim?.from! / 1000) * fps}
                endAt={(item.trim?.to! / 1000) * fps}
                playbackRate={playbackRate}
                src={details.src}
                volume={details.volume || 0 / 100}
              />
            </div>
          </Animated>
        </AbsoluteFill>
      </Sequence>
    );
  },
  audio: (item, options: SequenceItemOptions) => {
    const { fps, zIndex } = options;
    const { details } = item as IAudio;
    const playbackRate = item.playbackRate || 1;
    const { from, durationInFrames } = calculateFrames(
      {
        from: item.display.from / playbackRate,
        to: item.display.to / playbackRate,
      },
      fps
    );
    return (
      <Sequence
        key={item.id}
        from={from}
        durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
        style={{
          userSelect: "none",
          pointerEvents: "none",
          zIndex,
        }}
      >
        <AbsoluteFill>
          <Audio
            startFrom={(item.trim?.from! / 1000) * fps}
            endAt={(item.trim?.to! / 1000) * fps}
            playbackRate={playbackRate}
            src={details.src}
            volume={details.volume! / 100}
          />
        </AbsoluteFill>
      </Sequence>
    );
  },
};
