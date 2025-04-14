import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image', 'code-block'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link', 'image', 'code-block',
];

export default function RichTextEditor({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  // Only load Quill on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="w-full h-64 border border-input rounded-md bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          {placeholder && <span className="text-muted-foreground">{placeholder}</span>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <ReactQuill
        id={id}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={cn(error ? 'border-destructive' : 'border-input')}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
