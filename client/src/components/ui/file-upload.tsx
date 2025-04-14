import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  id: string;
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  previewUrl?: string;
  error?: string;
  className?: string;
}

export default function FileUpload({
  id,
  label,
  accept = 'image/*',
  onChange,
  previewUrl,
  error,
  className,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onChange(file);
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      onChange(file);
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  };

  const clearFile = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        className={cn(
          'border-2 border-dashed rounded-md p-4 text-center',
          isDragging ? 'border-primary bg-primary/5' : 'border-input',
          error ? 'border-destructive' : '',
          preview ? 'bg-background' : 'bg-muted/20'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full mx-auto rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0 rounded-full h-8 w-8"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
            <Image className="h-10 w-10 mb-3" />
            <p>Drag & drop an image or click to browse</p>
            <Input
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => document.getElementById(id)?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
