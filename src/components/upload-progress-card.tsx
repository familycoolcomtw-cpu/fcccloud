"use client";

import { CheckCircle2, CircleDashed, AlertCircle, FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

type UploadStatus = "uploading" | "tagging" | "completed" | "error";

interface UploadProgressCardProps {
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export function UploadProgressCard({
  fileName,
  fileSize,
  status,
  progress,
  error,
}: UploadProgressCardProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "uploading":
        return {
          icon: <FileUp className="animate-pulse text-primary" />,
          text: "Uploading...",
          color: "text-primary",
        };
      case "tagging":
        return {
          icon: <CircleDashed className="animate-spin text-primary" />,
          text: "AI is tagging your file...",
          color: "text-primary",
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="text-green-500" />,
          text: "Completed",
          color: "text-green-500",
        };
      case "error":
        return {
          icon: <AlertCircle className="text-destructive" />,
          text: error || "An error occurred",
          color: "text-destructive",
        };
    }
  };

  const { icon, text, color } = getStatusInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium truncate">{fileName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className={`flex items-center gap-2 ${color}`}>
            {icon}
            <span>{text}</span>
          </div>
          <span>{formatBytes(fileSize)}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
}
