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
  const [settings, setSettings] = useState({});
  const location = useLocation();
  const { user, logout, isWebAdmin } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
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
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Lab Logo" className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Beaker className="w-5 h-5 text-white" />
              </div>
            )}
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
  const [featuredPublication, setFeaturedPublication] = useState(null);
  const [researchHighlights, setResearchHighlights] = useState([]);
  const [supervisorProfile, setSupervisorProfile] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [citationsRes, newsRes, featuredNewsRes, highlightsRes, settingsRes, featuredPubRes] = await Promise.all([
          axios.get(`${API}/citations`),
          axios.get(`${API}/news?limit=3`),
          axios.get(`${API}/news/featured`),
          axios.get(`${API}/research-highlights`),
          axios.get(`${API}/settings`),
          axios.get(`${API}/featured-publication`)
        ]);
        
        setCitations(citationsRes.data);
        setRecentNews(newsRes.data);
        setFeaturedNews(featuredNewsRes.data || null);
        setFeaturedPublication(featuredPubRes.data || null);
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
    <div className="min-h-screen bg-white">
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

      {/* Featured Content - Publication and News Side by Side */}
      {(featuredPublication || featuredNews) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Featured Publication - Left Side */}
              {featuredPublication ? (
                <div>
                  <div className="flex items-center mb-6">
                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                    <h2 className="text-2xl font-bold">Featured Publication</h2>
                  </div>
                  <Card className="overflow-hidden h-full">
                    {featuredPublication.graphical_abstract && (
                      <div className="aspect-video">
                        <img 
                          src={featuredPublication.graphical_abstract} 
                          alt="Graphical Abstract"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <Badge>{featuredPublication.year}</Badge>
                        {featuredPublication.citations > 0 && (
                          <span>{featuredPublication.citations} citations</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-3 line-clamp-2">{featuredPublication.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{featuredPublication.authors}</p>
                      <p className="text-blue-600 font-medium text-sm mb-4">{featuredPublication.journal}</p>
                      {featuredPublication.doi && (
                        <div className="flex items-center space-x-2 mb-4">
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                          <a 
                            href={`https://doi.org/${featuredPublication.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline text-xs"
                          >
                            DOI: {featuredPublication.doi}
                          </a>
                        </div>
                      )}
                      <Button size="sm" asChild>
                        <Link to="/publications">View All Publications</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div></div>
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
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Experience</h4>
                        <ul className="space-y-1">
                          {supervisorProfile.experience.map((exp, index) => (
                            <li key={index} className="text-gray-600">• {exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {supervisorProfile.awards && (
                      <div>
                        <h4 className="font-semibold mb-3">Awards & Recognition</h4>
                        <ul className="space-y-1">
                          {supervisorProfile.awards.map((award, index) => (
                            <li key={index} className="text-gray-600">• {award}</li>
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

      {/* Duplicate About Section removed - keeping only the one positioned at the top */}

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
      <div className="min-h-screen bg-gray-50 py-16">
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
        setSettings(response.data);
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
      toast.error('Error updating settings');
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Upload your research group logo</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload 
            onUpload={(url) => setSettings({...settings, logo_url: url})}
            label="Upload Lab Logo"
          />
          {settings.logo_url && (
            <div className="mt-4">
              <img src={settings.logo_url} alt="Lab Logo" className="h-16 object-contain" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Principal Investigator Profile</CardTitle>
          <CardDescription>Configure the supervisor profile displayed on the homepage</CardDescription>
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
              <Label htmlFor="supervisor_position">Position</Label>
              <Input
                id="supervisor_position"
                value={settings.supervisor_profile?.position || ''}
                onChange={(e) => setSettings({
                  ...settings, 
                  supervisor_profile: {
                    ...settings.supervisor_profile,
                    position: e.target.value
                  }
                })}
                placeholder="Professor & Principal Investigator"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="supervisor_cv">Short CV</Label>
            <Textarea
              id="supervisor_cv"
              value={settings.supervisor_profile?.short_cv || ''}
              onChange={(e) => setSettings({
                ...settings, 
                supervisor_profile: {
                  ...settings.supervisor_profile,
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
    current_work: '', is_supervisor: false, order_index: 0
  });

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
      current_work: '', is_supervisor: false, order_index: 0
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
  const [featuredPub, setFeaturedPub] = useState(null);
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);
  const [graphicalAbstract, setGraphicalAbstract] = useState('');

  useEffect(() => {
    fetchPublications();
    fetchFeaturedPublication();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await axios.get(`${API}/publications`);
      setPublications(response.data);
    } catch (error) {
      console.error('Error fetching publications:', error);
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="featured">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="featured">Featured Publication</TabsTrigger>
          <TabsTrigger value="upload">EndNote Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Publication on Homepage</CardTitle>
              <CardDescription>
                Select a publication to highlight on the homepage. If none selected, random publications will be shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {featuredPub ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{featuredPub.title}</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={removeFeatured}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove Featured
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{featuredPub.authors}</p>
                    <p className="text-sm text-blue-600">{featuredPub.journal} ({featuredPub.year})</p>
                    {featuredPub.graphical_abstract && (
                      <div className="mt-3">
                        <img 
                          src={featuredPub.graphical_abstract} 
                          alt="Graphical Abstract" 
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={() => setShowFeaturedDialog(true)}>
                    Change Featured Publication
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No featured publication selected</p>
                  <p className="text-sm text-gray-500 mb-4">Random publications will be displayed on homepage</p>
                  <Button onClick={() => setShowFeaturedDialog(true)}>
                    Select Featured Publication
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showFeaturedDialog} onOpenChange={setShowFeaturedDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select Featured Publication</DialogTitle>
                <DialogDescription>
                  Choose a publication from your SCOPUS list to feature on the homepage
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {publications.map((pub) => (
                    <div 
                      key={pub.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPub?.id === pub.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPub(pub)}
                    >
                      <h4 className="font-medium text-sm mb-1">{pub.title}</h4>
                      <p className="text-xs text-gray-600">{pub.authors}</p>
                      <p className="text-xs text-blue-600">{pub.journal} ({pub.year})</p>
                    </div>
                  ))}
                </div>
                
                {selectedPub && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-semibold mb-2">Selected Publication:</h4>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="font-medium">{selectedPub.title}</p>
                        <p className="text-sm text-gray-600">{selectedPub.authors}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Graphical Abstract (Optional)</Label>
                      <ImageUpload 
                        onUpload={(url) => setGraphicalAbstract(url)}
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
                    const response = await axios.post(`${API}/upload/ris`, formData);
                    toast.success(response.data.message);
                  } catch (error) {
                    toast.error('Error uploading RIS file');
                  }
                }}
                className="w-full p-3 border border-dashed border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                Export your EndNote library as RIS format and upload here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const UserManagementPanel = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API}/admin/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const approveUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/approve`);
      toast.success('User approved!');
      // Refresh users list
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Error approving user');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={user.is_approved ? "default" : "secondary"}>
                      {user.is_approved ? "Approved" : "Pending"}
                    </Badge>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </div>
                
                {!user.is_approved && (
                  <Button onClick={() => approveUser(user.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
