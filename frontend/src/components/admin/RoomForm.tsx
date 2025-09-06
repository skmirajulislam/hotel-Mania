import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import FileUpload from '../FileUpload';
import Modal from '../Modal';

interface Room {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  available: number;
  total: number;
  images: string[];
  videos?: string[];
  amenities: string[];
}

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Room) => void;
  room?: Room;
  isEditing: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({
  isOpen,
  onClose,
  onSave,
  room,
  isEditing
}) => {
  const [formData, setFormData] = useState<Room>(room || {
    id: Date.now(),
    category: '',
    name: '',
    description: '',
    price: 0,
    available: 0,
    total: 0,
    images: [],
    videos: [],
    amenities: []
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'available' || name === 'total'
        ? Number(value)
        : value
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (fileUrl: string) => {
    if (activeImageIndex !== null) {
      // Replace existing image
      const newImages = [...formData.images];
      newImages[activeImageIndex] = fileUrl;
      setFormData(prev => ({ ...prev, images: newImages }));
      setActiveImageIndex(null);
    } else {
      // Add new image
      setFormData(prev => ({ ...prev, images: [...prev.images, fileUrl] }));
    }
    setShowImageUpload(false);
  };

  const handleVideoUpload = (fileUrl: string) => {
    if (activeVideoIndex !== null) {
      // Replace existing video
      const newVideos = [...(formData.videos || [])];
      newVideos[activeVideoIndex] = fileUrl;
      setFormData(prev => ({ ...prev, videos: newVideos }));
      setActiveVideoIndex(null);
    } else {
      // Add new video
      setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), fileUrl] }));
    }
    setShowVideoUpload(false);
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Room' : 'Add New Room'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (INR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Rooms</label>
            <input
              type="number"
              name="total"
              value={formData.total}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Rooms</label>
            <input
              type="number"
              name="available"
              value={formData.available}
              onChange={handleChange}
              min="0"
              max={formData.total}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.amenities.map((amenity, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="text-sm">{amenity}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Room ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(index);
                      setShowImageUpload(true);
                    }}
                    className="p-1 bg-blue-500 text-white rounded-full mr-1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setActiveImageIndex(null);
                setShowImageUpload(true);
              }}
              className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-yellow-500 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {showImageUpload && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium mb-2">
              {activeImageIndex !== null ? 'Replace Image' : 'Add New Image'}
            </h4>
            <FileUpload
              onFileUpload={handleImageUpload}
              currentImage={activeImageIndex !== null ? formData.images[activeImageIndex] : undefined}
              fileType="image"
              maxSizeMB={5}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImageUpload(false);
                  setActiveImageIndex(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Videos</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {formData.videos?.map((video, index) => (
              <div key={index} className="relative group">
                <video
                  src={video}
                  className="w-full h-20 object-cover rounded-md"
                  muted
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVideoIndex(index);
                      setShowVideoUpload(true);
                    }}
                    className="p-1 bg-blue-500 text-white rounded-full mr-1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setActiveVideoIndex(null);
                setShowVideoUpload(true);
              }}
              className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-yellow-500 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {showVideoUpload && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium mb-2">
              {activeVideoIndex !== null ? 'Replace Video' : 'Add New Video'}
            </h4>
            <FileUpload
              onFileUpload={handleVideoUpload}
              currentImage={activeVideoIndex !== null && formData.videos ? formData.videos[activeVideoIndex] : undefined}
              fileType="video"
              maxSizeMB={10}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowVideoUpload(false);
                  setActiveVideoIndex(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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

export default RoomForm;