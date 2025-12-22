import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated && currentUser) {
    if (currentUser.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/counter');
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = login(username, password);
    
    if (success) {
      toast.success('Login successful!');
      const user = useStore.getState().currentUser;
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/counter');
      }
    } else {
      toast.error('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <div className="bg-card p-10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 gradient-primary rounded-2xl mx-auto flex items-center justify-center mb-6">
          <span className="text-white text-3xl font-bold">C</span>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-center mb-8">
          Enter your credentials to access the panel
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-12 h-12 bg-muted border-border rounded-xl"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 h-12 bg-muted border-border rounded-xl"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 gradient-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-xl">
          <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</p>
          <div className="text-xs text-center space-y-1">
            <p><span className="font-medium">Admin:</span> admin / admin123</p>
            <p><span className="font-medium">Counter:</span> counter / counter123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
