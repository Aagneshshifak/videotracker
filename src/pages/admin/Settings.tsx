import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Download, Database, Shield } from "lucide-react";

const Settings = () => {
  const handleExportData = async () => {
    try {
      const videos = await api.videos.getAll() as any[];

      const csvContent =
        "Folder,Title,Folder Order,Video Order\n" +
        videos
          .map(
            (v) =>
              `"${v.folder}","${v.title}",${v.folderOrder},${v.videoOrder}`
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-checklist-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export data");
    }
  };

  const handleBackupProgress = async () => {
    try {
      const progress = await api.admin.getAllProgress() as any[];

      const jsonContent = JSON.stringify(progress, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `progress-backup-${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Progress backup created");
    } catch (error: any) {
      toast.error(error.message || "Failed to backup progress");
    }
  };

  const handleSetupAdmin = async () => {
    if (!confirm("This will create a default admin user. Continue?")) return;

    try {
      await api.admin.setup();
      toast.success("Admin user created successfully");
      toast.info("Username: admin, Password: admin");
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin user");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage system settings and data
        </p>
      </div>

      {/* Admin Setup */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Setup
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create the default admin user (admin/admin)
            </p>
          </div>
          <Button onClick={handleSetupAdmin} data-testid="button-setup-admin">
            Setup Admin
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Data Management
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-border rounded-md">
            <div>
              <h3 className="font-medium text-foreground">
                Export Video List
              </h3>
              <p className="text-sm text-muted-foreground">
                Download all videos and folders as CSV
              </p>
            </div>
            <Button onClick={handleExportData} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-md">
            <div>
              <h3 className="font-medium text-foreground">
                Backup Progress Data
              </h3>
              <p className="text-sm text-muted-foreground">
                Download all student progress as JSON
              </p>
            </div>
            <Button onClick={handleBackupProgress} data-testid="button-backup">
              <Database className="h-4 w-4 mr-2" />
              Backup
            </Button>
          </div>
        </div>
      </Card>

      {/* System Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          System Information
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database</span>
            <span className="text-foreground font-medium">PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Authentication</span>
            <span className="text-foreground font-medium">Session-based</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
