/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import useStore from "../store/use-store";
import { useCurrentPlayerFrame } from "@/hooks/use-current-frame";
interface WordSpanProps {
  isActive: boolean;
  activeBackgroundColor: string;
  activeColor: string;
  color: string;
  // textDecoration: string;
}

const WordSpan = styled.span<WordSpanProps>`
  position: relative;
  display: inline-block;
  padding: 0 0.2em;
  color: ${(props) => props.color};
  text-decoration: inherit;
  border-radius: 16px;

  z-index: 99;
  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    // background-color: transparent;
    border-radius: 0.1em;
    left: -0.2em;
    right: -0.2em;
    top: 0;
    bottom: 0;
    transition: background-color 0.2s ease;
    border-radius: 16px;
  }

  ${(props) =>
    props.isActive &&
    css`
      color: ${props.activeColor};
      &::before {
        background-color: ${props.activeBackgroundColor};
      }
    `}
`;

export const CaptionWord = ({
  word,
  offsetFrom,
  captionColor,
  activeColor = "#50FF12",
  activeBackgroundColor = "#7E12FF",
  // textDecoration = "none",
}: {
  word: any;
  offsetFrom: number;
  captionColor: string;
  activeColor: string; // Default value in case no prop is provided
  activeBackgroundColor: string;
  // textDecoration: string;
}) => {
  const { playerRef } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef!);
  const { start, end } = word;
  const startAtFrame = ((start + offsetFrom) / 1000) * 30;
  const endAtFrame = ((end + offsetFrom) / 1000) * 30;
  const isActive = currentFrame > startAtFrame && currentFrame < endAtFrame;

  return (
    <WordSpan
      isActive={isActive}
      activeColor={activeColor}
      activeBackgroundColor={activeBackgroundColor} // You can make this dynamic by passing it as a prop or from a theme
      color={captionColor}
      // textDecoration={textDecoration}
    >
      {word.word}
    </WordSpan>
  );
};
