"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userImage?: string;
  userStatus?: string;
  isReadOnly: boolean;
  onSave?: (name: string, status: string) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string>;
};

export default function ProfileModal({
  isOpen,
  onClose,
  userId,
  userName,
  userImage,
  userStatus,
  isReadOnly,
  onSave,
  onUploadImage,
}: ProfileModalProps) {
  const [tempName, setTempName] = useState(userName);
  const [tempStatus, setTempStatus] = useState(userStatus || "online");
  const [tempImage, setTempImage] = useState(userImage);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when props change or modal opens
  useEffect(() => {
    if (isOpen) {
      setTempName(userName);
      setTempStatus(userStatus || "online");
      setTempImage(userImage);
      setIsPreviewOpen(false);
    }
  }, [userName, userStatus, userImage, isOpen]);

  if (!isOpen) return null;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening preview
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      if (onUploadImage) {
        const newUrl = await onUploadImage(file);
        setTempImage(newUrl);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!tempName || tempName.trim() === "") {
      alert("Name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      if (onSave) {
        await onSave(tempName, tempStatus);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => !isSaving && onClose()}
      />

      {/* Dialog Container */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 p-6 text-foreground flex flex-col gap-5 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">
            {isReadOnly ? "User Profile" : "Edit Profile"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            disabled={isSaving}
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar edit/view section */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20">
              <Avatar
                className={cn(
                  "h-20 w-20 ring-4 ring-primary/10 transition-all duration-300 overflow-hidden relative cursor-pointer",
                  !isReadOnly && "hover:ring-primary/30"
                )}
                onClick={() => setIsPreviewOpen(true)}
              >
                <AvatarImage src={tempImage || ""} alt={tempName} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {tempName.charAt(0).toUpperCase()}
                </AvatarFallback>
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </Avatar>

              {/* Edit Photo Icon Badge */}
              {!isReadOnly && !isUploading && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full hover:scale-105 transition-transform shadow-md z-10 border-2 border-card"
                  title="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Hidden file input */}
              {!isReadOnly && (
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading || isSaving}
                />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              Click photo to preview
            </span>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </label>
            {isReadOnly ? (
              <p className="text-foreground text-sm font-medium px-3 py-2 bg-muted/40 border border-border/50 rounded-lg select-all">
                {tempName}
              </p>
            ) : (
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="bg-muted/50 border-border h-10 text-sm"
                disabled={isSaving}
                required
              />
            )}
          </div>

          {/* Status Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </label>
            {isReadOnly ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border border-border/50 rounded-lg">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full animate-pulse",
                    tempStatus === "online" ? "bg-chat-online" : "bg-muted-foreground/60"
                  )}
                />
                <span className="text-foreground text-sm font-medium capitalize">
                  {tempStatus}
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setTempStatus("online")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200",
                    tempStatus === "online"
                      ? "bg-chat-online/10 border-chat-online text-chat-online ring-1 ring-chat-online"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-chat-online" />
                  Online
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setTempStatus("offline")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200",
                    tempStatus === "offline"
                      ? "bg-muted-foreground/10 border-muted-foreground text-muted-foreground ring-1 ring-muted-foreground"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                  Offline
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={isSaving}
                onClick={onClose}
                className="rounded-lg h-9 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isUploading}
                className="rounded-lg h-9 text-sm font-semibold shadow-sm px-4"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </form>

        {/* Image Preview Overlay inside Dialog */}
        {isPreviewOpen && (
          <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative max-w-full max-h-[70%] aspect-square flex items-center justify-center">
              {tempImage ? (
                <img
                  src={tempImage}
                  alt="Profile Preview"
                  className="w-56 h-56 rounded-xl object-cover border border-white/10 shadow-2xl"
                />
              ) : (
                <div className="w-56 h-56 rounded-xl bg-primary/10 border border-white/10 flex items-center justify-center text-primary text-5xl font-bold">
                  {tempName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-white/60 text-xs mt-4 font-medium">
              Profile Image Preview
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
