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
import Footer from '@/components/Footer';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  AlertCircle,
  Lightbulb
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
  const [settings, setSettings] = useState({});
  const location = useLocation();
  const { user, logout, isWebAdmin } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        const fetchedSettings = response.data;
        
        // Initialize about_cards if not present
        if (!fetchedSettings.about_cards) {
          fetchedSettings.about_cards = [
            { title: 'Advanced Analytics', description: 'State-of-the-art analytical methods' },
            { title: 'Education', description: 'Training the next generation' }
          ];
        }
        
        setSettings(fetchedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: <Beaker className="w-4 h-4" /> },
    { path: '/team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { path: '/research', label: 'Research', icon: <Search className="w-4 h-4" /> },
    { path: '/publications', label: 'Publications', icon: <FileText className="w-4 h-4" /> },
    { path: '/news', label: 'News', icon: <Calendar className="w-4 h-4" /> },
    { path: '/contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> }
  ];

  if (isWebAdmin()) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <Settings className="w-4 h-4" /> });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {settings.show_menu_logo !== false && (settings.menu_logo_url || settings.logo_url) ? (
              <img 
                src={settings.menu_logo_url || settings.logo_url} 
                alt="Lab Logo" 
                className="w-8 h-8 object-contain" 
              />
            ) : settings.show_menu_logo !== false ? (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Beaker className="w-5 h-5 text-white" />
              </div>
            ) : null}
            <span className="font-semibold text-xl text-gray-900">
              {settings.lab_name || 'Hydrochemistry Lab'}
            </span>
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
  const { login, register, user } = useAuth();

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

// Removed duplicate ImageUpload - using imported version

// Home Page Component
const HomePage = () => {
  const [citations, setCitations] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [featuredPublications, setFeaturedPublications] = useState([]);
  const [researchHighlights, setResearchHighlights] = useState([]);
  const [supervisorProfile, setSupervisorProfile] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [citationsRes, newsRes, featuredNewsRes, highlightsRes, settingsRes, featuredPubsRes] = await Promise.all([
          axios.get(`${API}/citations`),
          axios.get(`${API}/news?limit=3`),
          axios.get(`${API}/news/featured`),
          axios.get(`${API}/research-highlights`),
          axios.get(`${API}/settings`),
          axios.get(`${API}/featured-publications`)
        ]);
        
        setCitations(citationsRes.data);
        setRecentNews(newsRes.data);
        setFeaturedNews(featuredNewsRes.data || null);
        setFeaturedPublications(featuredPubsRes.data || []);
        setResearchHighlights(Array.isArray(highlightsRes.data) ? highlightsRes.data.slice(0, 3) : []);
        setSupervisorProfile(settingsRes.data?.supervisor_profile || {});
        setSettings(settingsRes.data || {});
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
    <div className="bg-white">
      {/* Hero Section */}
      {settings.show_hero_section !== false && (
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                {settings.lab_name || 'Hydrochemistry Research Group'}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {settings.hero_description || 'Advancing environmental science through innovative research in hydrochemistry, environmental forensics, and sustainable water management at Universiti Putra Malaysia.'}
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg" asChild>
                  <Link to="/research">{settings.hero_button1_text || 'Explore Our Research'}</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/publications">{settings.hero_button2_text || 'Latest Publications'}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section - Now appears first */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Optional Lab Info Logo */}
              {settings.show_lab_info_logo && settings.logo_url && (
                <div className="mb-6">
                  <img 
                    src={settings.logo_url} 
                    alt="Lab Logo" 
                    className="h-24 object-contain" 
                  />
                </div>
              )}
              
              <h2 className="text-3xl font-bold mb-6">
                {settings.about_section_title || 'About Our Research Group'}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {settings.about_content || 'The Hydrochemistry Research Group at Universiti Putra Malaysia is a leading center for environmental chemistry research. Under the direction of Professor Dr. Ahmad Zaharin Aris, we focus on cutting-edge research in water quality, environmental forensics, and emerging contaminants.'}
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
              {settings.about_cards && settings.about_cards.length > 0 ? (
                settings.about_cards.map((card, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-6 text-center">
                      {idx === 0 ? (
                        <Beaker className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      ) : (
                        <GraduationCap className="w-12 h-12 mx-auto text-green-600 mb-4" />
                      )}
                      <h3 className="font-semibold mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content - Publication and News Side by Side */}
      {(featuredPublications.length > 0 || featuredNews) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Featured Publications - Left Side */}
              {featuredPublications.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                    <h2 className="text-2xl font-bold">Featured Publications</h2>
                  </div>
                  <div className="space-y-4">
                    {featuredPublications.slice(0, 5).map((pub) => (
                      <Card key={pub.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {pub.graphical_abstract && (
                              <img src={pub.graphical_abstract} alt="Graphic" className="w-20 h-20 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                                <Badge>{pub.year}</Badge>
                              </div>
                              <h3 className="text-sm font-bold mb-1 line-clamp-2">{pub.title}</h3>
                              <p className="text-xs text-gray-600 line-clamp-1">{pub.authors}</p>
                              <p className="text-xs text-blue-600 font-medium">{pub.journal}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button size="sm" className="mt-4" asChild>
                    <Link to="/publications">View All Publications</Link>
                  </Button>
                </div>
              )}

              {/* Featured News - Right Side */}
              {featuredNews ? (
                <div>
                  <div className="flex items-center mb-6">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <h2 className="text-2xl font-bold">Featured News</h2>
                  </div>
                  <Card className="overflow-hidden h-full">
                    {featuredNews.image_url && (
                      <div className="aspect-video">
                        <img 
                          src={featuredNews.image_url} 
                          alt={featuredNews.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredNews.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-3 line-clamp-2">{featuredNews.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-4">{featuredNews.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">By {featuredNews.author}</span>
                        <Button size="sm" asChild>
                          <Link to="/news">Read More News</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div></div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* Research Highlights */}
      {Array.isArray(researchHighlights) && researchHighlights.length > 0 && (
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

      {/* Latest News section removed - now using Featured News only */}
    </div>
  );
};

// Existing components (keeping for compatibility) - Team, Research, Publications, News, Contact pages will be added in next message due to length
// For now, keeping the basic structure

// Admin Panel Component
const AdminPanel = () => {
  const { isSuperAdmin } = useAuth();
  
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage your research group website</p>
          </div>

          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="research-areas">Research Areas</TabsTrigger>
              {isSuperAdmin() && <TabsTrigger value="users">Users</TabsTrigger>}
            </TabsList>

            <TabsContent value="settings">
              <SiteSettingsPanel />
            </TabsContent>
            
            <TabsContent value="team">
              <TeamManagementPanel />
            </TabsContent>
            
            <TabsContent value="research">
              <ResearchManagementPanel />
            </TabsContent>
            
            <TabsContent value="highlights">
              <HighlightsManagementPanel />
            </TabsContent>
            
            <TabsContent value="publications">
              <PublicationsManagementPanel />
            </TabsContent>
            
            <TabsContent value="research-areas">
              <ResearchAreasManagementPanel />
            </TabsContent>
            
            {isSuperAdmin() && (
              <TabsContent value="users">
                <UserManagementPanel />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Site Settings Panel
const SiteSettingsPanel = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        const fetchedSettings = response.data;
        
        // Initialize about_cards if not present
        if (!fetchedSettings.about_cards) {
          fetchedSettings.about_cards = [
            { title: 'Advanced Analytics', description: 'State-of-the-art analytical methods' },
            { title: 'Education', description: 'Training the next generation' }
          ];
        }
        
        setSettings(fetchedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/admin/settings`, settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error.response || error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error updating settings';
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lab Information</CardTitle>
          <CardDescription>Basic information about your research group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lab_name">Lab Name</Label>
            <Input
              id="lab_name"
              value={settings.lab_name || ''}
              onChange={(e) => setSettings({...settings, lab_name: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="about_section_title">About Section Title</Label>
            <Input
              id="about_section_title"
              value={settings.about_section_title || ''}
              onChange={(e) => setSettings({...settings, about_section_title: e.target.value})}
              placeholder="About Our Research Group"
            />
          </div>
          
          <div>
            <Label htmlFor="about_content">About Content</Label>
            <Textarea
              id="about_content"
              value={settings.about_content || ''}
              onChange={(e) => setSettings({...settings, about_content: e.target.value})}
              className="min-h-32"
            />


          <div>
            <Label>About Section Cards</Label>
            {settings.about_cards && settings.about_cards.map((card, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 mb-3 p-3 border rounded">
                <Input
                  placeholder="Card Title"
                  value={card.title}
                  onChange={(e) => {
                    const newCards = [...settings.about_cards];
                    newCards[idx].title = e.target.value;
                    setSettings({...settings, about_cards: newCards});
                  }}
                />
                <Input
                  placeholder="Card Description"
                  value={card.description}
                  onChange={(e) => {
                    const newCards = [...settings.about_cards];
                    newCards[idx].description = e.target.value;
                    setSettings({...settings, about_cards: newCards});
                  }}
                />
              </div>
            ))}
          </div>

          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Configure the hero section display and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show_hero_section"
              checked={settings.show_hero_section !== false}
              onCheckedChange={(checked) => setSettings({...settings, show_hero_section: checked})}
            />
            <Label htmlFor="show_hero_section">Show Hero Section on Homepage</Label>
          </div>
          
          <div>
            <Label htmlFor="hero_description">Hero Section Description</Label>
            <Textarea
              id="hero_description"
              value={settings.hero_description || ''}
              onChange={(e) => setSettings({...settings, hero_description: e.target.value})}
              className="min-h-24"
              placeholder="Main description text for the hero section"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hero_button1_text">Hero Button 1 Text</Label>
              <Input
                id="hero_button1_text"
                value={settings.hero_button1_text || ''}
                onChange={(e) => setSettings({...settings, hero_button1_text: e.target.value})}
                placeholder="Explore Our Research"
              />
            </div>
            <div>
              <Label htmlFor="hero_button2_text">Hero Button 2 Text</Label>
              <Input
                id="hero_button2_text"
                value={settings.hero_button2_text || ''}
                onChange={(e) => setSettings({...settings, hero_button2_text: e.target.value})}
                placeholder="Latest Publications"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="scopus_id">SCOPUS Author ID</Label>
            <Input
              id="scopus_id"
              value={settings.scopus_author_id || ''}
              onChange={(e) => setSettings({...settings, scopus_author_id: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="show_scopus" className="font-semibold">Show SCOPUS Publications Tab</Label>
              <p className="text-sm text-gray-500">Display "Recent from SCOPUS" tab on Publications page</p>
            </div>
            <Switch
              id="show_scopus"
              checked={settings.show_scopus_publications !== false}
              onCheckedChange={(checked) => setSettings({...settings, show_scopus_publications: checked})}
            />
          </div>

          
          <div>
            <Label htmlFor="copyright_text">Copyright Statement</Label>
            <Textarea
              id="copyright_text"
              value={settings.copyright_text || ''}
              onChange={(e) => setSettings({...settings, copyright_text: e.target.value})}
              placeholder="© 2024 Hydrochemistry Research Group, Universiti Putra Malaysia. All rights reserved."
              className="min-h-16"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo Settings</CardTitle>
          <CardDescription>Manage logo display in different sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Menu Panel Logo */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Menu Panel Logo</Label>
                <p className="text-sm text-gray-500">Logo displayed in the navigation bar</p>
              </div>
              <Switch
                id="show_menu_logo"
                checked={settings.show_menu_logo !== false}
                onCheckedChange={(checked) => setSettings({...settings, show_menu_logo: checked})}
              />
            </div>
            
            {settings.show_menu_logo !== false && (
              <>
                <ImageUpload 
                  onUpload={(url) => setSettings({...settings, menu_logo_url: url})}
                  label="Upload Menu Logo (optional - uses Lab Logo if not set)"
                />
                {settings.menu_logo_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Menu Logo Preview:</p>
                    <img src={settings.menu_logo_url} alt="Menu Logo" className="h-12 object-contain" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Lab Information Logo */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Lab Information Logo</Label>
                <p className="text-sm text-gray-500">Logo displayed in the about/lab info section</p>
              </div>
              <Switch
                id="show_lab_info_logo"
                checked={settings.show_lab_info_logo === true}
                onCheckedChange={(checked) => setSettings({...settings, show_lab_info_logo: checked})}
              />
            </div>
            
            {settings.show_lab_info_logo === true && (
              <>
                <ImageUpload 
                  onUpload={(url) => setSettings({...settings, logo_url: url})}
                  label="Upload Lab Info Logo"
                />
                {settings.logo_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Lab Info Logo Preview:</p>
                    <img src={settings.logo_url} alt="Lab Logo" className="h-16 object-contain" />
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If Menu Logo is not uploaded, the system will use Lab Info Logo for the menu. You can upload different logos for each section.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Principal Investigator Profile</CardTitle>
          <CardDescription>Full profile always appears on Team page. Use "PI Display on Homepage" below to control home page visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supervisor_name">Name</Label>
              <Input
                id="supervisor_name"
                value={settings.supervisor_profile?.name || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  supervisor_profile: {
                    ...settings.supervisor_profile,
                    name: e.target.value
                  }
                })}
                placeholder="Prof. Dr. Ahmad Zaharin Aris"
              />
            </div>
            <div>
              <Label htmlFor="supervisor_position">Title/Position</Label>
              <Input
                id="supervisor_position"
                value={settings.supervisor_profile?.title || settings.supervisor_profile?.position || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  supervisor_profile: {
                    ...settings.supervisor_profile,
                    title: e.target.value,
                    position: e.target.value
                  }
                })}
                placeholder="Professor & Principal Investigator"
              />
            </div>
          </div>


          <div>
            <Label>Principal Investigator Photo</Label>
            <ImageUpload 
              onUpload={(url) => setSettings({
                ...settings, 
                supervisor_profile: {
                  ...settings.supervisor_profile,
                  photo_url: url
                }
              })}
              label="Upload PI Photo"
            />
            {settings.supervisor_profile?.photo_url && (
              <div className="mt-2">
                <img 
                  src={settings.supervisor_profile.photo_url} 
                  alt="PI Photo" 
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          
          <div>
            <Label htmlFor="supervisor_cv">Bio / Short CV</Label>
            <Textarea
              id="supervisor_cv"
              value={settings.supervisor_profile?.bio || settings.supervisor_profile?.short_cv || ''}
              onChange={(e) => setSettings({
                ...settings, 
                supervisor_profile: {
                  ...settings.supervisor_profile,
                  bio: e.target.value,
                  short_cv: e.target.value
                }
              })}
              className="min-h-24"
              placeholder="Brief professional summary..."
            />
          </div>
          
          <div>
            <Label htmlFor="supervisor_education">Education (one per line)</Label>
            <Textarea
              id="supervisor_education"
              value={settings.supervisor_profile?.education?.join('\n') || ''}
              onChange={(e) => setSettings({
                ...settings, 
                supervisor_profile: {
                  ...settings.supervisor_profile,
                  education: e.target.value.split('\n').filter(line => line.trim())
                }
              })}
              className="min-h-24"
              placeholder="Ph.D. in Environmental Chemistry, University Name, Year&#10;M.Sc. in Chemistry, University Name, Year"
            />
          </div>
          
          <div>
            <Label htmlFor="supervisor_experience">Experience (one per line)</Label>
            <Textarea
              id="supervisor_experience"
              value={settings.supervisor_profile?.experience?.join('\n') || ''}
              onChange={(e) => setSettings({
                ...settings, 
                supervisor_profile: {
                  ...settings.supervisor_profile,
                  experience: e.target.value.split('\n').filter(line => line.trim())
                }
              })}
              className="min-h-24"
              placeholder="Professor, Department Name, University, Year-Present&#10;Associate Professor, Department Name, University, Year-Year"
            />
          </div>
          
          <div>
            <Label htmlFor="supervisor_awards">Awards & Recognition (one per line)</Label>
            <Textarea
              id="supervisor_awards"
              value={settings.supervisor_profile?.awards?.join('\n') || ''}
              onChange={(e) => setSettings({
                ...settings, 
                supervisor_profile: {
                  ...settings.supervisor_profile,
                  awards: e.target.value.split('\n').filter(line => line.trim())
                }
              })}
              className="min-h-24"
              placeholder="Excellence in Research Award, Organization, Year&#10;Best Paper Award, Conference Name, Year"
            />
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supervisor_email">Email</Label>
              <Input
                id="supervisor_email"
                type="email"
                value={settings.supervisor_profile?.email || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  supervisor_profile: {
                    ...settings.supervisor_profile,
                    email: e.target.value
                  }
                })}
                placeholder="email@university.edu"
              />
            </div>
            <div>
              <Label htmlFor="supervisor_scopus">SCOPUS ID</Label>
              <Input
                id="supervisor_scopus"
                value={settings.supervisor_profile?.scopus_id || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  supervisor_profile: {
                    ...settings.supervisor_profile,
                    scopus_id: e.target.value
                  }
                })}
                placeholder="12345678900"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supervisor_scholar">Google Scholar URL</Label>
            <Input
              id="supervisor_scholar"
              value={settings.supervisor_profile?.google_scholar || ''}
              onChange={(e) => setSettings({
                ...settings, 
                supervisor_profile: {
                  ...settings.supervisor_profile,
                  google_scholar: e.target.value
                }
              })}
              placeholder="https://scholar.google.com/citations?user=..."
            />
          </div>

        </CardContent>

      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PI Display Settings - Team Page</CardTitle>
          <CardDescription>Control visibility of PI information on dedicated Team page. All fields show by default.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-3">Uncheck to hide specific fields on Team → Principal Investigator page:</p>
          <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Photo</Label>
                <Switch
                  checked={settings.pi_team_display?.show_photo !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_photo: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Name</Label>
                <Switch
                  checked={settings.pi_team_display?.show_name !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_name: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Title</Label>
                <Switch
                  checked={settings.pi_team_display?.show_title !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_title: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Bio</Label>
                <Switch
                  checked={settings.pi_team_display?.show_bio !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_bio: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Education</Label>
                <Switch
                  checked={settings.pi_team_display?.show_education !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_education: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Research Interests</Label>
                <Switch
                  checked={settings.pi_team_display?.show_research_interests !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_research_interests: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Experience</Label>
                <Switch
                  checked={settings.pi_team_display?.show_experience !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_experience: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Awards</Label>
                <Switch
                  checked={settings.pi_team_display?.show_awards !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_awards: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <Label className="text-sm">Contact Info</Label>
                <Switch
                  checked={settings.pi_team_display?.show_contact !== false}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    pi_team_display: { ...settings.pi_team_display, show_contact: checked }
                  })}
                />
              </div>
            </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
};

// Team Management Panel
const TeamManagementPanel = () => {
  const [team, setTeam] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '', position: '', email: '', bio: '', photo_url: '',
    scopus_id: '', google_scholar: '', orcid: '', research_focus: '', 
    current_work: '', is_supervisor: false, order_index: 0,
    status: 'active', role: 'Researcher'
  });

  // Role options based on status
  const activeRoles = ['Principal', 'Researcher', 'Post-Doctoral', 'PhD Student', 'MS Student', 'Intern', 'Research Assistant', 'Research Attachment', 'Collaborator'];
  const alumniRoles = ['Post-Doctoral', 'PhD Student', 'MS Student', 'Intern', 'Research Assistant', 'Research Attachment'];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      setTeam(response.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const handleSaveMember = async () => {
    try {
      if (editingMember) {
        await axios.put(`${API}/admin/team/${editingMember.id}`, newMember);
        toast.success('Team member updated!');
      } else {
        await axios.post(`${API}/admin/team`, newMember);
        toast.success('Team member added!');
      }
      
      resetForm();
      fetchTeam();
    } catch (error) {
      toast.error('Error saving team member');
    }
  };

  const resetForm = () => {
    setNewMember({
      name: '', position: '', email: '', bio: '', photo_url: '',
      scopus_id: '', google_scholar: '', orcid: '', research_focus: '', 
      current_work: '', is_supervisor: false, order_index: 0,
      status: 'active', role: 'Researcher'
    });
    setEditingMember(null);
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={newMember.position}
                    onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={newMember.status} 
                    onValueChange={(value) => {
                      setNewMember({...newMember, status: value});
                      // Reset role when changing status
                      if (value === 'alumni' && !alumniRoles.includes(newMember.role)) {
                        setNewMember({...newMember, status: value, role: 'PhD Student'});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Role</Label>
                  <Select 
                    value={newMember.role} 
                    onValueChange={(value) => setNewMember({...newMember, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(newMember.status === 'alumni' ? alumniRoles : activeRoles).map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {newMember.status === 'alumni' ? 'Former position' : 'Current position in team'}
                  </p>
                </div>

                {newMember.role === 'Collaborator' && (
                  <div>
                    <Label>Country</Label>
                    <Select 
                      value={newMember.country} 
                      onValueChange={(value) => setNewMember({...newMember, country: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MY">Malaysia</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="ID">Indonesia</SelectItem>
                        <SelectItem value="TH">Thailand</SelectItem>
                        <SelectItem value="PH">Philippines</SelectItem>
                        <SelectItem value="VN">Vietnam</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="CN">China</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={newMember.bio}
                  onChange={(e) => setNewMember({...newMember, bio: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Photo</Label>
                <ImageUpload 
                  onUpload={(url) => setNewMember({...newMember, photo_url: url})}
                  label="Upload member photo"
                />
                {newMember.photo_url && (
                  <img src={newMember.photo_url} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Research Focus</Label>
                  <Textarea
                    value={newMember.research_focus}
                    onChange={(e) => setNewMember({...newMember, research_focus: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Current Work</Label>
                  <Textarea
                    value={newMember.current_work}
                    onChange={(e) => setNewMember({...newMember, current_work: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>SCOPUS ID</Label>
                  <Input
                    value={newMember.scopus_id}
                    onChange={(e) => setNewMember({...newMember, scopus_id: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Google Scholar</Label>
                  <Input
                    value={newMember.google_scholar}
                    onChange={(e) => setNewMember({...newMember, google_scholar: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ORCID</Label>
                  <Input
                    value={newMember.orcid}
                    onChange={(e) => setNewMember({...newMember, orcid: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newMember.is_supervisor}
                  onCheckedChange={(checked) => setNewMember({...newMember, is_supervisor: checked})}
                />
                <Label>Is Supervisor</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSaveMember}>
                  {editingMember ? 'Update' : 'Add'} Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.position}</p>
                  {member.is_supervisor && <Badge className="mt-1">Supervisor</Badge>}
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setEditingMember(member);
                      setNewMember(member);
                      setShowAddDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Placeholder panels (simplified for now)
const ResearchManagementPanel = () => {
  const [activeTab, setActiveTab] = useState('grants');
  const [grants, setGrants] = useState([]);
  const [awards, setAwards] = useState([]);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [newGrant, setNewGrant] = useState({
    title: '', funding_amount: '', start_year: new Date().getFullYear(),
    end_year: new Date().getFullYear(), funding_agency: '', description: ''
  });
  const [newAward, setNewAward] = useState({
    year: new Date().getFullYear(), title: '', awarding_organization: '', 
    description: '', recipient: 'Prof. Dr. Ahmad Zaharin Aris'
  });

  useEffect(() => {
    fetchGrants();
    fetchAwards();
  }, []);

  const fetchGrants = async () => {
    try {
      const response = await axios.get(`${API}/research-grants`);
      setGrants(response.data);
    } catch (error) {
      console.error('Error fetching grants:', error);
    }
  };

  const fetchAwards = async () => {
    try {
      const response = await axios.get(`${API}/awards`);
      setAwards(response.data);
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  };

  const handleSaveGrant = async () => {
    try {
      await axios.post(`${API}/admin/research-grants`, newGrant);
      toast.success('Research grant added successfully!');
      setNewGrant({
        title: '', funding_amount: '', start_year: new Date().getFullYear(),
        end_year: new Date().getFullYear(), funding_agency: '', description: ''
      });
      setShowGrantDialog(false);
      fetchGrants();
    } catch (error) {
      toast.error('Error adding research grant');
    }
  };

  const handleSaveAward = async () => {
    try {
      await axios.post(`${API}/admin/awards`, newAward);
      toast.success('Award added successfully!');
      setNewAward({
        year: new Date().getFullYear(), title: '', awarding_organization: '', 
        description: '', recipient: 'Prof. Dr. Ahmad Zaharin Aris'
      });
      setShowAwardDialog(false);
      fetchAwards();
    } catch (error) {
      toast.error('Error adding award');
    }
  };

  const deleteGrant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grant?')) return;
    try {
      await axios.delete(`${API}/admin/research-grants/${id}`);
      toast.success('Grant deleted successfully!');
      fetchGrants();
    } catch (error) {
      toast.error('Error deleting grant');
    }
  };

  const deleteAward = async (id) => {
    if (!window.confirm('Are you sure you want to delete this award?')) return;
    try {
      await axios.delete(`${API}/admin/awards/${id}`);
      toast.success('Award deleted successfully!');
      fetchAwards();
    } catch (error) {
      toast.error('Error deleting award');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grants">Research Grants</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="grants" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Research Grants</h3>
            <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Research Grant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newGrant.title}
                      onChange={(e) => setNewGrant({...newGrant, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Year</Label>
                      <Input
                        type="number"
                        value={newGrant.start_year}
                        onChange={(e) => setNewGrant({...newGrant, start_year: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>End Year</Label>
                      <Input
                        type="number"
                        value={newGrant.end_year}
                        onChange={(e) => setNewGrant({...newGrant, end_year: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Funding Agency</Label>
                    <Input
                      value={newGrant.funding_agency}
                      onChange={(e) => setNewGrant({...newGrant, funding_agency: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Funding Amount (Optional)</Label>
                    <Input
                      value={newGrant.funding_amount}
                      onChange={(e) => setNewGrant({...newGrant, funding_amount: e.target.value})}
                      placeholder="e.g., RM 500,000"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newGrant.description}
                      onChange={(e) => setNewGrant({...newGrant, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowGrantDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveGrant}>Add Grant</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {grants.map((grant) => (
              <Card key={grant.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{grant.title}</h4>
                      <p className="text-gray-600 mb-2">{grant.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Duration: {grant.start_year} - {grant.end_year}</span>
                        <span>Agency: {grant.funding_agency}</span>
                        {grant.funding_amount && <span>Amount: {grant.funding_amount}</span>}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteGrant(grant.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {grants.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No research grants added yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="awards" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Awards</h3>
            <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Award
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Award</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={newAward.year}
                        onChange={(e) => setNewAward({...newAward, year: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Recipient</Label>
                      <Input
                        value={newAward.recipient}
                        onChange={(e) => setNewAward({...newAward, recipient: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Award Title</Label>
                    <Input
                      value={newAward.title}
                      onChange={(e) => setNewAward({...newAward, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Awarding Organization</Label>
                    <Input
                      value={newAward.awarding_organization}
                      onChange={(e) => setNewAward({...newAward, awarding_organization: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={newAward.description}
                      onChange={(e) => setNewAward({...newAward, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAwardDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveAward}>Add Award</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {awards.map((award) => (
              <Card key={award.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <Badge>{award.year}</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteAward(award.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <h4 className="font-semibold mb-2">{award.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{award.awarding_organization}</p>
                  <p className="text-sm text-gray-500 mb-2">Recipient: {award.recipient}</p>
                  {award.description && (
                    <p className="text-sm text-gray-600">{award.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {awards.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="p-12 text-center">
                  <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No awards added yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const HighlightsManagementPanel = () => {
  const [highlights, setHighlights] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [newHighlight, setNewHighlight] = useState({
    title: '', description: '', image_url: '', link_url: '', 
    is_featured: false, order_index: 0
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const response = await axios.get(`${API}/research-highlights`);
      setHighlights(response.data);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingHighlight) {
        await axios.put(`${API}/admin/research-highlights/${editingHighlight.id}`, newHighlight);
        toast.success('Research highlight updated!');
      } else {
        await axios.post(`${API}/admin/research-highlights`, newHighlight);
        toast.success('Research highlight added!');
      }
      
      resetForm();
      fetchHighlights();
    } catch (error) {
      toast.error('Error saving research highlight');
    }
  };

  const deleteHighlight = async (id) => {
    if (!window.confirm('Are you sure you want to delete this research highlight?')) return;
    try {
      await axios.delete(`${API}/admin/research-highlights/${id}`);
      toast.success('Research highlight deleted!');
      fetchHighlights();
    } catch (error) {
      toast.error('Error deleting research highlight');
    }
  };

  const resetForm = () => {
    setNewHighlight({
      title: '', description: '', image_url: '', link_url: '', 
      is_featured: false, order_index: 0
    });
    setEditingHighlight(null);
    setShowDialog(false);
  };

  const editHighlight = (highlight) => {
    setEditingHighlight(highlight);
    setNewHighlight(highlight);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Research Highlights Management</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Research Highlight
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingHighlight ? 'Edit' : 'Add'} Research Highlight</DialogTitle>
              <DialogDescription>
                Create research highlights to showcase on the homepage
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newHighlight.title}
                  onChange={(e) => setNewHighlight({...newHighlight, title: e.target.value})}
                  placeholder="Research highlight title"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newHighlight.description}
                  onChange={(e) => setNewHighlight({...newHighlight, description: e.target.value})}
                  placeholder="Brief description of the research highlight"
                />
              </div>
              
              <div>
                <Label>Image</Label>
                <ImageUpload 
                  onUpload={(url) => setNewHighlight({...newHighlight, image_url: url})}
                  label="Upload highlight image"
                />
                {newHighlight.image_url && (
                  <div className="mt-2">
                    <img 
                      src={newHighlight.image_url} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label>Link URL (Optional)</Label>
                <Input
                  value={newHighlight.link_url}
                  onChange={(e) => setNewHighlight({...newHighlight, link_url: e.target.value})}
                  placeholder="https://example.com/research-details"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newHighlight.is_featured}
                    onCheckedChange={(checked) => setNewHighlight({...newHighlight, is_featured: checked})}
                  />
                  <Label>Featured on homepage</Label>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={newHighlight.order_index}
                    onChange={(e) => setNewHighlight({...newHighlight, order_index: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSave}>
                  {editingHighlight ? 'Update' : 'Add'} Highlight
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((highlight) => (
          <Card key={highlight.id} className="overflow-hidden">
            {highlight.image_url && (
              <div className="aspect-video">
                <img 
                  src={highlight.image_url} 
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold line-clamp-2">{highlight.title}</h3>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => editHighlight(highlight)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => deleteHighlight(highlight.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{highlight.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {highlight.is_featured && (
                    <Badge variant="secondary">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <span className="text-gray-500">Order: {highlight.order_index}</span>
                </div>
                {highlight.link_url && (
                  <a 
                    href={highlight.link_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {highlights.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No research highlights added yet.</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Research Highlight
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const PublicationsManagementPanel = () => {
  const [publications, setPublications] = useState([]);
  const [staticPublications, setStaticPublications] = useState([]);
  const [books, setBooks] = useState([]);
  const [intellectualProperties, setIntellectualProperties] = useState([]);
  const [featuredPubs, setFeaturedPubs] = useState([]);
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false);
  const [editingFeatured, setEditingFeatured] = useState(null);
  const [newFeatured, setNewFeatured] = useState({ title: '', authors: '', journal: '', year: new Date().getFullYear(), volume: '', issue: '', pages: '', doi: '', link: '', graphical_abstract: '' });
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [showIPDialog, setShowIPDialog] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', authors: '', year: new Date().getFullYear(), publisher: '', link: '', cover_image_url: '' });
  const [newIP, setNewIP] = useState({ type: 'Patent', title: '', year: new Date().getFullYear(), synopsis: '' });
  const [editingBook, setEditingBook] = useState(null);
  const [editingIP, setEditingIP] = useState(null);

  useEffect(() => {
    fetchPublications();
    fetchStaticPublications();
    fetchFeaturedPublications();
    fetchBooks();
    fetchIntellectualProperties();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await axios.get(`${API}/publications`);
      setPublications(response.data);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const fetchStaticPublications = async () => {
    try {
      const response = await axios.get(`${API}/static-publications`);
      setStaticPublications(response.data);
    } catch (error) {
      console.error('Error fetching static publications:', error);
    }
  };

  const fetchFeaturedPublications = async () => {
    try {
      const response = await axios.get(`${API}/featured-publications`);
      setFeaturedPubs(response.data);
    } catch (error) {
      console.error('Error fetching featured publications:', error);
    }
  };

  const saveFeaturedPub = async () => {
    try {
      if (editingFeatured) {
        await axios.put(`${API}/admin/featured-publications/${editingFeatured.id}`, newFeatured);
        toast.success('Featured publication updated!');
      } else {
        await axios.post(`${API}/admin/featured-publications`, newFeatured);
        toast.success('Featured publication added!');
      }
      setShowFeaturedDialog(false);
      setEditingFeatured(null);
      setNewFeatured({ title: '', authors: '', journal: '', year: new Date().getFullYear(), volume: '', issue: '', pages: '', doi: '', link: '', graphical_abstract: '' });
      fetchFeaturedPublications();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error saving publication');
    }
  };

  const deleteFeaturedPub = async (id) => {
    if (!window.confirm('Delete this featured publication?')) return;
    try {
      await axios.delete(`${API}/admin/featured-publications/${id}`);
      toast.success('Featured publication deleted!');
      fetchFeaturedPublications();
    } catch (error) {
      toast.error('Error deleting publication');
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API}/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchIntellectualProperties = async () => {
    try {
      const response = await axios.get(`${API}/intellectual-properties`);
      setIntellectualProperties(response.data);
    } catch (error) {
      console.error('Error fetching intellectual properties:', error);
    }
  };

  const fetchFeaturedPublication = async () => {
    try {
      const response = await axios.get(`${API}/featured-publication`);
      setFeaturedPub(response.data);
    } catch (error) {
      console.error('Error fetching featured publication:', error);
    }
  };

  const handleSetFeatured = async () => {
    if (!selectedPub) return;
    
    try {
      const featuredData = {
        publication_id: selectedPub.id,
        title: selectedPub.title,
        authors: selectedPub.authors,
        journal: selectedPub.journal,
        year: selectedPub.year,
        doi: selectedPub.doi || '',
        citations: selectedPub.citations || 0,
        graphical_abstract: graphicalAbstract,
        is_active: true
      };

      await axios.post(`${API}/admin/featured-publication`, featuredData);
      toast.success('Featured publication set successfully!');
      setShowFeaturedDialog(false);
      setSelectedPub(null);
      setGraphicalAbstract('');
      fetchFeaturedPublication();
    } catch (error) {
      toast.error('Error setting featured publication');
    }
  };

  const removeFeatured = async () => {
    if (!featuredPub || !window.confirm('Remove this featured publication?')) return;
    
    try {
      await axios.delete(`${API}/admin/featured-publication/${featuredPub.id}`);
      toast.success('Featured publication removed!');
      fetchFeaturedPublication();
    } catch (error) {
      toast.error('Error removing featured publication');
    }
  };


  // Book handlers
  const handleSaveBook = async () => {
    try {
      if (editingBook) {
        await axios.put(`${API}/admin/books/${editingBook.id}`, newBook);
        toast.success('Book updated!');
      } else {
        await axios.post(`${API}/admin/books`, newBook);
        toast.success('Book added!');
      }
      setShowBookDialog(false);
      setNewBook({ title: '', authors: '', year: new Date().getFullYear(), publisher: '', link: '', cover_image_url: '' });
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      toast.error('Error saving book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await axios.delete(`${API}/admin/books/${bookId}`);
      toast.success('Book deleted!');
      fetchBooks();
    } catch (error) {
      toast.error('Error deleting book');
    }
  };

  // Intellectual Property handlers
  const handleSaveIP = async () => {
    try {
      if (editingIP) {
        await axios.put(`${API}/admin/intellectual-properties/${editingIP.id}`, newIP);
        toast.success('Intellectual property updated!');
      } else {
        await axios.post(`${API}/admin/intellectual-properties`, newIP);
        toast.success('Intellectual property added!');
      }
      setShowIPDialog(false);
      setNewIP({ type: 'Patent', title: '', year: new Date().getFullYear(), synopsis: '' });
      setEditingIP(null);
      fetchIntellectualProperties();
    } catch (error) {
      toast.error('Error saving intellectual property');
    }
  };

  const handleDeleteIP = async (ipId) => {
    if (!window.confirm('Delete this intellectual property?')) return;
    try {
      await axios.delete(`${API}/admin/intellectual-properties/${ipId}`);
      toast.success('Intellectual property deleted!');
      fetchIntellectualProperties();
    } catch (error) {
      toast.error('Error deleting intellectual property');
    }
  };


  return (
    <div className="space-y-6">
      <Tabs defaultValue="featured">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="featured">Featured Publication</TabsTrigger>
          <TabsTrigger value="upload">EndNote Upload</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="ip">Intellectual Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Featured Publications</CardTitle>
                  <CardDescription>Add up to 5 publications to feature on homepage</CardDescription>
                </div>
                {featuredPubs.length < 5 && (
                  <Button onClick={() => {
                    setEditingFeatured(null);
                    setNewFeatured({ title: '', authors: '', journal: '', year: new Date().getFullYear(), volume: '', issue: '', pages: '', doi: '', link: '', graphical_abstract: '' });
                    setShowFeaturedDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Featured
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {featuredPubs.length > 0 ? (
                <div className="space-y-4">
                  {featuredPubs.map((pub) => (
                    <Card key={pub.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {pub.graphical_abstract && (
                            <img src={pub.graphical_abstract} alt="Graphic" className="w-24 h-24 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{pub.title}</h4>
                            <p className="text-sm text-gray-600 mb-1">{pub.authors}</p>
                            <p className="text-sm text-blue-600">{pub.journal} ({pub.year})</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditingFeatured(pub);
                              setNewFeatured(pub);
                              setShowFeaturedDialog(true);
                            }}>Edit</Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteFeaturedPub(pub.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No featured publications yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showFeaturedDialog} onOpenChange={setShowFeaturedDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFeatured ? 'Edit' : 'Add'} Featured Publication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={newFeatured.title} onChange={(e) => setNewFeatured({...newFeatured, title: e.target.value})} />
                  </div>
                  <div>
                    <Label>Authors</Label>
                    <Input value={newFeatured.authors} onChange={(e) => setNewFeatured({...newFeatured, authors: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Journal</Label>
                    <Input value={newFeatured.journal} onChange={(e) => setNewFeatured({...newFeatured, journal: e.target.value})} />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input type="number" value={newFeatured.year} onChange={(e) => setNewFeatured({...newFeatured, year: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Volume</Label>
                    <Input value={newFeatured.volume} onChange={(e) => setNewFeatured({...newFeatured, volume: e.target.value})} />
                  </div>
                  <div>
                    <Label>Issue</Label>
                    <Input value={newFeatured.issue} onChange={(e) => setNewFeatured({...newFeatured, issue: e.target.value})} />
                  </div>
                  <div>
                    <Label>Pages</Label>
                    <Input value={newFeatured.pages} onChange={(e) => setNewFeatured({...newFeatured, pages: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>DOI</Label>
                    <Input value={newFeatured.doi} onChange={(e) => setNewFeatured({...newFeatured, doi: e.target.value})} />
                  </div>
                  <div>
                    <Label>Link</Label>
                    <Input value={newFeatured.link} onChange={(e) => setNewFeatured({...newFeatured, link: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Graphical Abstract</Label>
                  <ImageUpload onUpload={(url) => setNewFeatured({...newFeatured, graphical_abstract: url})} label="Upload graphic" />
                  {newFeatured.graphical_abstract && (
                    <img src={newFeatured.graphical_abstract} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowFeaturedDialog(false)}>Cancel</Button>
                  <Button onClick={saveFeaturedPub}>Save</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
                        label="Upload graphical abstract"
                      />
                      {graphicalAbstract && (
                        <div className="mt-2">
                          <img 
                            src={graphicalAbstract} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowFeaturedDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSetFeatured} disabled={!selectedPub}>
                    Set as Featured
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload EndNote Publications</CardTitle>
              <CardDescription>Upload RIS file from EndNote to populate static publications</CardDescription>
            </CardHeader>
            <CardContent>
              <input 
                type="file" 
                accept=".ris" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.post(`${API}/upload/ris`, formData, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    toast.success(response.data.message);
                    // Refresh publications list
                    fetchStaticPublications();
                    e.target.value = '';
                  } catch (error) {
                    console.error('RIS upload error:', error);
                    toast.error(error.response?.data?.detail || 'Error uploading RIS file');
                  }
                }}
                className="w-full p-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              />
              <p className="text-sm text-gray-500 mt-2">
                Export your EndNote library as RIS format and upload here. Duplicates (same title and year) will be automatically skipped.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Journal Manually</CardTitle>
            </CardHeader>
            <CardContent id="manual-journal-form" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Publication title" />
                </div>
                <div>
                  <Label>Authors</Label>
                  <Input placeholder="Author names" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Journal Name</Label>
                  <Input placeholder="Journal name" />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input type="number" placeholder="2024" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Volume</Label>
                  <Input placeholder="Volume" />
                </div>
                <div>
                  <Label>Issue</Label>
                  <Input placeholder="Issue" />
                </div>
                <div>
                  <Label>Pages</Label>
                  <Input placeholder="1-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>DOI</Label>
                  <Input placeholder="10.xxxx/xxxxx" />
                </div>
                <div>
                  <Label>Link</Label>
                  <Input placeholder="https://..." />
                </div>
              </div>
              <Button onClick={async () => {
                const form = document.getElementById('manual-journal-form');
                const inputs = form.querySelectorAll('input');
                const data = {
                  title: inputs[0].value,
                  authors: inputs[1].value,
                  journal: inputs[2].value,
                  year: parseInt(inputs[3].value) || new Date().getFullYear(),
                  volume: inputs[4].value,
                  issue: inputs[5].value,
                  pages: inputs[6].value,
                  doi: inputs[7].value,
                  link: inputs[8].value
                };
                try {
                  await axios.post(`${API}/admin/static-publications`, data);
                  toast.success('Publication added!');
                  fetchStaticPublications();
                  inputs.forEach(input => input.value = '');
                } catch (error) {
                  toast.error('Error adding publication');
                }
              }}>Add Publication</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Uploaded Publications</CardTitle>
              <CardDescription>View and manage publications uploaded from EndNote</CardDescription>
            </CardHeader>
            <CardContent>
              {staticPublications.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {staticPublications.map((pub) => (
                    <div key={pub.id} className="flex justify-between items-start p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{pub.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">{pub.authors}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="font-medium">{pub.journal}</span>
                          <span>•</span>
                          <span>{pub.year}</span>
                          {pub.doi && (
                            <>
                              <span>•</span>
                              <span>DOI: {pub.doi}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          if (!window.confirm('Delete this publication?')) return;
                          try {
                            await axios.delete(`${API}/admin/static-publications/${pub.id}`);
                            toast.success('Publication deleted');
                            const pubsRes = await axios.get(`${API}/static-publications`);
                            setStaticPublications(pubsRes.data);
                          } catch (error) {
                            toast.error('Error deleting publication');
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No publications uploaded yet</p>
                  <p className="text-sm text-gray-500">Upload an RIS file to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Books Tab */}
        <TabsContent value="books" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Books</CardTitle>
                  <CardDescription>Manage published books</CardDescription>
                </div>
                <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingBook(null);
                      setNewBook({ title: '', authors: '', year: new Date().getFullYear(), publisher: '', link: '', cover_image_url: '' });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingBook ? 'Edit' : 'Add'} Book</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Book Title</Label>
                        <Input
                          value={newBook.title}
                          onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                          placeholder="Enter book title"
                        />
                      </div>
                      <div>
                        <Label>Authors</Label>
                        <Input
                          value={newBook.authors}
                          onChange={(e) => setNewBook({...newBook, authors: e.target.value})}
                          placeholder="e.g., John Doe, Jane Smith"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={newBook.year}
                            onChange={(e) => setNewBook({...newBook, year: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label>Publisher</Label>
                          <Input
                            value={newBook.publisher}
                            onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                            placeholder="Publisher name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Link (Optional)</Label>
                        <Input
                          value={newBook.link}
                          onChange={(e) => setNewBook({...newBook, link: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label>Cover Image (Optional)</Label>
                        <ImageUpload 
                          onUpload={(url) => setNewBook({...newBook, cover_image_url: url})}
                          label="Upload book cover"
                        />
                        {newBook.cover_image_url && (
                          <img src={newBook.cover_image_url} alt="Cover" className="w-24 h-32 object-cover mt-2 rounded" />
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBookDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveBook}>Save Book</Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {books.length > 0 ? (
                <div className="space-y-4">
                  {books.map((book) => (
                    <div key={book.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      {book.cover_image_url && (
                        <img src={book.cover_image_url} alt="Cover" className="w-20 h-28 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{book.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{book.authors}</p>
                        <p className="text-sm text-gray-500">{book.publisher}, {book.year}</p>
                        {book.link && (
                          <a href={book.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2">
                            <ExternalLink className="w-3 h-3" />
                            View Book
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingBook(book);
                            setNewBook(book);
                            setShowBookDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No books added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intellectual Properties Tab */}
        <TabsContent value="ip" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Intellectual Properties</CardTitle>
                  <CardDescription>Manage patents, copyrights, and other IP</CardDescription>
                </div>
                <Dialog open={showIPDialog} onOpenChange={setShowIPDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingIP(null);
                      setNewIP({ type: 'Patent', title: '', year: new Date().getFullYear(), synopsis: '' });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add IP
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingIP ? 'Edit' : 'Add'} Intellectual Property</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Type of Invention</Label>
                        <Select 
                          value={newIP.type} 
                          onValueChange={(value) => setNewIP({...newIP, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Patent">Patent</SelectItem>
                            <SelectItem value="Copyright">Copyright</SelectItem>
                            <SelectItem value="Trademark">Trademark</SelectItem>
                            <SelectItem value="Industrial Design">Industrial Design</SelectItem>
                            <SelectItem value="Trade Secret">Trade Secret</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={newIP.title}
                          onChange={(e) => setNewIP({...newIP, title: e.target.value})}
                          placeholder="Enter IP title"
                        />
                      </div>
                      <div>
                        <Label>Year</Label>
                        <Input
                          type="number"
                          value={newIP.year}
                          onChange={(e) => setNewIP({...newIP, year: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Synopsis</Label>
                        <Textarea
                          value={newIP.synopsis}
                          onChange={(e) => setNewIP({...newIP, synopsis: e.target.value})}
                          placeholder="Brief description of the intellectual property"
                          rows={4}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowIPDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveIP}>Save IP</Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {intellectualProperties.length > 0 ? (
                <div className="space-y-4">
                  {intellectualProperties.map((ip) => (
                    <div key={ip.id} className="flex justify-between items-start p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{ip.type}</Badge>
                          <span className="text-sm text-gray-500">{ip.year}</span>
                        </div>
                        <h4 className="font-semibold mb-2">{ip.title}</h4>
                        <p className="text-sm text-gray-600">{ip.synopsis}</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingIP(ip);
                            setNewIP(ip);
                            setShowIPDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteIP(ip.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No intellectual properties added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

const ResearchAreasManagementPanel = () => {
  const [areas, setAreas] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [newArea, setNewArea] = useState({ title: '', description: '', keywords: [], sdgs: [], image_url: '' });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API}/research-areas`);
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching research areas:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingArea) {
        await axios.put(`${API}/admin/research-areas/${editingArea.id}`, newArea);
        toast.success('Research area updated!');
      } else {
        await axios.post(`${API}/admin/research-areas`, newArea);
        toast.success('Research area added!');
      }
      setShowDialog(false);
      setNewArea({ title: '', description: '', keywords: [], sdgs: [], image_url: '' });
      setEditingArea(null);
      fetchAreas();
    } catch (error) {
      toast.error('Error saving research area');
    }
  };

  const handleDelete = async (areaId) => {
    if (!window.confirm('Delete this research area?')) return;
    try {
      await axios.delete(`${API}/admin/research-areas/${areaId}`);
      toast.success('Research area deleted!');
      fetchAreas();
    } catch (error) {
      toast.error('Error deleting research area');
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setNewArea({...newArea, keywords: [...newArea.keywords, keywordInput.trim()]});
      setKeywordInput('');
    }
  };

  const removeKeyword = (idx) => {
    setNewArea({...newArea, keywords: newArea.keywords.filter((_, i) => i !== idx)});
  };

  const toggleSDG = (sdg) => {
    if (newArea.sdgs.includes(sdg)) {
      setNewArea({...newArea, sdgs: newArea.sdgs.filter(s => s !== sdg)});
    } else {
      setNewArea({...newArea, sdgs: [...newArea.sdgs, sdg]});
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Research Areas Management</CardTitle>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingArea(null);
                  setNewArea({ title: '', description: '', keywords: [], sdgs: [], image_url: '' });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Research Area
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingArea ? 'Edit' : 'Add'} Research Area</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newArea.title}
                      onChange={(e) => setNewArea({...newArea, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newArea.description}
                      onChange={(e) => setNewArea({...newArea, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Image</Label>
                    <ImageUpload 
                      onUpload={(url) => setNewArea({...newArea, image_url: url})}
                      label="Upload Research Area Image"
                    />
                    {newArea.image_url && (
                      <img src={newArea.image_url} alt="Preview" className="w-full h-32 object-cover mt-2 rounded" />
                    )}
                  </div>
                  <div>
                    <Label>Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                        placeholder="Add keyword"
                      />
                      <Button type="button" onClick={addKeyword}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newArea.keywords.map((kw, idx) => (
                        <Badge key={idx} variant="secondary">
                          {kw}
                          <button onClick={() => removeKeyword(idx)} className="ml-2">×</button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Select SDGs (1-17)</Label>
                    <div className="grid grid-cols-9 gap-2">
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(sdg => (
                        <Button
                          key={sdg}
                          type="button"
                          variant={newArea.sdgs.includes(sdg) ? "default" : "outline"}
                          onClick={() => toggleSDG(sdg)}
                          className="w-full"
                        >
                          {sdg}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {areas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areas.map((area) => (
                <Card key={area.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {area.image_url && (
                        <img src={area.image_url} alt={area.title} className="w-full h-32 object-cover rounded" />
                      )}
                      <div>
                        <h4 className="font-semibold mb-1">{area.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{area.description}</p>
                        {area.keywords && area.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {area.keywords.map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{kw}</Badge>
                            ))}
                          </div>
                        )}
                        {area.sdgs && area.sdgs.length > 0 && (
                          <div className="text-xs text-gray-500">SDGs: {area.sdgs.join(', ')}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingArea(area);
                            setNewArea({
                              ...area,
                              keywords: area.keywords || [],
                              sdgs: area.sdgs || []
                            });
                            setShowDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(area.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No research areas added yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const UserManagementPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Authentication required. Please log out and log back in.');
      } else {
        toast.error('Error fetching users. Please try again.');
      }
    }
  };

  const approveUser = async (userId) => {
    try {
      setLoading(true);
      await axios.post(`${API}/admin/users/${userId}/approve`);
      toast.success('User approved successfully!');
      await fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error approving user');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      await axios.post(`${API}/admin/users/${userId}/role?role=${newRole}`);
      toast.success('User role updated successfully!');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error updating user role');
    } finally {
      setLoading(false);
    }
  };


  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const freezeUser = async (userId, freeze) => {
    try {
      setLoading(true);
      await axios.post(`${API}/admin/users/${userId}/freeze?freeze=${freeze}`);
      toast.success(`User ${freeze ? 'frozen' : 'unfrozen'} successfully!`);
      await fetchUsers();
    } catch (error) {
      console.error('Error freezing user:', error);
      toast.error('Error freezing user');
    } finally {
      setLoading(false);
    }
  };


  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Web Admin';
      case 'user': return 'User';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch(role) {
      case 'super_admin': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, approvals, and role assignments. Only super admins can access this panel.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No users found.</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      {user.role === 'super_admin' && (
                        <Badge variant="default" className="bg-purple-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Super Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant={user.is_approved ? "default" : "secondary"}>
                        {user.is_approved ? "Approved" : "Pending Approval"}
                      </Badge>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>

                    {user.approved_at && (
                      <p className="text-xs text-gray-500">
                        Approved on: {new Date(user.approved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 md:items-end">
                    {!user.is_approved && (
                      <Button 
                        onClick={() => approveUser(user.id)}
                        disabled={loading}
                        className="w-full md:w-auto"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve User
                      </Button>
                    )}
                    
                    {user.is_approved && user.role !== 'super_admin' && (
                      <div className="flex flex-col space-y-2 w-full md:w-auto">
                        <Label className="text-xs text-gray-600">Change Role:</Label>
                        <Select 
                          value={user.role} 
                          onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Web Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          {user.role === 'admin' 
                            ? 'Can manage all content except users' 
                            : 'Limited access, requires approval'}
                        </p>
                      </div>
                    )}

                    {user.role !== 'super_admin' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => freezeUser(user.id, !user.is_frozen)}
                          disabled={loading}
                          className={user.is_frozen ? "border-orange-500 text-orange-600" : ""}
                        >
                          {user.is_frozen ? 'Unfreeze' : 'Freeze'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/research" element={<ResearchPage />} />
                    <Route path="/research" element={<ResearchPage />} />
                    <Route path="/publications" element={<PublicationsPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
