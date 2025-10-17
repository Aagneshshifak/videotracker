import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  username: string;
  totalVideos: number;
  completedVideos: number;
  progress: number;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const [studentsList, videos, allProgress] = await Promise.all([
        api.admin.getStudents() as Promise<any[]>,
        api.videos.getAll() as Promise<any[]>,
        api.admin.getAllProgress() as Promise<any[]>,
      ]);

      const studentProfiles = studentsList.filter(s => s.role !== 'admin');
      const totalVideos = videos.length;

      const studentsWithProgress = studentProfiles.map((profile) => {
        const userProgress = allProgress.filter(
          (p) => p.userId === profile.id
        );
        const completedVideos = userProgress.filter((p) => p.completed).length;
        const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

        return {
          id: profile.id,
          name: profile.name,
          username: profile.username || "N/A",
          totalVideos,
          completedVideos,
          progress,
        };
      });

      studentsWithProgress.sort((a, b) => b.progress - a.progress);

      setStudents(studentsWithProgress);
      setFilteredStudents(studentsWithProgress);
      toast.success(`Loaded ${studentsWithProgress.length} student${studentsWithProgress.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Students</h1>
          <p className="text-muted-foreground">
            Manage and monitor all enrolled students
          </p>
        </div>
        <Button onClick={loadStudents} variant="outline" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No students found
            </p>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground" data-testid={`student-name-${student.id}`}>
                        {student.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        @{student.username}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {student.completedVideos} / {student.totalVideos}{" "}
                          videos completed
                        </span>
                        <span className="font-medium text-foreground">
                          {student.progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={student.progress} />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/students/${student.id}`)}
                    data-testid={`button-view-${student.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Students;
