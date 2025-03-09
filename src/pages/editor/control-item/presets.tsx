import React, { CSSProperties } from "react";
import Draggable from "@/components/shared/draggable";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PRESETS } from "@/data/presets";
import useStore from "../store/use-store";
const Presets = () => {
  const { activeIds } = useStore();

  const applyTextPreset = (preset: any) => {
    console.log(preset);
    dispatch(EDIT_OBJECT, {
      payload: {
        [activeIds[0]]: {
          details: preset,
        },
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-md text-text-primary flex h-12 flex-none items-center px-4 font-medium">
        Presets
      </div>
      <ScrollArea>
        <div className="grid grid-cols-1 gap-2 px-4">
          {PRESETS.map((preset, index) => (
            <PresetsMenuItem
              key={index}
              preset={preset}
              shouldDisplayPreview={true}
              applyTextPreset={applyTextPreset}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const PresetsMenuItem = ({
  preset,
  shouldDisplayPreview,
  applyTextPreset,
}: {
  preset: Partial<any>;
  applyTextPreset: any;
  shouldDisplayPreview: boolean;
}) => {
  const style = React.useMemo(
    () => ({
      ...preset,
      width: "100%",
      height: "100%",
      position: "relative",
      top: "auto",
      left: "auto",

      textShadow: preset.textShadow,
      boxShadow: `${preset.boxShadow.x}px ${preset.boxShadow.y}px ${preset.boxShadow.blur}px ${preset.boxShadow.color}`,
      WebkitTextStrokeColor: preset.WebkitTextStrokeColor,
      WebkitTextStrokeWidth: preset.WebkitTextStrokeWidth,
      fontSize: `${parseInt(preset.fontSize) * 0.5}px`,
    }),
    [preset]
  );

  return (
    // <Draggable
    //   data={preset}
    //   renderCustomPreview={<div style={style} />}
    //   shouldDisplayPreview={shouldDisplayPreview}
    // >
    <div className="mb-4" onClick={() => applyTextPreset(preset)}>
      {/* <div> */}
      <div style={style as CSSProperties} draggable={false}>
        Sample text
      </div>
      {/* </div> */}
      {/* <div className="flex h-6 items-center overflow-ellipsis text-nowrap text-[12px] capitalize text-muted-foreground"></div> */}
    </div>
    // </Draggable>
  );
};
export default Presets;
