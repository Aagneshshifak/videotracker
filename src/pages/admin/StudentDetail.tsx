import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Video {
  id: string;
  folder: string;
  title: string;
  folderOrder: number;
  videoOrder: number;
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

const StudentDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [folders, setFolders] = useState<FolderProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDetails();
  }, [userId]);

  const loadStudentDetails = async () => {
    try {
      const [students, videos, progress] = await Promise.all([
        api.admin.getStudents() as Promise<any[]>,
        api.videos.getAll() as Promise<Video[]>,
        api.admin.getStudentProgress(userId!) as Promise<any[]>,
      ]);

      const studentData = students.find(s => s.id === userId);
      setStudent(studentData);

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
      console.error("Error loading student details:", error);
      toast.error("Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={() => navigate("/admin/students")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <p className="mt-4 text-center text-muted-foreground">
          Student not found
        </p>
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
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/students")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-student-name">
            {student.name}
          </h1>
          <p className="text-muted-foreground">@{student.username}</p>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Overall Progress
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {overallCompleted} / {overallTotal} videos completed
            </span>
            <span className="font-medium text-foreground">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Video Completion Status
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
                        className="flex items-center gap-3 p-2 rounded-md"
                      >
                        <Checkbox
                          checked={completed}
                          disabled
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
  );
};

export default StudentDetail;
