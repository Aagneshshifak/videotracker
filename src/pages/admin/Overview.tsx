import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Video } from "lucide-react";

interface Stats {
  totalStudents: number;
  totalVideos: number;
  topStudents: Array<{ name: string; progress: number }>;
  leastActive: Array<{ name: string; progress: number }>;
}

const Overview = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalVideos: 0,
    topStudents: [],
    leastActive: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [videos, students, progressData] = await Promise.all([
        api.videos.getAll() as Promise<any[]>,
        api.admin.getStudents() as Promise<any[]>,
        api.admin.getAllProgress() as Promise<any[]>,
      ]);

      const totalVideos = videos.length;
      const studentList = students.filter(s => s.role !== 'admin');
      const totalStudents = studentList.length;

      // Calculate progress per student
      const studentProgress = studentList.map((student) => {
        const userProgress = progressData.filter(
          (p) => p.userId === student.id
        );
        const completed = userProgress.filter((p) => p.completed).length;
        const progress = totalVideos > 0 ? (completed / totalVideos) * 100 : 0;
        return { name: student.name, progress };
      });

      // Sort students by progress
      const sorted = [...studentProgress].sort(
        (a, b) => b.progress - a.progress
      );
      const topStudents = sorted.slice(0, 5);
      const leastActive = sorted.slice(-5).reverse();

      setStats({
        totalStudents,
        totalVideos,
        topStudents,
        leastActive,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
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

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Videos",
      value: stats.totalVideos,
      icon: Video,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor student progress and system statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-2" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-10 w-10 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Top & Least Active Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Top 5 Students
          </h2>
          <div className="space-y-4">
            {stats.topStudents.map((student, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    {student.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {student.progress.toFixed(1)}%
                  </span>
                </div>
                <Progress value={student.progress} />
              </div>
            ))}
          </div>
        </Card>

        {/* Least Active */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Least Active Students
          </h2>
          <div className="space-y-4">
            {stats.leastActive.map((student, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    {student.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {student.progress.toFixed(1)}%
                  </span>
                </div>
                <Progress value={student.progress} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
