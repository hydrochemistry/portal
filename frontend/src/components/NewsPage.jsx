import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Plus, Edit, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [newArticle, setNewArticle] = useState({ 
    title: '', 
    content: '', 
    author: '', 
    image_url: '', 
    is_featured: false 
  });
  const { isWebAdmin } = useAuth();

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
      if (editingArticle) {
        await axios.put(`${API}/admin/news/${editingArticle.id}`, newArticle);
        toast.success('News article updated successfully!');
      } else {
        await axios.post(`${API}/admin/news`, newArticle);
        toast.success('News article added successfully!');
      }
      
      setNewArticle({ title: '', content: '', author: '', image_url: '', is_featured: false });
      setShowAddDialog(false);
      setEditingArticle(null);
      fetchNews();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Error saving article');
    }
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setNewArticle({
      title: article.title,
      content: article.content,
      author: article.author,
      image_url: article.image_url || '',
      is_featured: article.is_featured
    });
    setShowAddDialog(true);
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    
    try {
      await axios.delete(`${API}/admin/news/${id}`);
      toast.success('Article deleted successfully!');
      fetchNews();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Error deleting article');
    }
  };

  const resetForm = () => {
    setNewArticle({ title: '', content: '', author: '', image_url: '', is_featured: false });
    setEditingArticle(null);
    setShowAddDialog(false);
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
          
          {isWebAdmin() && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingArticle ? 'Edit' : 'Add'} News Article</DialogTitle>
                  <DialogDescription>
                    {editingArticle ? 'Update the' : 'Create a new'} news article for the research group.
                  </DialogDescription>
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
                  
                  <div>
                    <Label>Article Image</Label>
                    <ImageUpload 
                      onUpload={(url) => setNewArticle({...newArticle, image_url: url})}
                      label="Upload article image"
                    />
                    {newArticle.image_url && (
                      <div className="mt-2">
                        <img 
                          src={newArticle.image_url} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={newArticle.is_featured}
                      onCheckedChange={(checked) => setNewArticle({...newArticle, is_featured: checked})}
                    />
                    <Label htmlFor="featured">Feature this article on homepage</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddArticle}>
                      {editingArticle ? 'Update' : 'Add'} Article
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-8">
          {news.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {article.image_url && (
                  <div className="md:col-span-1">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover rounded-l-lg"
                    />
                  </div>
                )}
                <div className={`${article.image_url ? 'md:col-span-2' : 'md:col-span-3'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(article.created_at).toLocaleDateString()}</span>
                          {article.is_featured && (
                            <>
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-600 font-medium">Featured</span>
                            </>
                          )}
                        </div>
                        <CardTitle className="text-2xl mb-2">{article.title}</CardTitle>
                        <CardDescription>By {article.author}</CardDescription>
                      </div>
                      {isWebAdmin() && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditArticle(article)}
                          >
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
                </div>
              </div>
            </Card>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No news articles available yet.</p>
            {isWebAdmin() && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Article
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;