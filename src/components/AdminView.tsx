import React, { useState } from 'react';
import { Plus, Trash2, Tag, Box, AlertCircle, QrCode, Edit3, X } from 'lucide-react';
import { Product, ProductVariant, Size } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface AdminViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const SIZES: Size[] = ['S', 'M', 'L', 'XL', 'XXL', 'One Size'];

export const AdminView = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: '',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200',
  });
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([
    { id: Math.random().toString(36).substr(2, 9), size: 'M', color: 'Black', price: 599, stock: 10 }
  ]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewProduct({ name: '', brand: '', category: '', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200' });
    setVariants([{ id: Math.random().toString(36).substr(2, 9), size: 'M', color: 'Black', price: 599, stock: 10 }]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      brand: product.brand,
      category: product.category,
      image: product.image,
    });
    setVariants([...product.variants]);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    setVariants([...variants, { id: Math.random().toString(36).substr(2, 9), size: 'M', color: 'Black', price: 599, stock: 10 }]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productId = editingId || Math.random().toString(36).substr(2, 9);
    
    const processedVariants: ProductVariant[] = variants.map((v, idx) => {
      const sku = v.sku || `${newProduct.name.substring(0, 3).toUpperCase()}-${v.color?.substring(0, 3).toUpperCase()}-${v.size}-${(idx + 1).toString().padStart(4, '0')}`;
      return {
        ...v,
        productId,
        sku,
        qrCode: v.qrCode || sku,
      } as ProductVariant;
    });

    const productData: Product = {
      id: productId,
      ...newProduct,
      variants: processedVariants
    };

    if (editingId) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage your clothing items and stock</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-all"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Product' : 'Create New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                      placeholder="e.g. Oversized Shirt"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Urban Wear"
                        value={newProduct.brand}
                        onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                        placeholder="T-Shirt"
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group">
                  {newProduct.image ? (
                    <>
                      <img src={newProduct.image} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Preview" />
                      <div className="relative z-10 text-center">
                        <Tag className="text-indigo-600 mx-auto mb-2" size={32} />
                        <p className="text-xs font-bold text-indigo-900 bg-white/80 px-2 py-1 rounded">Image Set</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Tag className="text-gray-400 mb-2" size={48} />
                      <p className="text-sm text-gray-500">No Image Selected</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewProduct({...newProduct, image: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Click to Upload
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Variants (Size/Color)</h3>
                  <button 
                    type="button"
                    onClick={handleAddVariant}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Variant
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-2">Size</th>
                        <th className="pb-2">Color</th>
                        <th className="pb-2">Price (₱)</th>
                        <th className="pb-2">Stock</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {variants.map((variant) => (
                        <tr key={variant.id}>
                          <td className="py-3">
                            <select 
                              className="border rounded px-2 py-1"
                              value={variant.size}
                              onChange={e => updateVariant(variant.id!, 'size', e.target.value)}
                            >
                              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="py-3">
                            <input 
                              type="text" 
                              className="border rounded px-2 py-1 w-24"
                              value={variant.color}
                              onChange={e => updateVariant(variant.id!, 'color', e.target.value)}
                            />
                          </td>
                          <td className="py-3">
                            <input 
                              type="number" 
                              className="border rounded px-2 py-1 w-24"
                              value={variant.price}
                              onChange={e => updateVariant(variant.id!, 'price', Number(e.target.value))}
                            />
                          </td>
                          <td className="py-3">
                            <input 
                              type="number" 
                              className="border rounded px-2 py-1 w-20"
                              value={variant.stock}
                              onChange={e => updateVariant(variant.id!, 'stock', Number(e.target.value))}
                            />
                          </td>
                          <td className="py-3">
                            <button 
                              type="button"
                              onClick={() => removeVariant(variant.id!)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden group">
            <div className="h-48 overflow-hidden relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEdit(product)}
                  className="p-2 bg-white/90 rounded-full text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => onDeleteProduct(product.id)}
                  className="p-2 bg-white/90 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded font-bold">
                {product.brand}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{product.category}</p>
              
              <div className="space-y-2">
                {product.variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{v.size}</span>
                      <span className="text-gray-400">|</span>
                      <span>{v.color}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-indigo-600">₱{v.price}</span>
                      <div className="flex items-center gap-1">
                        <Box size={14} className={v.stock < 5 ? 'text-red-500' : 'text-gray-400'} />
                        <span className={v.stock < 5 ? 'text-red-600 font-bold' : ''}>{v.stock}</span>
                      </div>
                      <div className="relative group/qr">
                        <QrCode size={18} className="text-gray-400 cursor-pointer hover:text-indigo-600" />
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover/qr:block bg-white p-2 rounded shadow-2xl border z-10 w-40 text-center">
                          <QRCodeSVG value={v.qrCode} size={140} className="mx-auto mb-1" />
                          <span className="text-[10px] font-mono break-all">{v.qrCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {product.variants.some(v => v.stock < 5) && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg text-xs font-semibold">
                  <AlertCircle size={14} />
                  Low stock alert!
                </div>
              )}
            </div>
          </div>
        ))}
        {products.length === 0 && !isModalOpen && (
          <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed rounded-3xl">
            <Tag className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No products found. Add your first clothing item!</p>
          </div>
        )}
      </div>
    </div>
  );
};
