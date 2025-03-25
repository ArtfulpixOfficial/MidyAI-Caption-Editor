import { ICaption, ICaptionDetails } from "@designcombo/types";

export interface Word {
  end: number;
  start: number;
  word: string;
}
export interface CaptionsSegment {
  start: number;
  end: number;
  text: string;
  words: Word[];
}
export interface CaptionsData {
  segments: CaptionsSegment[];
}

// Extended interface with new properties
export interface ICaptionDetailsExtended extends ICaptionDetails {
  activeColor?: string;
  activeBackgroundColor?: string;
}
// Extended caption interface
export interface ICaptionExtended extends Omit<ICaption, "details"> {
  details: ICaptionDetailsExtended;
}
