import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';

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
  X
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <Beaker className="w-4 h-4" /> },
    { path: '/team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { path: '/research', label: 'Research', icon: <Search className="w-4 h-4" /> },
    { path: '/publications', label: 'Publications', icon: <FileText className="w-4 h-4" /> },
    { path: '/news', label: 'News', icon: <Calendar className="w-4 h-4" /> },
    { path: '/contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> }
  ];

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
          </div>
        )}
      </div>
    </nav>
  );
};

// Home Page Component
const HomePage = () => {
  const [citations, setCitations] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [citationsRes, newsRes] = await Promise.all([
          axios.get(`${API}/citations`),
          axios.get(`${API}/news?limit=3`)
        ]);
        setCitations(citationsRes.data);
        setRecentNews(newsRes.data);
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

      {/* Citation Metrics */}
      {citations && (
        <section className="py-16 bg-white">
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
                        <Link to={`/news/${article.id}`}>Read More</Link>
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

// Team Page Component
const TeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(`${API}/team`);
        setTeam(response.data);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-gray-600">Meet the researchers driving innovation in hydrochemistry</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.position}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline text-sm">
                      {member.email}
                    </a>
                  </div>
                  {member.google_scholar && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <a 
                        href={member.google_scholar} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Google Scholar
                      </a>
                    </div>
                  )}
                  {member.orcid && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <a 
                        href={member.orcid} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm"
                      >
                        ORCID
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Research Areas Page
const ResearchPage = () => {
  const [researchAreas, setResearchAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResearchAreas = async () => {
      try {
        const response = await axios.get(`${API}/research-areas`);
        setResearchAreas(response.data);
      } catch (error) {
        console.error('Error fetching research areas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchAreas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Research Areas</h1>
          <p className="text-xl text-gray-600">Exploring the frontiers of environmental chemistry and hydrochemistry</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {researchAreas.map((area) => (
            <Card key={area.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-6 h-6 text-blue-600" />
                  <span>{area.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{area.description}</p>
                <div className="flex flex-wrap gap-2">
                  {area.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Publications Page
const PublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get(`${API}/publications`);
        setPublications(response.data);
      } catch (error) {
        console.error('Error fetching publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Publications</h1>
          <p className="text-xl text-gray-600">Recent research contributions and scholarly articles</p>
        </div>

        <div className="space-y-6">
          {publications.map((pub) => (
            <Card key={pub.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{pub.title}</h3>
                    <p className="text-gray-600 mb-2">{pub.authors}</p>
                    <p className="text-blue-600 font-medium mb-2">{pub.journal}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Year: {pub.year}</span>
                      {pub.citations > 0 && <span>Citations: {pub.citations}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{pub.year}</Badge>
                  </div>
                </div>
                {pub.doi && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`https://doi.org/${pub.doi}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline text-sm"
                    >
                      DOI: {pub.doi}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// News Page
const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', author: '' });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = async () => {
    try {
      await axios.post(`${API}/news`, newArticle);
      setNewArticle({ title: '', content: '', author: '' });
      setShowAddDialog(false);
      toast('News article added successfully!');
      fetchNews();
    } catch (error) {
      console.error('Error adding article:', error);
      toast('Error adding article');
    }
  };

  const handleDeleteArticle = async (id) => {
    try {
      await axios.delete(`${API}/news/${id}`);
      toast('Article deleted successfully!');
      fetchNews();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast('Error deleting article');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">News & Updates</h1>
            <p className="text-xl text-gray-600">Latest developments from our research group</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={isAdmin ? "default" : "outline"}
              onClick={() => setIsAdmin(!isAdmin)}
            >
              {isAdmin ? "Exit Admin" : "Admin Mode"}
            </Button>
            {isAdmin && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add News Article</DialogTitle>
                    <DialogDescription>Create a new news article for the research group.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                        placeholder="Enter article title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={newArticle.author}
                        onChange={(e) => setNewArticle({...newArticle, author: e.target.value})}
                        placeholder="Enter author name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={newArticle.content}
                        onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                        placeholder="Enter article content"
                        className="min-h-32"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddArticle}>
                        Add Article
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {news.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    <CardTitle className="text-2xl mb-2">{article.title}</CardTitle>
                    <CardDescription>By {article.author}</CardDescription>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{article.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No news articles available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Contact Page
const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our research team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Research Group Information</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Address</h3>
                      <p className="text-gray-600">
                        Faculty of Environmental Studies<br />
                        Universiti Putra Malaysia<br />
                        43400 UPM Serdang, Selangor<br />
                        Malaysia
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Email</h3>
                      <p className="text-gray-600">
                        Prof. Dr. Ahmad Zaharin Aris: <br />
                        <a href="mailto:zaharin@upm.edu.my" className="text-blue-600 hover:underline">
                          zaharin@upm.edu.my
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Phone</h3>
                      <p className="text-gray-600">+603-9769 1176</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <ExternalLink className="w-6 h-6 text-cyan-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Links</h3>
                      <div className="space-y-2">
                        <a 
                          href="https://scholar.google.com/citations?user=7pUFcrsAAAAJ&hl=en" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-blue-600 hover:underline"
                        >
                          Google Scholar Profile
                        </a>
                        <a 
                          href="https://www.scopus.com/authid/detail.uri?authorId=22133247800" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-blue-600 hover:underline"
                        >
                          SCOPUS Author Profile
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Research Areas Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Research Interests</h2>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    <span>Hydrochemistry and Geochemistry of aquatic systems</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2"></span>
                    <span>Environmental forensics and pollution source identification</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-600 rounded-full mt-2"></span>
                    <span>Emerging contaminants: microplastics and endocrine disruptors</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-cyan-600 rounded-full mt-2"></span>
                    <span>Analytical method development for environmental samples</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></span>
                    <span>Water quality assessment and risk evaluation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2"></span>
                    <span>Sustainable water treatment technologies</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Collaboration Opportunities</h3>
              <p className="text-gray-600 mb-4">
                We welcome collaborations with international researchers, government agencies, 
                and industry partners. Our research contributes to UN Sustainable Development Goals 6 and 14, 
                focusing on clean water and protection of marine life.
              </p>
              <Button asChild>
                <a href="mailto:zaharin@upm.edu.my">
                  <Mail className="w-4 h-4 mr-2" />
                  Get in Touch
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
