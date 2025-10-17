import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FolderPlus, VideoIcon, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Video {
  id: string;
  folder: string;
  title: string;
  folderOrder: number;
  videoOrder: number;
}

interface Folder {
  name: string;
  order: number;
  videos: Video[];
}

const ManageContent = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const videos = await api.videos.getAll() as Video[];

      const folderMap = new Map<string, Folder>();
      
      videos.forEach((video) => {
        if (!folderMap.has(video.folder)) {
          folderMap.set(video.folder, {
            name: video.folder,
            order: video.folderOrder,
            videos: [],
          });
        }
        folderMap.get(video.folder)!.videos.push(video);
      });

      const folderArray = Array.from(folderMap.values()).sort(
        (a, b) => a.order - b.order
      );
      setFolders(folderArray);
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideoTitle.trim() || !selectedFolder) {
      toast.error("Please provide video title and select a folder");
      return;
    }

    try {
      const folder = folders.find(f => f.name === selectedFolder);
      if (!folder) return;

      const maxVideoOrder = Math.max(...folder.videos.map(v => v.videoOrder), 0);
      
      await api.videos.create({
        title: newVideoTitle,
        folder: selectedFolder,
        folderOrder: folder.order,
        videoOrder: maxVideoOrder + 1,
      });

      toast.success("Video added successfully");
      setNewVideoTitle("");
      setVideoDialogOpen(false);
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to add video");
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await api.videos.delete(videoId);
      toast.success("Video deleted successfully");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete video");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Content</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove videos from the curriculum
          </p>
        </div>
        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-video">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
              <DialogDescription>
                Add a new video to an existing folder
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
                <select
                  id="folder"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  data-testid="select-folder"
                >
                  <option value="">Select a folder</option>
                  {folders.map((folder) => (
                    <option key={folder.name} value={folder.name}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  data-testid="input-video-title"
                />
              </div>
            </div>
            <Button onClick={handleAddVideo} className="w-full" data-testid="button-submit-video">
              Add Video
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Accordion type="multiple" className="w-full">
          {folders.map((folder) => (
            <AccordionItem key={folder.name} value={folder.name}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{folder.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({folder.videos.length} videos)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4 pt-2">
                  {folder.videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <VideoIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {video.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${video.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};

export default ManageContent;
