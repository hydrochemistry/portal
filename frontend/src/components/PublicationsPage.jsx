import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [staticPublications, setStaticPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const [pubsRes, staticRes] = await Promise.all([
          axios.get(`${API}/publications`),
          axios.get(`${API}/static-publications`)
        ]);
        
        setPublications(pubsRes.data);
        setStaticPublications(staticRes.data);
      } catch (error) {
        console.error('Error fetching publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

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
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Publications</h1>
          <p className="text-xl text-gray-600">Recent research contributions and scholarly articles</p>
        </div>

        <Tabs defaultValue="recent" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">
              <FileText className="w-4 h-4 mr-2" />
              Recent from SCOPUS ({publications.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              <FileText className="w-4 h-4 mr-2" />
              All Publications ({staticPublications.length})
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="all" className="space-y-6">
            <div className="space-y-6">
              {staticPublications.length > 0 ? (
                staticPublications.map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} isStatic={true} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No publications available. Upload EndNote RIS file via admin panel.</p>
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