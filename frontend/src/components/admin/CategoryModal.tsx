import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

interface Category {
    _id?: string;
    name: string;
    description: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
    onSave: (categoryData: Omit<Category, '_id'>) => Promise<void>;
    type: 'room' | 'food';
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    category,
    onSave,
    type
}) => {
    const [formData, setFormData] = useState<Omit<Category, '_id'>>({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description
            });
        } else {
            setFormData({
                name: '',
                description: ''
            });
        }
    }, [category, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(`Error saving ${type} category:`, error);
            alert(`Error saving ${type} category. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {category ? `Edit ${type} Category` : `Add New ${type} Category`}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${type} category name`}
                            required
                        />
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
                            placeholder={`Describe this ${type} category`}
                            required
                        />
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
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <LoadingSpinner />}
                            {category ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CategoryModal;
