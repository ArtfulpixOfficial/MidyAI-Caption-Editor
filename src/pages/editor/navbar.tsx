import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { dispatch } from "@designcombo/events";
import { HISTORY_UNDO, HISTORY_REDO, DESIGN_RESIZE } from "@designcombo/state";
// import logoDark from "@/assets/logo-dark.png";
import { Icons } from "@/components/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { download } from "@/utils/download";
import { Toast } from "primereact/toast";
// import useAuthStore from "@/store/use-auth-store";
// import { useNavigate } from "react-router-dom";

// import {
//   Cloud,
//   CreditCard,
//   Github,
//   Keyboard,
//   LifeBuoy,
//   LogOut,
//   Mail,
//   MessageSquare,
//   Plus,
//   PlusCircle,
//   Settings,
//   User,
//   UserPlus,
//   Users,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuPortal,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useStore from "@/pages/editor/store/use-store";
import { generateId } from "@designcombo/timeline";
import { useVideoContext } from "@/components/context/VideoProvider";
const baseUrl = import.meta.env.VITE_BACKEND_URL;
// const baseUrl = "http://localhost:3001/api";
const size = {
  width: 1080,
  height: 1920,
};
//  https://renderer.designcombo.dev/status/{id}
export default function Navbar() {
  const { reset } = useVideoContext();
  const handleUndo = () => {
    dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    dispatch(HISTORY_REDO);
  };

  const openLink = (url: string) => {
    window.open(url, "_blank"); // '_blank' will open the link in a new tab
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 320px",
      }}
      className="pointer-events-none absolute left-0 right-0 top-0 z-[205] flex h-[72px] items-center px-2"
    >
      <div className="pointer-events-auto flex h-14 items-center gap-2">
        <div className="flex h-12 items-center bg-background px-1.5">
          <Button
            className="flex h-9 w-9 gap-1 border border-border"
            size="icon"
            variant="secondary"
            onClick={reset}
          >
            <Icons.arrowLeft width={18} />
          </Button>
          <Button
            onClick={handleUndo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.undo width={20} />
          </Button>
          <Button
            onClick={handleRedo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.redo width={20} />
          </Button>
        </div>
      </div>

      <div className="pointer-events-auto flex h-14 items-center justify-center gap-2">
        <div className="flex h-12 items-center gap-4 rounded-md bg-background px-2.5">
          <div className="px-1 text-sm font-medium">Workspace</div>
          <ResizeVideo />
        </div>
      </div>

      <div className="pointer-events-auto flex h-14 items-center justify-end gap-2">
        <div className="flex h-12 items-center gap-2 rounded-md bg-background px-2.5">
          {/* <Button
            className="flex gap-2 border border-border"
            onClick={() => openLink("https://discord.gg/jrZs3wZyM5")}
            variant="secondary"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 640 512"
              height={16}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
            </svg>
            Discord
          </Button> */}
          <DownloadPopover />
          {/* <UserMenu /> */}
        </div>
      </div>
    </div>
  );
}

interface IDownloadState {
  renderId: string;
  progress: number;
  isDownloading: boolean;
}
const DownloadPopover = () => {
  const toast: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [downloadState, setDownloadState] = useState<IDownloadState>({
    progress: 0,
    isDownloading: false,
    renderId: "",
  });
  const {
    tracks,
    trackItemIds,
    trackItemsMap,
    trackItemDetailsMap,
    transitionsMap,
    transitionIds,
    fps,
    size,
    duration,
    // sceneMoveableRef,
  } = useStore();

  const showError = () => {
    toast?.current.show({
      severity: "error",
      summary: "Error",
      detail: "Video Duration is more than allowed limit",
      life: 3000,
    });
  };
  const handleExport = async () => {
    const data = {
      id: generateId(),
      fps,
      tracks,
      size,
      trackItemDetailsMap,
      trackItemIds,
      transitionsMap,
      trackItemsMap,
      transitionIds,
      duration,
      durationInFrames: Math.ceil((duration / 1000) * fps),
      // sceneMoveableRef,
    };
    // console.log(data);
    if (Math.ceil(data.durationInFrames / 200) + 1 > 10) return showError();

    try {
      setDownloadState((prevState) => ({
        ...prevState,
        isDownloading: true,
        progress: 0,
      }));
      const renderedData = await (
        await fetch(`${baseUrl}/render`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      ).json();
      if (renderedData) {
        setDownloadState((prevState) => ({
          ...prevState,
          renderId: renderedData["renderId"],
        }));
      }
    } catch (err) {
      console.log(err);
      setDownloadState((prevState) => ({
        ...prevState,
        isDownloading: false,
        progress: 0,
        renderId: "",
      }));
    }

    // console.log(renderedData);
    // console.log(data);
    // console.log(JSON.stringify(data));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (downloadState.renderId) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(
            `${baseUrl}/render/status/${downloadState.renderId}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Calculate progress based on frames rendered vs total frames
          const framesRendered = data.framesRendered;
          // const encodingProgress = data.encodingStatus?.framesEncoded || 0;
          const isDone = data.done;

          // Calculate total progress (consider both rendering and encoding)
          let progress = 0;
          if (isDone) {
            progress = 100;
          } else if (framesRendered > 0) {
            // Assuming encoding takes about 20% of the total process
            // const renderingProgress =
            //   (framesRendered / (data.chunks * 30)) * 80; // 80% weight
            // const encodingProgress =
            //   ((data.encodingStatus?.framesEncoded || 0) / framesRendered) * 20; // 20% weight
            // progress = Math.min(
            //   Math.round(renderingProgress + encodingProgress),
            //   99,
            // );
            progress = Math.floor(data.overallProgress * 100);
          }

          if (isDone) {
            const key = data.outKey;
            clearInterval(interval);

            const objectResponse = await fetch(`${baseUrl}/render/getUrl`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ key }),
            });
            if (!objectResponse.ok) {
              throw new Error(`HTTP error! status: ${objectResponse.status}`);
            }

            const outData = await objectResponse.json();
            setDownloadState({
              renderId: "",
              progress: 0,
              isDownloading: false,
            });
            console.log(outData);

            download(outData, "output");

            // Handle the completed render - you'll need to implement the download logic
            // based on where your rendered video is stored
            setOpen(false);
          } else {
            setDownloadState({
              renderId: downloadState.renderId,
              progress,
              isDownloading: true,
            });
          }
        } catch (error) {
          console.error("Error fetching status:", error);
          setDownloadState({
            renderId: "",
            progress: 0,
            isDownloading: false,
          });
          clearInterval(interval);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [downloadState.renderId]);

  return (
    <>
      <Toast ref={toast} position="top-left" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="flex h-9 w-9 gap-1 border border-border"
            size="icon"
            variant="secondary"
          >
            <Download width={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-[250] flex w-60 flex-col gap-4">
          {downloadState.isDownloading ? (
            <>
              <Label>Downloading</Label>
              <div className="flex items-center gap-2">
                <Progress
                  className="h-2 rounded-sm"
                  value={downloadState.progress}
                />
                <div className="rounded-sm border border-border p-1 text-sm text-zinc-400">
                  {parseInt(downloadState.progress.toString())}%
                </div>
              </div>
              {/*<div>
              <Button className="w-full">Copy link</Button>
            </div>*/}
            </>
          ) : (
            <>
              <Label>Export settings</Label>
              <Button className="w-full justify-between" variant="outline">
                <div>MP4</div>
                <ChevronDown width={16} />
              </Button>
              <div>
                <Button onClick={handleExport} className="w-full">
                  Export
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};

interface ResizeOptionProps {
  label: string;
  icon: string;
  value: ResizeValue;
  description: string;
}

interface ResizeValue {
  width: number;
  height: number;
  name: string;
}

const RESIZE_OPTIONS: ResizeOptionProps[] = [
  {
    label: "16:9",
    icon: "landscape",
    description: "YouTube ads",
    value: {
      width: 1920,
      height: 1080,
      name: "16:9",
    },
  },
  {
    label: "9:16",
    icon: "portrait",
    description: "TikTok, YouTube Shorts",
    value: {
      width: 1080,
      height: 1920,
      name: "9:16",
    },
  },
  {
    label: "1:1",
    icon: "square",
    description: "Instagram, Facebook posts",
    value: {
      width: 1080,
      height: 1080,
      name: "1:1",
    },
  },
];

const ResizeVideo = () => {
  const handleResize = (options: ResizeValue) => {
    dispatch(DESIGN_RESIZE, {
      payload: {
        ...options,
      },
    });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="border border-border" variant="secondary">
          Resize
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[250] w-60 px-2.5 py-3">
        <div className="text-sm">
          {RESIZE_OPTIONS.map((option, index) => (
            <ResizeOption
              key={index}
              label={option.label}
              icon={option.icon}
              value={option.value}
              handleResize={handleResize}
              description={option.description}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizeOption = ({
  label,
  icon,
  value,
  description,
  handleResize,
}: ResizeOptionProps & { handleResize: (payload: ResizeValue) => void }) => {
  const Icon = Icons[icon as "text"];
  return (
    <div
      onClick={() => handleResize(value)}
      className="flex cursor-pointer items-center rounded-md p-2 hover:bg-zinc-50/10"
    >
      <div className="w-8 text-muted-foreground">
        <Icon size={20} />
      </div>
      <div>
        <div>{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
};
