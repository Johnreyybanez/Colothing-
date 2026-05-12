import { Sale } from '../types';

interface ReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export const Receipt = ({ sale, onClose }: ReceiptProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm font-mono text-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-widest">FASHION STORE</h2>
          <p className="text-xs text-gray-500 mt-1">123 Street, Manila City</p>
          <p className="text-xs text-gray-500">Tel: (02) 888-8888</p>
        </div>

        <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
          <div className="flex justify-between mb-1">
            <span>Date:</span>
            <span>{new Date(sale.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Sale ID:</span>
            <span>#{sale.id.slice(0, 8)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
          {sale.items.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between font-bold">
                <span>{item.name}</span>
                <span>₱{item.price * item.quantity}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{item.color} / {item.size} x {item.quantity}</span>
                <span>₱{item.price} ea</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span>₱{sale.total}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>CASH</span>
            <span>₱{sale.payment}</span>
          </div>
          <div className="flex justify-between">
            <span>CHANGE</span>
            <span>₱{sale.change}</span>
          </div>
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="font-bold">THANK YOU!</p>
          <p className="text-xs text-gray-400">Please keep this receipt for returns</p>
        </div>

        <div className="mt-8 flex gap-2">
          <button 
            onClick={() => window.print()} 
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 font-bold"
          >
            PRINT
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-bold"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
