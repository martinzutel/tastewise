"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar } from "@/components/common/avatar";
import { Button } from "@/components/ui/button";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/schemas";
import { useUserData } from "@/lib/user-data/provider";

const MAX_BYTES = 5 * 1024 * 1024;

export function ProfileForm() {
  const { data, saveProfile, uploadAvatar, status } = useUserData();
  const [avatar, setAvatar] = useState<string | null>(data.profile.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: data.profile.name },
  });

  // Populate once stored data has loaded.
  useEffect(() => {
    if (status === "ready") {
      reset({ name: data.profile.name });
      setAvatar(data.profile.avatarUrl);
    }
  }, [status, data.profile, reset]);

  const onFile = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFileError("Choose an image file (JPG, PNG or WebP).");
    if (file.size > MAX_BYTES) return setFileError("That photo is over 5 MB. Choose a smaller one.");
    setUploading(true);
    const url = await uploadAvatar(file);
    setUploading(false);
    if (url) {
      setAvatar(url);
      await saveProfile({ ...data.profile, avatarUrl: url });
    }
  };

  const avatarChanged = avatar !== data.profile.avatarUrl;

  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        const ok = await saveProfile({ name: v.name, avatarUrl: avatar });
        if (ok) reset(v);
      })}
      noValidate
      className="space-y-6"
    >
      <div className="flex items-center gap-5">
        <Avatar name={data.profile.name} src={avatar} size={72} />
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            id="avatar-file"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : avatar ? "Change photo" : "Add a photo"}
          </Button>
          {avatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                setAvatar(null);
                await saveProfile({ ...data.profile, avatarUrl: null });
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      {fileError && (
        <p role="alert" className="text-[0.85rem] text-destructive">
          {fileError}
        </p>
      )}

      <div>
        <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="profile-name"
          {...register("name")}
          autoComplete="given-name"
          placeholder="What should we call you?"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "profile-name-error" : undefined}
          className="h-11 w-full max-w-sm rounded-md border border-line-strong bg-surface px-3 outline-none placeholder:text-ink-faint focus:border-sage focus:shadow-[0_0_0_3px_var(--sage-wash)] aria-invalid:border-destructive"
        />
        {errors.name && (
          <p id="profile-name-error" role="alert" className="mt-1.5 text-[0.85rem] text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting || (!isDirty && !avatarChanged)}>
        {isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
