import React from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CAPTION_TEMPLATES, ITemplate } from "@/data/templates";
import useStore from "../store/use-store";

const Templates = () => {
  const { activeIds, tracks, trackItemsMap } = useStore();

  // const applyTemplate = (template: ITemplate) => {
  //   if (!activeIds || activeIds.length === 0) return;

  //   dispatch(EDIT_OBJECT, {
  //     payload: {
  //       [activeIds[0]]: {
  //         details: template.details,
  //       },
  //     },
  //   });
  // };
  const applyTemplate = (template: ITemplate) => {
    const payload = {};
    console.log(trackItemsMap);
    // Get all caption tracks
    Object.keys(trackItemsMap).forEach((itemId) => {
      const item = trackItemsMap[itemId];
      // Check if this track item is a caption type
      if (item && item.type === "caption") {
        payload[itemId] = {
          details: {
            ...template.details,
            // Preserve any existing position/transform data
            ...((trackItemsMap[itemId].details?.transform || {}) && {
              transform: trackItemsMap[itemId].details.transform,
            }),
          },
        };
      }
    });

    // Only dispatch if we found captions
    if (Object.keys(payload).length > 0) {
      dispatch(EDIT_OBJECT, {
        payload: payload,
      });
    }
  };
  return (
    <div className="flex flex-1 flex-col">
      <div className="text-md text-text-primary flex h-12 flex-none items-center px-4 font-medium">
        Templates
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-6 p-4">
          {CAPTION_TEMPLATES.map((template, index) => (
            <TemplatePreview
              key={index}
              template={template}
              onClick={() => applyTemplate(template)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const TemplatePreview = ({
  template,
  onClick,
}: {
  template: ITemplate;
  onClick: () => void;
}) => {
  const previewStyle = React.useMemo(
    () => ({
      color: template.details.color,
      fontSize: `${template.details.fontSize * 0.3}px`,
      fontFamily: template.details.fontFamily,
      opacity: template.details.opacity / 100,
      textAlign: template.details.textAlign as any,
      textDecoration: template.details.textDecoration,
      // WebkitTextStroke:
      //   template.details.borderWidth > 0
      //     ? `${template.details.borderWidth}px ${template.details.borderColor}`
      //     : "none",
      textShadow:
        template.details.boxShadow.blur > 0
          ? `${template.details.boxShadow.x}px ${template.details.boxShadow.y}px ${template.details.boxShadow.blur}px ${template.details.boxShadow.color}`
          : "none",
    }),
    [template]
  );

  return (
    <div
      className="relative overflow-hidden bg-zinc-900/50 hover:bg-zinc-900/70 rounded-xl p-6 min-h-[200px] transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-white/20"
      onClick={onClick}
    >
      {/* Preview Container with Centered Content */}
      <div className="flex flex-col items-center justify-center h-[calc(100%-75px)]">
        {/* Normal Text Preview */}
        <div className="flex items-center justify-center gap-2 flex-wrap px-4">
          <span style={previewStyle}>Hey!</span>
          <span
            style={{
              ...previewStyle,
              color: template.details.activeColor,
              backgroundColor: template.details.activeBackgroundColor,
              padding: "4px 12px",
              borderRadius: "8px",
            }}
          >
            Active Word
          </span>
          <span style={previewStyle}>here</span>
        </div>
      </div>

      {/* Bottom Info Bar - Fixed at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-md px-4 flex items-center justify-between border-t border-white/5">
        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 flex-wrap">
            <div
              className="w-5 h-5 rounded-full border-2 border-white/20 transition-transform hover:scale-110"
              style={{ backgroundColor: template.details.color }}
              title="Text Color"
            />
            <div
              className="w-5 h-5 rounded-full border-2 border-white/20 transition-transform hover:scale-110"
              style={{ backgroundColor: template.details.activeColor }}
              title="Active Text Color"
            />
            <div
              className="w-5 h-5 rounded-full border-2 border-white/20 transition-transform hover:scale-110"
              style={{
                backgroundColor: template.details.activeBackgroundColor,
              }}
              title="Active Background"
            />
            {template.details.borderWidth > 0 && (
              <div
                className="w-5 h-5 rounded-full border-2 border-white/20 transition-transform hover:scale-110"
                style={{ backgroundColor: template.details.borderColor }}
                title="Border Color"
              />
            )}
            {template.details.boxShadow.blur > 0 && (
              <div
                className="w-5 h-5 rounded-full border-2 border-white/20 transition-transform hover:scale-110"
                style={{ backgroundColor: template.details.boxShadow.color }}
                title="Shadow Color"
              />
            )}
          </div>
        </div>

        {/* Template Name */}
        <div className="text-sm font-medium text-white/90 text-end">
          {template.name}
        </div>
      </div>
    </div>
  );
};

export default Templates;
