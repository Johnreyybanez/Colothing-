import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Product, Sale } from './types';
import { initDB, getDBProducts, saveDBProduct, deleteDBProduct, saveDBSale, getDBSales } from './storage';
import { AdminView } from './components/AdminView';
import { CashierView } from './components/CashierView';
import { Dashboard } from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'dashboard' | 'cashier' | 'admin' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('cashier');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [settings, setSettings] = useState({
    title: 'FASHION POS',
    favicon: 'https://cdn-icons-png.flaticon.com/512/3050/3050231.png',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3050/3050231.png'
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('pos_app_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      updateFavicon(parsed.favicon);
    }
  }, []);

  const updateFavicon = (url: string) => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'logo') {
          saveSettings({ ...settings, logoUrl: base64String });
        } else {
          saveSettings({ ...settings, favicon: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('pos_app_settings', JSON.stringify(newSettings));
    updateFavicon(newSettings.favicon);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        const storedProducts = await getDBProducts();
        const storedSales = await getDBSales();
        setProducts(storedProducts);
        setSales(storedSales);
      } catch (error) {
        console.error("DB Init failed", error);
      } finally {
        // Data loaded
      }
    };
    loadData();
  }, []);

  const handleAddProduct = async (product: Product) => {
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    await saveDBProduct(product);
  };

  const handleUpdateProduct = async (product: Product) => {
    const updatedProducts = products.map(p => p.id === product.id ? product : p);
    setProducts(updatedProducts);
    await saveDBProduct(product);
  };

  const handleDeleteProduct = async (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    await deleteDBProduct(id);
  };

  const handleSaleComplete = async (sale: Sale) => {
    // 1. Save Sale
    setSales([...sales, sale]);
    await saveDBSale(sale);

    // 2. Deduct Stock
    const updatedProducts = products.map(product => {
      const hasSaleItem = sale.items.some(item => item.productId === product.id);
      if (!hasSaleItem) return product;

      const newProduct = {
        ...product,
        variants: product.variants.map(variant => {
          const saleItem = sale.items.find(item => item.variantId === variant.id);
          if (saleItem) {
            return { ...variant, stock: Math.max(0, variant.stock - saleItem.quantity) };
          }
          return variant;
        })
      };
      saveDBProduct(newProduct);
      return newProduct;
    });

    setProducts(updatedProducts);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cashier', label: 'Cashier POS', icon: ShoppingCart },
    { id: 'admin', label: 'Inventory', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Toggle Button (Hidden when sidebar is open on desktop) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 hover:bg-gray-100 rounded-lg lg:flex hidden transition-all duration-200 border border-gray-200 bg-white text-gray-500 shadow-sm"
          title="Open sidebar"
        >
          <PanelLeft size={20} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'} 
        bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 fixed h-full z-50 overflow-hidden
      `}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 font-serif">{settings.title}</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
            title="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all text-sm
                ${activeView === item.id 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              <item.icon size={18} className={activeView === item.id ? 'text-indigo-600' : ''} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 text-sm font-medium hover:bg-red-50 hover:text-red-600 rounded-lg transition-all">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 p-4 lg:p-8 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Desktop Header spacer if sidebar is closed */}
        {!isSidebarOpen && <div className="hidden lg:block h-12" />}

        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden sticky top-0 bg-gray-50/80 backdrop-blur-md z-30 py-2">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-base font-serif italic text-gray-900">
              {menuItems.find(m => m.id === activeView)?.label}
            </span>
          </div>

          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {activeView === 'dashboard' && <Dashboard products={products} sales={sales} />}
            {activeView === 'cashier' && <CashierView products={products} onSaleComplete={handleSaleComplete} />}
            {activeView === 'admin' && (
              <AdminView 
                products={products} 
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct} 
              />
            )}
            {activeView === 'settings' && (
              <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border glass-morphism max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Settings size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-serif">System Branding</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Title</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-serif text-lg" 
                      value={settings.title}
                      onChange={(e) => saveSettings({...settings, title: e.target.value})}
                      placeholder="Enter Store Name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Logo</label>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-serif text-sm" 
                          value={settings.logoUrl}
                          onChange={(e) => saveSettings({...settings, logoUrl: e.target.value})}
                          placeholder="Image URL"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'logo')}
                            className="hidden" 
                            id="logo-upload"
                          />
                          <label 
                            htmlFor="logo-upload"
                            className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all text-sm font-serif text-gray-600"
                          >
                            Upload Logo
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Favicon (Browser Icon)</label>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-serif text-sm" 
                          value={settings.favicon}
                          onChange={(e) => saveSettings({...settings, favicon: e.target.value})}
                          placeholder="Favicon URL"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'favicon')}
                            className="hidden" 
                            id="favicon-upload"
                          />
                          <label 
                            htmlFor="favicon-upload"
                            className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all text-sm font-serif text-gray-600"
                          >
                            Upload Favicon
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Sidebar Branding Preview</h3>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm flex-shrink-0">
                        <img src={settings.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 font-serif">{settings.title}</p>
                        <p className="text-xs text-gray-500 italic">Sidebar header preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
