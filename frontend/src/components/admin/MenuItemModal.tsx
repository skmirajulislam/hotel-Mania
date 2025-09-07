import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

interface MenuItem {
    _id?: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    image: string;
    available: boolean;
    preparationTime: number;
    allergens: string[];
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
}

interface FoodCategory {
    _id: string;
    name: string;
}

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItem?: MenuItem;
    onSave: (menuItemData: Omit<MenuItem, '_id'>) => Promise<void>;
    categories: FoodCategory[];
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
    isOpen,
    onClose,
    menuItem,
    onSave,
    categories
}) => {
    const [formData, setFormData] = useState<Omit<MenuItem, '_id'>>({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        available: true,
        preparationTime: 15,
        allergens: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false
    });
    const [loading, setLoading] = useState(false);
    const [newAllergen, setNewAllergen] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (menuItem) {
            setFormData({
                name: menuItem.name,
                description: menuItem.description,
                price: menuItem.price,
                category: menuItem.category || '',
                image: menuItem.image || '',
                available: menuItem.available,
                preparationTime: menuItem.preparationTime,
                allergens: menuItem.allergens || [],
                isVegetarian: menuItem.isVegetarian,
                isVegan: menuItem.isVegan,
                isGlutenFree: menuItem.isGlutenFree
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                category: '',
                image: '',
                available: true,
                preparationTime: 15,
                allergens: [],
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: false
            });
        }
    }, [menuItem, isOpen]);

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('upload_preset', 'hotel_images'); // Replace with your Cloudinary preset

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`, // Replace with your cloud name
                {
                    method: 'POST',
                    body: formDataUpload
                }
            );

            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                image: data.secure_url
            }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const addAllergen = () => {
        if (newAllergen.trim()) {
            setFormData(prev => ({
                ...prev,
                allergens: [...prev.allergens, newAllergen.trim()]
            }));
            setNewAllergen('');
        }
    };

    const removeAllergen = (index: number) => {
        setFormData(prev => ({
            ...prev,
            allergens: prev.allergens.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) {
            alert('Please upload an image');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving menu item:', error);
            alert('Error saving menu item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
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
                                Item Name
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
                                Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preparation Time (minutes)
                            </label>
                            <input
                                type="number"
                                value={formData.preparationTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: Number(e.target.value) }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="1"
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

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Image
                        </label>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> image
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                                        disabled={uploadingImage}
                                    />
                                </label>
                            </div>

                            {uploadingImage && (
                                <div className="flex items-center justify-center p-4">
                                    <LoadingSpinner />
                                    <span className="ml-2">Uploading image...</span>
                                </div>
                            )}

                            {formData.image && (
                                <div className="relative inline-block">
                                    <img
                                        src={formData.image}
                                        alt="Menu item"
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dietary Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dietary Options
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.available}
                                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Available</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isVegetarian}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isVegan}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isVegan: e.target.checked }))}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Vegan</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isGlutenFree}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isGlutenFree: e.target.checked }))}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Gluten Free</span>
                            </label>
                        </div>
                    </div>

                    {/* Allergens */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allergens
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newAllergen}
                                onChange={(e) => setNewAllergen(e.target.value)}
                                placeholder="Add an allergen..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                            />
                            <button
                                type="button"
                                onClick={addAllergen}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.allergens.map((allergen, index) => (
                                <span
                                    key={index}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                                >
                                    {allergen}
                                    <button
                                        type="button"
                                        onClick={() => removeAllergen(index)}
                                        className="text-red-600 hover:text-red-800"
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
                            disabled={loading || uploadingImage}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <LoadingSpinner />}
                            {menuItem ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default MenuItemModal;
