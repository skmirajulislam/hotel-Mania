import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import Modal from '../Modal';

interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  category: string;
  url: string;
  caption: string;
}

interface GalleryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GalleryItem) => void;
  item?: GalleryItem;
  isEditing: boolean;
}

const GalleryForm: React.FC<GalleryFormProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  isEditing
}) => {
  const [formData, setFormData] = useState<GalleryItem>(item || {
    id: Date.now(),
    type: 'image',
    category: '',
    url: '',
    caption: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (fileUrl: string) => {
    setFormData(prev => ({ ...prev, url: fileUrl }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Gallery Item' : 'Add New Gallery Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            required
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <FileUpload
          onFileUpload={handleFileUpload}
          currentImage={formData.url}
          label={formData.type === 'image' ? 'Upload Image' : 'Upload Video'}
          fileType={formData.type}
          accept={formData.type === 'image' ? 'image/*' : 'video/*'}
          maxSizeMB={formData.type === 'video' ? 10 : 5}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title/Caption</label>
          <input
            type="text"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., rooms, dining, exterior"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryForm;