import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar = ({ progress, className, showLabel = true }: ProgressBarProps) => {
  const getProgressColor = () => {
    if (progress === 100) return "bg-gradient-success";
    if (progress >= 50) return "bg-gradient-primary";
    if (progress > 0) return "bg-warning";
    return "bg-muted";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
        )}
        <span className="text-sm font-semibold text-foreground">{progress.toFixed(0)}%</span>
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", getProgressColor())}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
