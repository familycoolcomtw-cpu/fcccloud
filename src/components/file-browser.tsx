"use client";

import { useState, useMemo, useRef } from "react";
import {
  Home,
  ChevronRight,
  Search,
  UploadCloud,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { FileNode, FileType } from "@/lib/types";
import { mockFiles } from "@/lib/mock-data";
import { generateFileTags } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { findPath, findNode, updateNode, deleteNode, addNode } from "@/lib/file-tree-utils";
import { FileCard } from "./file-card";
import { UploadProgressCard } from "./upload-progress-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UploadState = {
  file: File;
  progress: number;
  status: "uploading" | "tagging" | "completed" | "error";
  error?: string;
};

export default function FileBrowser() {
  const [files, setFiles] = useState<FileNode[]>(mockFiles);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const [dialogState, setDialogState] = useState<{
    type: "rename" | "delete" | null;
    file: FileNode | null;
  }>({ type: null, file: null });
  const [renameValue, setRenameValue] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentFolder = useMemo(() => {
    if (currentPath.length === 0) return null;
    const folderId = currentPath[currentPath.length - 1];
    return findNode(files, folderId);
  }, [files, currentPath]);

  const displayedFiles = useMemo(() => {
    let filesToList: FileNode[];

    if (currentPath.length === 0) {
      filesToList = files;
    } else {
      filesToList = currentFolder?.children || [];
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filesToList = filesToList.filter((file) =>
        file.name.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    if (selectedTags.length > 0) {
      filesToList = filesToList.filter((file) =>
        selectedTags.every((tag) => file.tags.includes(tag))
      );
    }
    return filesToList;
  }, [files, currentPath, currentFolder, searchQuery, selectedTags]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    const traverse = (nodes: FileNode[]) => {
      nodes.forEach((node) => {
        node.tags.forEach((tag) => tagSet.add(tag));
        if (node.children) traverse(node.children);
      });
    };
    traverse(files);
    return Array.from(tagSet);
  }, [files]);

  const breadcrumbs = useMemo(() => {
    if (currentPath.length === 0) return [];
    const lastFolderId = currentPath[currentPath.length - 1];
    return findPath(files, lastFolderId);
  }, [files, currentPath]);

  const handleFileUpload = async (selectedFile: File) => {
    const uploadId = `${selectedFile.name}-${Date.now()}`;
    setUploads((prev) => ({
      ...prev,
      [uploadId]: {
        file: selectedFile,
        progress: 0,
        status: "uploading",
      },
    }));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploads((prev) => {
        const currentProgress = prev[uploadId]?.progress || 0;
        if (currentProgress >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return {
          ...prev,
          [uploadId]: { ...prev[uploadId], progress: currentProgress + 10 },
        };
      });
    }, 200);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      clearInterval(progressInterval);
      setUploads((prev) => ({
        ...prev,
        [uploadId]: { ...prev[uploadId], progress: 95, status: "tagging" },
      }));

      const fileDataUri = reader.result as string;
      const fileType = selectedFile.type.split("/")[0] as FileType;
      
      const result = await generateFileTags({
        fileName: selectedFile.name,
        fileType: fileType,
        fileDataUri,
      });

      if (result.error) {
        setUploads((prev) => ({
          ...prev,
          [uploadId]: {
            ...prev[uploadId],
            status: "error",
            error: result.error,
          },
        }));
        toast({
          title: "AI Tagging Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      const newFile: FileNode = {
        id: `file-${Date.now()}`,
        name: selectedFile.name,
        type: fileType === "image" || fileType === "video" || fileType === "audio" ? fileType : "document",
        size: selectedFile.size,
        createdAt: new Date().toISOString(),
        tags: result.tags,
      };

      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
      setFiles(prevFiles => addNode(prevFiles, parentId, newFile));

      setUploads((prev) => ({
        ...prev,
        [uploadId]: { ...prev[uploadId], progress: 100, status: "completed" },
      }));

      setTimeout(() => {
        setUploads((prev) => {
          const newUploads = { ...prev };
          delete newUploads[uploadId];
          return newUploads;
        });
      }, 3000);
    };
  };

  const handleSelectFile = (file: FileNode) => {
    if (file.type === "folder") {
      setCurrentPath((prev) => [...prev, file.id]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
  };
  
  const handleHomeClick = () => {
    setCurrentPath([]);
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const closeDialog = () => setDialogState({ type: null, file: null });

  const handleRename = () => {
    if (dialogState.file && renameValue) {
      setFiles(files => updateNode(files, dialogState.file!.id, { name: renameValue }));
      toast({ title: "File renamed", description: `"${dialogState.file.name}" was renamed to "${renameValue}".` });
      closeDialog();
    }
  };

  const handleDelete = () => {
    if (dialogState.file) {
      setFiles(files => deleteNode(files, dialogState.file!.id));
      toast({ title: "File deleted", description: `"${dialogState.file.name}" has been deleted.`, variant: "destructive" });
      closeDialog();
    }
  };
  
  const handleDownload = (file: FileNode) => {
    toast({ title: "Preparing Download", description: `Your download for "${file.name}" will start shortly.` });
    // In a real app, this would trigger a download from a URL.
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Wind className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold">CloudPilot</h1>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
          <UploadCloud className="mr-2" /> Upload
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          className="hidden"
          multiple={false}
        />
      </header>

      <div className="flex-grow p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Breadcrumbs and Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto pb-2">
              <Home className="size-4 cursor-pointer hover:text-accent" onClick={handleHomeClick} />
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <ChevronRight className="size-4" />
                  <span
                    className="cursor-pointer hover:text-accent whitespace-nowrap"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {crumb.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
             <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">Filter by tags:</span>
                {allTags.map((tag) => (
                    <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        onClick={() => handleToggleTag(tag)}
                        className="cursor-pointer transition-all"
                    >
                        {tag}
                        {selectedTags.includes(tag) && <X className="ml-1 size-3" />}
                    </Badge>
                ))}
             </div>
          )}

          {/* File Grid */}
          <AnimatePresence>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {displayedFiles.map((file) => (
                <motion.div layout key={file.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <FileCard
                    file={file}
                    onSelect={handleSelectFile}
                    onRename={(f) => { setRenameValue(f.name); setDialogState({ type: "rename", file: f })}}
                    onDelete={(f) => setDialogState({ type: "delete", file: f })}
                    onDownload={handleDownload}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Uploads Panel */}
      <AnimatePresence>
        {Object.keys(uploads).length > 0 && (
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 right-0 p-4 w-full md:w-96"
            >
                <div className="bg-card border rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    <h3 className="text-lg font-semibold p-4 border-b">Uploads</h3>
                    <div className="p-4 space-y-4">
                        {Object.entries(uploads).map(([id, upload]) => (
                            <UploadProgressCard
                                key={id}
                                fileName={upload.file.name}
                                fileSize={upload.file.size}
                                status={upload.status}
                                progress={upload.progress}
                                error={upload.error}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>


      {/* Dialogs */}
      <AlertDialog open={dialogState.type === "rename"} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename File</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for "{dialogState.file?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>Rename</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialogState.type === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{dialogState.file?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
