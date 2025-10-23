"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon, Upload, X } from 'lucide-react';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';

interface ImageUploadProps {
  name: string;
  label: string;
  currentImageUrl?: string | null;
}

export const ImageUpload = ({ name, label, currentImageUrl }: ImageUploadProps) => {
  const { control, setValue, watch } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileValue = watch(name);

  useEffect(() => {
    if (fileValue instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(fileValue);
    } else if (typeof fileValue === 'string') {
        setPreview(fileValue);
    } else if (!fileValue && currentImageUrl) {
        setPreview(currentImageUrl);
    } else {
        setPreview(null);
    }
  }, [fileValue, currentImageUrl]);

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setValue(name, null, { shouldDirty: true });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-full"> {/* Alterado para rounded-full */}
              <AvatarImage src={preview || undefined} className="object-cover rounded-full" /> {/* Adicionado rounded-full e object-cover */}
              <AvatarFallback className="rounded-full bg-admin-background"> {/* Alterado para rounded-full */}
                <ImageIcon className="h-8 w-8 text-admin-foreground-muted" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2" />
                Carregar
              </Button>
              <Input
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.onChange(file);
                  }
                }}
              />
              {preview && (
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleRemoveImage}>
                  <X className="mr-2 size-4" />
                  Remover
                </Button>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};