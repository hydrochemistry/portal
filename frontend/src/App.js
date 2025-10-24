import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';

// Import components
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import TeamPage from '@/components/TeamPage';
import ResearchPage from '@/components/ResearchPage';
import PublicationsPage from '@/components/PublicationsPage';
import NewsPage from '@/components/NewsPage';
import ContactPage from '@/components/ContactPage';
import ImageUpload from '@/components/ImageUpload';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Icons from lucide-react
import { 
  Beaker, 
  GraduationCap, 
  FileText, 
  Users, 
  Award, 
  Mail, 
  MapPin, 
  Phone,
  ExternalLink,
  Calendar,
  TrendingUp,
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Menu,
  X,
  Settings,
  LogOut,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Star,
  Eye,
  Shield,
  User,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false }) => {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
};

// Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: <Beaker className="w-4 h-4" /> },
    { path: '/team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { path: '/research', label: 'Research', icon: <Search className="w-4 h-4" /> },
    { path: '/publications', label: 'Publications', icon: <FileText className="w-4 h-4" /> },
    { path: '/news', label: 'News', icon: <Calendar className="w-4 h-4" /> },
    { path: '/contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> }
  ];

  if (isAdmin()) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <Settings className="w-4 h-4" /> });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl text-gray-900">Hydrochemistry Lab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            
            {user && (
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-3"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout ({user.name})
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// Login/Register Component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const [user] = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Login successful!');
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          toast.success('Registration successful! Please wait for admin approval.');
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '' });
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to access the admin panel' 
              : 'Register for an account (requires admin approval)'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '' });
              }}
            >
              {isLogin 
                ? "Don't have an account? Register" 
                : "Already have an account? Login"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Image Upload Component
const ImageUpload = ({ onUpload, label = "Upload Image" }) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/upload/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onUpload(response.data.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {uploading ? 'Uploading...' : (isDragActive ? 'Drop the image here' : label)}
      </p>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const [citations, setCitations] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [researchHighlights, setResearchHighlights] = useState([]);
  const [supervisorProfile, setSupervisorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [citationsRes, newsRes, featuredNewsRes, highlightsRes, settingsRes] = await Promise.all([
          axios.get(`${API}/citations`),
          axios.get(`${API}/news?limit=3`),
          axios.get(`${API}/news/featured`),
          axios.get(`${API}/research-highlights`),
          axios.get(`${API}/settings`)
        ]);
        
        setCitations(citationsRes.data);
        setRecentNews(newsRes.data);
        setFeaturedNews(featuredNewsRes.data);
        setResearchHighlights(highlightsRes.data?.slice(0, 3) || []);
        setSupervisorProfile(settingsRes.data?.supervisor_profile || {});
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Hydrochemistry Research Group
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Advancing environmental science through innovative research in hydrochemistry, 
              environmental forensics, and sustainable water management at Universiti Putra Malaysia.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link to="/research">Explore Our Research</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/publications">Latest Publications</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-8">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-3xl font-bold">Featured News</h2>
            </div>
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredNews.image_url && (
                  <div className="aspect-video lg:aspect-square">
                    <img 
                      src={featuredNews.image_url} 
                      alt={featuredNews.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(featuredNews.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{featuredNews.title}</h3>
                  <p className="text-gray-600 mb-4">{featuredNews.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">By {featuredNews.author}</span>
                    <Button asChild>
                      <Link to={`/news`}>Read More News</Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Research Highlights */}
      {researchHighlights.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Research Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {researchHighlights.map((highlight) => (
                <Card key={highlight.id} className="hover:shadow-lg transition-shadow">
                  {highlight.image_url && (
                    <div className="aspect-video">
                      <img 
                        src={highlight.image_url} 
                        alt={highlight.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{highlight.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{highlight.description}</p>
                    {highlight.link_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={highlight.link_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Learn More
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Citation Metrics */}
      {citations && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Research Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-blue-600">
                    {citations.total_citations.toLocaleString()}
                  </CardTitle>
                  <CardDescription>Total Citations</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendingUp className="w-8 h-8 mx-auto text-green-500" />
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-cyan-600">
                    {citations.h_index}
                  </CardTitle>
                  <CardDescription>H-Index</CardDescription>
                </CardHeader>
                <CardContent>
                  <Award className="w-8 h-8 mx-auto text-yellow-500" />
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-purple-600">
                    {citations.i10_index}
                  </CardTitle>
                  <CardDescription>i10-Index</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookOpen className="w-8 h-8 mx-auto text-indigo-500" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Principal Investigator Profile */}
      {supervisorProfile && Object.keys(supervisorProfile).length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Principal Investigator</h2>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 text-center">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                      <User className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{supervisorProfile.name}</h3>
                    <p className="text-gray-600 mb-4">{supervisorProfile.position}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold mb-3">Profile</h4>
                    <p className="text-gray-600 mb-6">{supervisorProfile.short_cv}</p>
                    
                    {supervisorProfile.education && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Education</h4>
                        <ul className="space-y-1">
                          {supervisorProfile.education.map((edu, index) => (
                            <li key={index} className="text-gray-600">• {edu}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {supervisorProfile.experience && (
                      <div>
                        <h4 className="font-semibold mb-3">Experience</h4>
                        <ul className="space-y-1">
                          {supervisorProfile.experience.map((exp, index) => (
                            <li key={index} className="text-gray-600">• {exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Our Research Group</h2>
              <p className="text-lg text-gray-600 mb-6">
                The Hydrochemistry Research Group at Universiti Putra Malaysia is a leading center 
                for environmental chemistry research. Under the direction of Professor Dr. Ahmad Zaharin Aris, 
                we focus on cutting-edge research in water quality, environmental forensics, and emerging contaminants.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our multidisciplinary approach combines analytical chemistry, environmental science, 
                and sustainable technology to address critical environmental challenges facing our region and the world.
              </p>
              <Button asChild>
                <Link to="/team">Meet Our Team</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Beaker className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600">State-of-the-art analytical methods</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <GraduationCap className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <h3 className="font-semibold mb-2">Education</h3>
                  <p className="text-sm text-gray-600">Training the next generation</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recent News */}
      {recentNews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">Latest News</h2>
              <Button variant="outline" asChild>
                <Link to="/news">View All News</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  {article.image_url && (
                    <div className="aspect-video">
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">{article.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">By {article.author}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/news`}>Read More</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Existing components (keeping for compatibility) - Team, Research, Publications, News, Contact pages will be added in next message due to length
// For now, keeping the basic structure

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/*" element={
              <>
                <Navigation />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  {/* Other routes will be added */}
                </Routes>
              </>
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
