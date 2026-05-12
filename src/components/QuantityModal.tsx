import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface QuantityModalProps {
  product: Product;
  variant: ProductVariant;
  onClose: () => void;
  onAdd: (quantity: number) => void;
}

export const QuantityModal = ({ product, variant, onClose, onAdd }: QuantityModalProps) => {
  const [quantity, setQuantity] = React.useState(1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
              <p className="text-gray-500">{variant.color} - {variant.size}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center justify-between py-6">
            <span className="text-2xl font-bold text-indigo-600">₱{variant.price}</span>
            <div className="text-right text-sm">
              <p className="text-gray-500">In Stock</p>
              <p className={`font-semibold ${variant.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                {variant.stock} units
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-6">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus size={20} />
            </button>
            <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => Math.min(variant.stock, q + 1))}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
              disabled={quantity >= variant.stock}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onAdd(quantity)}
              className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            >
              Add to Cart - ₱{variant.price * quantity}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
