import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Coffee, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Send,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { formatNepalTime } from '@/lib/nepalTime';

type Category = 'Tea' | 'Snacks' | 'Cold Drink' | 'Pastry';

const categoryIcons: Record<Category, string> = {
  'Tea': '🍵',
  'Snacks': '🍿',
  'Cold Drink': '🥤',
  'Pastry': '🍰',
};

export default function TableOrder() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { menuItems, settings, addOrder } = useStore();
  
  const [phone, setPhone] = useState('');
  const [isPhoneEntered, setIsPhoneEntered] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Tea');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const table = parseInt(tableNumber || '0');

  // Validate table number
  useEffect(() => {
    if (!table || table < 1 || table > settings.tableCount) {
      toast.error('Invalid table number');
      navigate('/');
    }
  }, [table, settings.tableCount, navigate]);

  const categories: Category[] = ['Tea', 'Snacks', 'Cold Drink', 'Pastry'];
  
  const filteredItems = menuItems.filter(
    item => item.category === activeCategory && item.available
  );

  const addToCart = (item: typeof menuItems[0]) => {
    const existing = cart.find(c => c.menuItemId === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c
      ));
    } else {
      setCart([...cart, {
        id: Math.random().toString(36).substring(2, 9),
        menuItemId: item.id,
        name: item.name,
        qty: 1,
        price: item.price,
      }]);
    }
  };

  const updateQty = (menuItemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.menuItemId === menuItemId) {
        const newQty = c.qty + delta;
        return newQty > 0 ? { ...c, qty: newQty } : c;
      }
      return c;
    }).filter(c => c.qty > 0));
  };

  const getItemQty = (menuItemId: string) => {
    return cart.find(c => c.menuItemId === menuItemId)?.qty || 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setIsPhoneEntered(true);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to your cart');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    addOrder(table, phone, cart, notes || undefined);
    
    toast.success('Order placed successfully!', {
      description: 'Your order has been sent to the counter.',
    });

    setCart([]);
    setNotes('');
    setIsSubmitting(false);
  };

  // Phone entry screen
  if (!isPhoneEntered) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="gradient-primary text-white p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Coffee className="w-8 h-8" />
            <h1 className="text-2xl font-bold">{settings.restaurantName}</h1>
          </div>
          <p className="text-white/80">Table {table}</p>
        </header>

        {/* Phone Entry */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-20 h-20 gradient-primary-soft rounded-full mx-auto flex items-center justify-center mb-4">
                <Phone className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Enter Your Phone</h2>
              <p className="text-muted-foreground">
                We'll use this to identify your order
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <Input
                type="tel"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="h-14 text-xl text-center tracking-widest bg-muted border-border rounded-xl"
                maxLength={10}
              />
              <Button
                type="submit"
                className="w-full h-14 gradient-primary text-white font-bold rounded-xl shadow-lg"
                disabled={phone.length < 10}
              >
                Continue to Menu
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {formatNepalTime(new Date())} • Nepal Time
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Menu and ordering screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-primary text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => setIsPhoneEntered(false)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-bold">{settings.restaurantName}</h1>
            <p className="text-xs text-white/80">Table {table} • {phone}</p>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-card border-b border-border sticky top-[72px] z-10">
        <div className="flex overflow-x-auto scrollbar-thin p-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'gradient-primary text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{categoryIcons[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 pb-32">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => {
            const qty = getItemQty(item.id);
            return (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border overflow-hidden card-shadow"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                  <p className="text-primary font-bold">रू {item.price}</p>
                </div>
                <div className="px-4 pb-4">
                  {qty === 0 ? (
                    <Button
                      onClick={() => addToCart(item)}
                      className="w-full h-10 gradient-primary text-white rounded-xl"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between bg-muted rounded-xl p-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-card flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold">{qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No items available in this category
          </div>
        )}

        {/* Notes */}
        {cart.length > 0 && (
          <div className="mt-6">
            <Textarea
              placeholder="Any special instructions? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-card border-border rounded-xl resize-none"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-medium">{cartCount} items</span>
            </div>
            <span className="text-xl font-bold text-primary">रू {cartTotal}</span>
          </div>
          <Button
            onClick={handleSubmitOrder}
            className="w-full h-14 gradient-primary text-white font-bold rounded-xl shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Placing Order...'
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Place Order
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
