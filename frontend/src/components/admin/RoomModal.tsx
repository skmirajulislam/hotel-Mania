import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

interface Room {
    _id?: string;
    name: string;
    description: string;
    price: number;
    availability: number;
    category?: string;
    images: string[];
    features: string[];
    amenities: string[];
    maxOccupancy: number;
    bedType: string;
    roomSize: number;
}

interface RoomCategory {
    _id: string;
    name: string;
}

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room?: Room;
    onSave: (roomData: Omit<Room, '_id'>) => Promise<void>;
    categories: RoomCategory[];
}

const RoomModal: React.FC<RoomModalProps> = ({
    isOpen,
    onClose,
    room,
    onSave,
    categories
}) => {
    const [formData, setFormData] = useState<Omit<Room, '_id'>>({
        name: '',
        description: '',
        price: 0,
        availability: 1,
        category: '',
        images: [],
        features: [],
        amenities: [],
        maxOccupancy: 2,
        bedType: 'Queen',
        roomSize: 25
    });
    const [loading, setLoading] = useState(false);
    const [newFeature, setNewFeature] = useState('');
    const [newAmenity, setNewAmenity] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        if (room) {
            setFormData({
                name: room.name || '',
                description: room.description || '',
                price: room.price || 0,
                availability: room.availability || 1,
                category: room.category || '',
                images: room.images || [],
                features: room.features || [],
                amenities: room.amenities || [],
                maxOccupancy: room.maxOccupancy || 2,
                bedType: room.bedType || 'Queen',
                roomSize: room.roomSize || 25
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                availability: 1,
                category: '',
                images: [],
                features: [],
                amenities: [],
                maxOccupancy: 2,
                bedType: 'Queen',
                roomSize: 25
            });
        }
    }, [room, isOpen]);

    const handleImageUpload = async (files: FileList) => {
        if (files.length === 0) return;

        setUploadingImages(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'hotel_images'); // Replace with your Cloudinary preset

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`, // Replace with your cloud name
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                const data = await response.json();
                return data.secure_url;
            });

            const imageUrls = await Promise.all(uploadPromises);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...imageUrls]
            }));
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error uploading images. Please try again.');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const addAmenity = () => {
        if (newAmenity.trim()) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, newAmenity.trim()]
            }));
            setNewAmenity('');
        }
    };

    const removeAmenity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.images.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving room:', error);
            alert('Error saving room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {room ? 'Edit Room' : 'Add New Room'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price per Night ($)
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Availability
                            </label>
                            <input
                                type="number"
                                value={formData.availability}
                                onChange={(e) => setFormData(prev => ({ ...prev, availability: Number(e.target.value) }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Occupancy
                            </label>
                            <input
                                type="number"
                                value={formData.maxOccupancy}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxOccupancy: Number(e.target.value) }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bed Type
                            </label>
                            <select
                                value={formData.bedType}
                                onChange={(e) => setFormData(prev => ({ ...prev, bedType: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Queen">Queen</option>
                                <option value="King">King</option>
                                <option value="Twin">Twin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Size (sqm)
                            </label>
                            <input
                                type="number"
                                value={formData.roomSize}
                                onChange={(e) => setFormData(prev => ({ ...prev, roomSize: Number(e.target.value) }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Images Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Images (Max 4)
                        </label>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> images
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                        disabled={uploadingImages || formData.images.length >= 4}
                                    />
                                </label>
                            </div>

                            {uploadingImages && (
                                <div className="flex items-center justify-center p-4">
                                    <LoadingSpinner />
                                    <span className="ml-2">Uploading images...</span>
                                </div>
                            )}

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Room ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Features
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Add a feature..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.features.map((feature, index) => (
                                <span
                                    key={index}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {feature}
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Amenities
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newAmenity}
                                onChange={(e) => setNewAmenity(e.target.value)}
                                placeholder="Add an amenity..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                            />
                            <button
                                type="button"
                                onClick={addAmenity}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.amenities.map((amenity, index) => (
                                <span
                                    key={index}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                >
                                    {amenity}
                                    <button
                                        type="button"
                                        onClick={() => removeAmenity(index)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploadingImages}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <LoadingSpinner />}
                            {room ? 'Update Room' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default RoomModal;
