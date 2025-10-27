import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, FileText, BookOpen, Lightbulb, ArrowUpDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [staticPublications, setStaticPublications] = useState([]);
  const [books, setBooks] = useState([]);
  const [intellectualProperties, setIntellectualProperties] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const [pubsRes, staticRes, booksRes, ipRes, settingsRes] = await Promise.all([
          axios.get(`${API}/publications`),
          axios.get(`${API}/static-publications`),
          axios.get(`${API}/books`),
          axios.get(`${API}/intellectual-properties`),
          axios.get(`${API}/settings`)
        ]);
        
        setPublications(pubsRes.data);
        setStaticPublications(staticRes.data);
        setBooks(booksRes.data);
        setIntellectualProperties(ipRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Sort static publications by year
  const getSortedPublications = () => {
    const sorted = [...staticPublications].sort((a, b) => {
      return sortOrder === 'desc' ? b.year - a.year : a.year - b.year;
    });
    return sorted;
  };

  const PublicationCard = ({ pub, isStatic = false }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{pub.title}</h3>
            <p className="text-gray-600 mb-2">{pub.authors}</p>
            <p className="text-blue-600 font-medium mb-2">{pub.journal}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <span>Year: {pub.year}</span>
              {pub.volume && <span>Vol: {pub.volume}</span>}
              {pub.issue && <span>Issue: {pub.issue}</span>}
              {pub.pages && <span>Pages: {pub.pages}</span>}
              {pub.citations > 0 && <span>Citations: {pub.citations}</span>}
            </div>
            
            {isStatic && pub.abstract && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{pub.abstract}</p>
            )}
            
            {isStatic && pub.keywords && pub.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {pub.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{keyword}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{pub.year}</Badge>
            {isStatic && pub.publication_type && (
              <Badge variant="secondary">{pub.publication_type}</Badge>
            )}
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
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Publications</h1>
          <p className="text-xl text-gray-600">Recent research contributions and scholarly articles</p>
        </div>

        <Tabs defaultValue={settings.show_scopus_publications !== false ? "recent" : "all"} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            {settings.show_scopus_publications !== false && (
              <TabsTrigger value="recent">
                <FileText className="w-4 h-4 mr-2" />
                Recent from SCOPUS ({publications.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="all">
              <FileText className="w-4 h-4 mr-2" />
              All Publications ({staticPublications.length})
            </TabsTrigger>
            <TabsTrigger value="books">
              <BookOpen className="w-4 h-4 mr-2" />
              Books ({books.length})
            </TabsTrigger>
            <TabsTrigger value="ip">
              <Lightbulb className="w-4 h-4 mr-2" />
              Intellectual Properties ({intellectualProperties.length})
            </TabsTrigger>
          </TabsList>

          {settings.show_scopus_publications !== false && (
            <TabsContent value="recent" className="space-y-6">
              <div className="space-y-6">
                {publications.length > 0 ? (
                  publications.map((pub) => (
                    <PublicationCard key={pub.id} pub={pub} />
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No recent publications available from SCOPUS.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="all" className="space-y-6">
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-6">
              {getSortedPublications().length > 0 ? (
                getSortedPublications().map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} isStatic={true} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No publications uploaded yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="books" className="space-y-6">
            <div className="space-y-6">
              {books.length > 0 ? (
                books.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {book.cover_image_url && (
                          <img 
                            src={book.cover_image_url} 
                            alt={book.title} 
                            className="w-32 h-44 object-cover rounded shadow"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                          <p className="text-gray-600 mb-2">{book.authors}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <Badge variant="outline">{book.year}</Badge>
                            <span>{book.publisher}</span>
                          </div>
                          {book.link && (
                            <a 
                              href={book.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Book
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No books published yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ip" className="space-y-6">
            <div className="space-y-6">
              {intellectualProperties.length > 0 ? (
                intellectualProperties.map((ip) => (
                  <Card key={ip.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary">{ip.type}</Badge>
                        <Badge variant="outline">{ip.year}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{ip.title}</h3>
                      <p className="text-gray-600">{ip.synopsis}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No intellectual properties listed yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicationsPage;