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
import { OpenAiToCaptionsInput } from "@remotion/openai-whisper";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { DEFAULT_FONT } from "./data/fonts";
// import { getCaptionLines, getCaptions } from "./pages/editor/utils/captions";
// import { Segment } from "./pages/editor/utils/captions";
import { generateCaptions as gC } from "./pages/editor/utils/captions";
import { Hourglass } from "react-loader-spinner";
const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const openAiWhisperApiToCaptions = ({ transcription }) => {
  const captions = [];

  if (!transcription.words) {
    if (transcription.task && transcription.task !== "transcribe") {
      throw new Error(
        `The transcription does need to be a "transcribe" task. The input you gave is "task": "${transcription.task}"`
      );
    }

    throw new Error(
      'The transcription does need to be been generated with `timestamp_granularities: ["word"]`'
    );
  }

  let remainingText = transcription.text;

  for (const word of transcription.words) {
    const punctuation = `\\?,\\.\\%\\–\\!\\;\\:\\'\\"\\-\\_\\(\\)\\[\\]\\{\\}\\@\\#\\$\\^\\&\\*\\+\\=\\/\\|\\<\\>\\~\``;
    const match = new RegExp(
      `^([\\s${punctuation}]{0,4})${word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([${punctuation}]{0,3})?`
    ).exec(remainingText);
    if (!match) {
      throw new Error(
        `Unable to parse punctuation from OpenAI Whisper output. Could not find word "${word.word}" in text "${remainingText.slice(0, 100)}". File an issue under https://remotion.dev/issue to ask for a fix.`
      );
    }

    const foundText = match[0];
    remainingText = remainingText.slice(foundText.length);

    captions.push({
      confidence: null,
      endMs: word.end * 1000,
      startMs: word.start * 1000,
      text: foundText,
      timestampMs: ((word.start + word.end) / 2) * 1000,
    });
  }

  return { captions };
};
export default function App() {
  // const { user } = useAuthStore();
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

  async function extractAudioWithTransloadit(file: File): Promise<Blob> {
    const params = {
      auth: { key: "27b2cd5d68c14992cb056ff350f29e60" },
      steps: {
        audio_extract: {
          robot: "/audio/encode",
          use: ":original",
          preset: "mp3",
          bitrate: 128000, // Lower bitrate since it's just for Whisper
          ffmpeg_stack: "v6.0.0",
        },
      },
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("params", JSON.stringify(params));

    const response = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData,
    });

    const assembly = await response.json();

    // Poll for completion
    let result;
    for (let i = 0; i < 30; i++) {
      const statusResponse = await fetch(
        `https://api2.transloadit.com/assemblies/${assembly.assembly_id}`
      );
      result = await statusResponse.json();

      if (result.ok === "ASSEMBLY_COMPLETED") {
        break;
      } else if (
        result.ok === "ASSEMBLY_CANCELED" ||
        result.ok === "ASSEMBLY_FAILED"
      ) {
        throw new Error("Audio extraction failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Get the audio file
    const audioUrl = result.results.audio_extract[0].ssl_url;
    const audioResponse = await fetch(audioUrl);
    return await audioResponse.blob();
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

    // 2. Extract audio using Transloadit
    setLoadingStatus("Extracting audio...");
    const audioBlob = await extractAudioWithTransloadit(file);

    setLoadingStatus("Generating Subtitles");
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: new File([audioBlob], "audio.mp3", { type: "audio/mp3" }),
      response_format: "verbose_json",
      language: language.code,
      timestamp_granularities: ["word"],
    });
    console.log(transcription);

    const initialCaptions = gC(
      {
        sourceUrl: videoPublicUrl,
        results: {
          main: {
            words: transcription.words,
          },
        },
      },
      {
        fontUrl: DEFAULT_FONT.url,
        fontFamily: DEFAULT_FONT.postScriptName,
        fontSize: 80,
      },
      {
        containerWidth: 800,
        linesPerCaption: 1,
        parentId: null,
        displayFrom: 0,
      }
    );
    // console.log(transcription);
    // const { captions } = openAiWhisperApiToCaptions({
    //   transcription,
    // } as OpenAiToCaptionsInput);
    // console.log(captions);

    // const { pages } = createTikTokStyleCaptions({
    //   captions,
    //   combineTokensWithinMilliseconds: 1200,
    // });
    await loadFonts([
      {
        name: DEFAULT_FONT.fullName,
        url: DEFAULT_FONT.url,
      },
    ]);

    // const captionLines = getCaptionLines(
    //   {
    //     segments: pages.map((sub) => {
    //       return {
    //         start: sub.startMs,
    //         end: sub.tokens.at(-1)?.toMs,
    //         text: sub.text,
    //         words: sub.tokens.map((tok: any) => {
    //           return {
    //             word: tok.text,
    //             start: tok.fromMs,
    //             end: tok.toMs,
    //           };
    //         }),
    //       };
    //     }) as Segment[],
    //   },
    //   30,
    //   DEFAULT_FONT.postScriptName,
    //   800,
    // );

    // const processedCaptions = getCaptions(captionLines);
    setSubtitle(initialCaptions);
    setIsLoading(false);
    setLoadingStatus("Done");
    setUploadedFile(null);
    console.log(initialCaptions);
  }
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
