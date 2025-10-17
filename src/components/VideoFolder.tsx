import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

interface VideoFolderProps {
  folder: string;
  videos: string[];
  completedVideos: string[];
  onToggleVideo: (video: string) => void;
  readOnly?: boolean;
}

export const VideoFolder = ({
  folder,
  videos,
  completedVideos,
  onToggleVideo,
  readOnly = false,
}: VideoFolderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const folderProgress = (completedVideos.filter((v) => videos.includes(v)).length / videos.length) * 100;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-primary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
          <h3 className="text-lg font-semibold text-foreground">{folder}</h3>
          <span className="text-sm text-muted-foreground">
            ({completedVideos.filter((v) => videos.includes(v)).length}/{videos.length})
          </span>
        </div>
        <div className="w-32">
          <ProgressBar progress={folderProgress} showLabel={false} />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 space-y-2 bg-background/50">
          {videos.map((video, index) => {
            const isCompleted = completedVideos.includes(video);
            return (
              <label
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
                  isCompleted
                    ? "bg-success/10 hover:bg-success/20"
                    : "bg-card hover:bg-accent/50",
                  readOnly && "cursor-default"
                )}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => !readOnly && onToggleVideo(video)}
                  disabled={readOnly}
                  className="sr-only"
                />
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={cn(
                  "text-sm flex-1",
                  isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {video}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
