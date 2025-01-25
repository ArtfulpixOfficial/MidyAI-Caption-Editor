import { useEffect, useState } from "react";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import Editor from "./pages/editor";
import useDataState from "./pages/editor/store/use-data-state";
import { getCompactFontData, loadFonts } from "./pages/editor/utils/fonts";
import { FONTS } from "./data/fonts";
import { Message } from "./components/ui/message";
import UploadFile from "./components/ui/uploadFile";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { languages } from "./data/languages";
import { useVideoContext } from "./components/context/VideoProvider";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import {
  openAiWhisperApiToCaptions,
  OpenAiToCaptionsInput,
} from "@remotion/openai-whisper";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { DEFAULT_FONT } from "./data/fonts";
import { getCaptionLines, getCaptions } from "./pages/editor/utils/captions";
import { Segment } from "./pages/editor/utils/captions";
import { Hourglass } from "react-loader-spinner";
const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function App() {
  const { setCompactFonts, setFonts } = useDataState();
  const {
    language,
    setLanguage,
    setLoadingStatus,
    loadingStatus,
    isLoading,
    setIsLoading,

    setInputVideo,
    subtitle,
    setSubtitle,
  } = useVideoContext();
  const [uploadedFile, setUploadedFile] = useState(null);
  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);
  async function onFileChange(file: any) {
    setUploadedFile(file);
  }
  async function generateCaptions() {
    if (!uploadedFile || !language) return;
    const file: File | null = uploadedFile;
    setLoadingStatus("Uploading...");
    setIsLoading(true);
    // Uploading Input Video to Supabase
    const tempName = Date.now();
    await supabaseClient.storage
      .from("Caption input and output video bucket")
      .upload(`videos/inputVideo_${tempName}${file.name.slice(-4)}`, file, {
        upsert: true,
      });

    const videoPublicUrl = supabaseClient.storage
      .from("Caption input and output video bucket")
      .getPublicUrl(`videos/inputVideo_${tempName}${file.name.slice(-4)}`)
      .data.publicUrl;
    setInputVideo(videoPublicUrl);
    setLoadingStatus("Generating Subtitles");
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
      response_format: "verbose_json",
      language: language.code,
      timestamp_granularities: ["word"],
    });

    // console.log(transcription);
    const { captions } = openAiWhisperApiToCaptions({
      transcription,
    } as OpenAiToCaptionsInput);
    console.log(captions);

    const { pages } = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: 1200,
    });
    await loadFonts([
      {
        name: DEFAULT_FONT.fullName,
        url: DEFAULT_FONT.url,
      },
    ]);

    const captionLines = getCaptionLines(
      {
        segments: pages.map((sub) => {
          return {
            start: sub.startMs,
            end: sub.tokens.at(-1)?.toMs,
            text: sub.text,
            words: sub.tokens.map((tok: any) => {
              return {
                word: tok.text,
                start: tok.fromMs,
                end: tok.toMs,
              };
            }),
          };
        }) as Segment[],
      },
      30,
      DEFAULT_FONT.postScriptName,
      800
    );

    const processedCaptions = getCaptions(captionLines);
    setSubtitle(processedCaptions);
    setIsLoading(false);
    setLoadingStatus("Done");
    setUploadedFile(null);
    console.log(processedCaptions);
    // console.log(
    //   pages.map((sub) => {
    //     return {
    //       start: sub.startMs,
    //       end: sub.tokens.at(-1)?.toMs,
    //       text: sub.text,
    //       words: sub.tokens.map((tok: any) => {
    //         return {
    //           word: tok.text,
    //           start: tok.fromMs,
    //           end: tok.toMs,
    //         };
    //       }),
    //     };
    //   }),
    // );
  }
  // return (
  //   <AnimatedCircularProgressBar
  //     max={100}
  //     min={0}
  //     value={0}
  //     gaugePrimaryColor="#fff"
  //     gaugeSecondaryColor="#000"
  //   />
  // );
  if (!subtitle)
    return (
      <div className="flex flex-col items-center justify-center pt-5">
        {isLoading && (
          <>
            <Hourglass
              visible={true}
              height="100"
              width="100"
              ariaLabel="hourglass-loading"
              wrapperStyle={{}}
              wrapperClass=""
              colors={["#fff", "#424b5a"]}
            />
            <h1>{loadingStatus}</h1>
            <h2>(Please Wait, This can take some minutes)</h2>
          </>
        )}
        {!uploadedFile && !isLoading && (
          <>
            <Message />
            <UploadFile onFileChange={onFileChange} />
          </>
        )}
        {uploadedFile && !isLoading && (
          <video
            controls
            width={850}
            height={500}
            src={URL.createObjectURL(uploadedFile)}
            className="original-image"
            id="blurred"
            style={{
              border: "none",
              borderRadius: "20px",
            }}
          />
        )}

        {!isLoading && (
          <div className="mt-5 flex w-full items-center justify-center gap-5">
            <div className="col-2 flex flex-col items-center">
              <label className="text-800 font-semibold text-white">
                Captions Language
              </label>
              <Dropdown
                value={language}
                options={languages}
                onChange={(e) => setLanguage(e.value)}
                placeholder="Captions Language"
                optionLabel="name"
                className="mt-2 w-full px-5"
                checkmark
              />
            </div>
            <div className="col-2 flex items-center justify-center pt-7">
              <Button
                // className="btnBack show col py-3"
                // severity="contrast"
                className="bg-white px-5 py-3 text-black"
                // severity="success"
                rounded
                label="Generate Captions"
                onClick={generateCaptions}
              />
            </div>
          </div>
        )}
      </div>
    );
  return <Editor />;
}
