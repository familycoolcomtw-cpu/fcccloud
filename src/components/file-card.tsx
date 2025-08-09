"use client";

import type { FileNode } from "@/lib/types";
import { formatBytes, cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./file-icon";

interface FileCardProps {
  file: FileNode;
  onSelect: (file: FileNode) => void;
  onRename: (file: FileNode) => void;
  onDelete: (file: FileNode) => void;
  onDownload: (file: FileNode) => void;
}

export function FileCard({
  file,
  onSelect,
  onRename,
  onDelete,
  onDownload
}: FileCardProps) {
  const isFolder = file.type === "folder";

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent dropdown from triggering card click
    if ((e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]')) {
      return;
    }
    if (isFolder) {
      onSelect(file);
    }
  };
  
  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between transition-shadow duration-200 hover:shadow-lg",
        isFolder && "cursor-pointer hover:border-accent"
      )}
    >
      <CardHeader className="flex-row items-start gap-4 pb-4">
        <div className="flex-shrink-0">
          {file.type === 'image' ? (
             <Image 
                src="https://placehold.co/40x40.png"
                alt={file.name}
                width={40}
                height={40}
                className="rounded-md object-cover size-10"
                data-ai-hint={file.aiHint || "file image"}
             />
          ) : (
            <FileIcon type={file.type} className="size-10 text-accent" />
          )}
        </div>
        <div className="flex-grow overflow-hidden">
          <CardTitle className="text-base font-semibold leading-tight truncate" title={file.name}>
            {file.name}
          </CardTitle>
          <CardDescription className="text-xs">
            {isFolder
              ? `${file.children?.length || 0} items`
              : formatBytes(file.size || 0)}
          </CardDescription>
        </div>
        {!isFolder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 flex-shrink-0">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">File actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload(file)}>
                <Download className="mr-2 size-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRename(file)}>
                <Pencil className="mr-2 size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(file)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {file.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
            {file.tags.length > 3 && (
              <Badge variant="outline">+{file.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 pb-4 text-xs text-muted-foreground">
        Added {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
      </CardFooter>
    </Card>
  );
}
