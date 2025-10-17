import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LogOut } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface Video {
  id: string;
  folder: string;
  title: string;
  folderOrder: number;
  videoOrder: number;
}

interface Progress {
  id: string;
  userId: string;
  videoId: string;
  completed: boolean;
  completedAt: string | null;
}

interface FolderProgress {
  name: string;
  order: number;
  videos: Array<{
    video: Video;
    completed: boolean;
  }>;
  completedCount: number;
  totalCount: number;
}

const StudentDashboard = () => {
  const { profile, user, signOut } = useAuth();
  const [folders, setFolders] = useState<FolderProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      console.log("Fetching videos and progress...");
      const [videos, progress] = await Promise.all([
        api.videos.getAll() as Promise<Video[]>,
        api.progress.getAll() as Promise<Progress[]>,
      ]);

      console.log("Videos received:", videos);
      console.log("Progress received:", progress);

      const folderMap = new Map<string, FolderProgress>();

      videos.forEach((video) => {
        if (!folderMap.has(video.folder)) {
          folderMap.set(video.folder, {
            name: video.folder,
            order: video.folderOrder,
            videos: [],
            completedCount: 0,
            totalCount: 0,
          });
        }

        const progressEntry = progress.find((p) => p.videoId === video.id);
        const folder = folderMap.get(video.folder)!;

        folder.videos.push({
          video,
          completed: progressEntry?.completed || false,
        });
        folder.totalCount++;
        if (progressEntry?.completed) folder.completedCount++;
      });

      const folderArray = Array.from(folderMap.values()).sort(
        (a, b) => a.order - b.order
      );
      setFolders(folderArray);
    } catch (error) {
      console.error("Error loading progress:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        raw: error
      });
      toast.error(error instanceof Error ? error.message : "Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoCompletion = async (
    videoId: string,
    currentCompleted: boolean
  ) => {
    const newCompleted = !currentCompleted;
    
    // 1. Update UI immediately (optimistic update)
    setFolders(prevFolders => 
      prevFolders.map(folder => {
        const updatedVideos = folder.videos.map(({ video, completed }) => 
          video.id === videoId 
            ? { video, completed: newCompleted }
            : { video, completed }
        );
        
        const newCompletedCount = updatedVideos.reduce((count, { completed }) => 
          count + (completed ? 1 : 0), 0
        );
        
        return {
          ...folder,
          videos: updatedVideos,
          completedCount: newCompletedCount
        };
      })
    );

    try {
      // 2. Make only the update API call (no refetch!)
      await api.progress.createOrUpdate(videoId, newCompleted);
      
      toast.success(
        newCompleted
          ? "Video marked as complete"
          : "Video marked as incomplete"
      );
    } catch (error: any) {
      // 3. Revert UI on error
      setFolders(prevFolders => 
        prevFolders.map(folder => {
          const revertedVideos = folder.videos.map(({ video, completed }) => 
            video.id === videoId 
              ? { video, completed: currentCompleted }
              : { video, completed }
          );
          
          const revertedCompletedCount = revertedVideos.reduce((count, { completed }) => 
            count + (completed ? 1 : 0), 0
          );
          
          return {
            ...folder,
            videos: revertedVideos,
            completedCount: revertedCompletedCount
          };
        })
      );
      
      toast.error(error.message || "Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const overallCompleted = folders.reduce(
    (sum, f) => sum + f.completedCount,
    0
  );
  const overallTotal = folders.reduce((sum, f) => sum + f.totalCount, 0);
  const overallProgress =
    overallTotal > 0 ? (overallCompleted / overallTotal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-welcome">
              Welcome, {profile?.name}!
            </h1>
            <p className="text-muted-foreground">Track your learning progress</p>
          </div>
          <Button variant="outline" onClick={signOut} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Overall Progress */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Overall Progress
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground" data-testid="text-progress-count">
                {overallCompleted} / {overallTotal} videos completed
              </span>
              <span className="font-medium text-foreground" data-testid="text-progress-percentage">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </Card>

        {/* Video Checklist */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Video Checklist
          </h2>
          <Accordion type="multiple" className="w-full">
            {folders.map((folder) => {
              const folderProgress =
                folder.totalCount > 0
                  ? (folder.completedCount / folder.totalCount) * 100
                  : 0;

              return (
                <AccordionItem key={folder.name} value={folder.name}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex-1 text-left space-y-2 pr-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">
                          {folder.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {folder.completedCount} / {folder.totalCount}
                        </span>
                      </div>
                      <Progress value={folderProgress} className="h-2" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-4 pt-2">
                      {folder.videos.map(({ video, completed }) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() =>
                            toggleVideoCompletion(video.id, completed)
                          }
                          data-testid={`video-item-${video.id}`}
                        >
                          <Checkbox
                            checked={completed}
                            onCheckedChange={() =>
                              toggleVideoCompletion(video.id, completed)
                            }
                            data-testid={`checkbox-video-${video.id}`}
                          />
                          <span
                            className={`flex-1 ${
                              completed
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {video.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
