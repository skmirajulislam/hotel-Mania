import React, { useState, ChangeEvent, useRef, DragEvent } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (fileUrl: string) => void;
  currentImage?: string;
  label?: string;
  accept?: string;
  fileType?: 'image' | 'video';
  maxSizeMB?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  currentImage,
  label,
  accept,
  fileType = 'image',
  maxSizeMB = fileType === 'video' ? 10 : 5
}) => {
  // Set defaults based on fileType
  const defaultLabel = fileType === 'image' ? 'Upload Image' : 'Upload Video';
  const defaultAccept = fileType === 'image' ? 'image/*' : 'video/*';

  // Use provided values or defaults
  const finalLabel = label || defaultLabel;
  const finalAccept = accept || defaultAccept;
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Size validation (MB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    // Type validation
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return false;
    }

    if (fileType === 'video' && !file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    // Clear previous errors
    setError(null);
    setUploading(true);

    try {
      // Create a preview
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/utils/upload-public`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Pass the actual file URL from the server to parent component
      onFileUpload(data.url || data.fileUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePreview = () => {
    setPreview(null);
    onFileUpload('');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {finalLabel}
      </label>
      <div
        className={`mt-1 flex flex-col items-center ${isDragging ? 'bg-gray-100' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-48 mb-3">
            {fileType === 'image' ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <video
                src={preview}
                controls
                className="w-full h-full rounded-md"
              />
            )}
            <button
              type="button"
              onClick={removePreview}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div
            onClick={triggerFileInput}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center mb-3 cursor-pointer hover:border-blue-500 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">
              Drag & drop {fileType} or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {fileType === 'video' ? `Max size: ${maxSizeMB}MB` : ''}
            </p>
          </div>
        )}

        <div className="w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={finalAccept}
            disabled={uploading}
          />

          {!preview && (
            <button
              type="button"
              onClick={triggerFileInput}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {uploading ? 'Uploading...' : finalLabel}
            </button>
          )}

          {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;