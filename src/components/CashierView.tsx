import { useState } from 'react';
import { ShoppingCart, Camera, CreditCard, Trash2, Search } from 'lucide-react';
import { Product, ProductVariant, CartItem, Sale } from '../types';
import { Scanner } from './Scanner';
import { QuantityModal } from './QuantityModal';
import { Receipt } from './Receipt';

interface CashierViewProps {
  products: Product[];
  onSaleComplete: (sale: Sale) => void;
}

export const CashierView = ({ products, onSaleComplete }: CashierViewProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeScan, setActiveScan] = useState<{ product: Product; variant: ProductVariant } | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [cash, setCash] = useState<string>('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Can add tax/discount logic here
  const change = Math.max(0, Number(cash) - total);

  const handleScan = (decodedText: string) => {
    // Look for matching variant across all products
    for (const product of products) {
      const variant = product.variants.find(v => v.qrCode === decodedText || v.sku === decodedText);
      if (variant) {
        // Play success sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        audio.play().catch(e => console.error("Audio play failed", e));
        
        setActiveScan({ product, variant });
        setShowScanner(false);
        return;
      }
    }
    
    // Play error sound if product not found
    const errorAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    errorAudio.play().catch(e => console.error("Audio play failed", e));
    alert(`Product with code "${decodedText}" not found in inventory.`);
  };

  const addToCart = (quantity: number) => {
    if (!activeScan) return;
    
    const existingIndex = cart.findIndex(item => item.variantId === activeScan.variant.id);
    
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        variantId: activeScan.variant.id,
        productId: activeScan.product.id,
        name: activeScan.product.name,
        size: activeScan.variant.size,
        color: activeScan.variant.color,
        price: activeScan.variant.price,
        quantity: quantity,
      };
      setCart([...cart, newItem]);
    }
    setActiveScan(null);
  };

  const removeFromCart = (variantId: string) => {
    setCart(cart.filter(item => item.variantId !== variantId));
  };

  const handleCheckout = () => {
    if (Number(cash) < total) return;

    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      items: cart,
      total: total,
      payment: Number(cash),
      change: change,
    };

    onSaleComplete(sale);
    setLastSale(sale);
    setCart([]);
    setCash('');
    setIsCheckout(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 h-full lg:h-[calc(100vh-120px)]">
      {/* Left: Scanner & Product Search */}
      <div className="lg:col-span-4 space-y-4 lg:space-y-6 flex flex-col order-1">
        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border flex-1">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2">
              <Camera size={24} className="text-indigo-600" />
              Scanner
            </h2>
            <button 
              onClick={() => setShowScanner(!showScanner)}
              className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-sm lg:text-base font-bold transition-all ${showScanner ? 'bg-red-50 text-red-600' : 'bg-indigo-600 text-white'}`}
            >
              {showScanner ? 'Stop' : 'Open Camera'}
            </button>
          </div>

          <div className="relative">
            {showScanner ? (
              <Scanner onScan={handleScan} />
            ) : (
              <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-gray-400">
                <Camera size={40} className="mb-2 lg:mb-4" />
                <p className="text-sm">Camera is currently off</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Manual Code Entry..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleScan(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Press Enter to manual search SKU/QR Code</p>
          </div>
        </div>
      </div>

      {/* Center: Cart */}
      <div className="lg:col-span-5 flex flex-col h-[400px] lg:h-full order-3 lg:order-2">
        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border flex flex-col h-full overflow-hidden">
          <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2 mb-4 lg:mb-6">
            <ShoppingCart size={24} className="text-indigo-600" />
            Current Cart
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4 pr-1">
            {cart.map((item) => (
              <div key={item.variantId} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl group border border-transparent hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-600 shadow-sm border text-sm lg:text-base">
                    {item.size}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm lg:text-base text-gray-900">{item.name}</h4>
                    <p className="text-xs lg:text-sm text-gray-500">{item.color} • x{item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:gap-4">
                  <span className="font-bold text-base lg:text-lg">₱{item.price * item.quantity}</span>
                  <button 
                    onClick={() => removeFromCart(item.variantId)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-gray-400 opacity-60">
                <ShoppingCart size={48} className="mb-2 lg:mb-4" />
                <p className="text-sm lg:text-lg">Cart is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Payment */}
      <div className="lg:col-span-3 flex flex-col order-2 lg:order-3">
        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border h-full flex flex-col">
          <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2 mb-4 lg:mb-6">
            <CreditCard size={24} className="text-indigo-600" />
            Payment
          </h2>

          <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-8">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₱{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Discount</span>
              <span>₱0</span>
            </div>
            <div className="border-t pt-3 lg:pt-4 flex justify-between text-xl lg:text-2xl font-black text-gray-900">
              <span>TOTAL</span>
              <span>₱{total}</span>
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4 mt-auto">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Cash Received</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">₱</span>
                <input 
                  type="number" 
                  inputMode="decimal"
                  className="w-full pl-8 pr-4 py-3 lg:py-4 bg-indigo-50 border-2 border-indigo-100 rounded-xl lg:rounded-2xl text-xl lg:text-2xl font-bold focus:ring-0 focus:border-indigo-600"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-green-50 p-3 lg:p-4 rounded-xl lg:rounded-2xl flex justify-between items-center">
              <span className="text-xs lg:text-sm text-green-700 font-medium">Change Due</span>
              <span className="text-xl lg:text-2xl font-black text-green-700">₱{change}</span>
            </div>

            <button 
              disabled={cart.length === 0 || Number(cash) < total}
              onClick={() => setIsCheckout(true)}
              className="w-full py-4 lg:py-5 bg-indigo-600 text-white rounded-xl lg:rounded-2xl font-black text-lg lg:text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              COMPLETE SALE
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeScan && (
        <QuantityModal 
          product={activeScan.product}
          variant={activeScan.variant}
          onClose={() => setActiveScan(null)}
          onAdd={addToCart}
        />
      )}

      {isCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Confirm Checkout?</h3>
            <p className="text-gray-500 mb-6">Total amount is ₱{total}. Cash received is ₱{cash}.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsCheckout(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
              <button onClick={handleCheckout} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {lastSale && (
        <Receipt sale={lastSale} onClose={() => setLastSale(null)} />
      )}
    </div>
  );
};
