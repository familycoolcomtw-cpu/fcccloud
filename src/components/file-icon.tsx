import type { FileType } from "@/lib/types";
import {
  FileText,
  Folder,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  FileQuestion,
} from "lucide-react";

interface FileIconProps {
  type: FileType;
  className?: string;
}

export function FileIcon({ type, className }: FileIconProps) {
  const common_className = "size-8 text-accent";
  switch (type) {
    case "folder":
      return <Folder className={className || common_className} />;
    case "document":
      return <FileText className={className || common_className} />;
    case "pdf":
      return <FileText className={className || common_className} />;
    case "image":
      return <ImageIcon className={className || common_className} />;
    case "video":
      return <Video className={className || common_className} />;
    case "audio":
      return <Music className={className || common_className} />;
    case "archive":
      return <Archive className={className || common_className} />;
    default:
      return <FileQuestion className={className || common_className} />;
  }
}
