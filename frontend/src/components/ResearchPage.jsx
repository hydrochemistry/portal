import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, DollarSign, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResearchPage = () => {
  const [researchAreas, setResearchAreas] = useState([]);
  const [researchGrants, setResearchGrants] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        const [areasRes, grantsRes, awardsRes] = await Promise.all([
          axios.get(`${API}/research-areas`),
          axios.get(`${API}/research-grants`),
          axios.get(`${API}/awards`)
        ]);
        
        setResearchAreas(areasRes.data);
        setResearchGrants(grantsRes.data);
        setAwards(awardsRes.data);
      } catch (error) {
        console.error('Error fetching research data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchData();
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
          <h1 className="text-4xl font-bold mb-4">Research</h1>
          <p className="text-xl text-gray-600">Exploring the frontiers of environmental chemistry and hydrochemistry</p>
        </div>

        <Tabs defaultValue="areas" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="areas">Research Areas</TabsTrigger>
            <TabsTrigger value="grants">Research Grants</TabsTrigger>
            <TabsTrigger value="awards">Awards</TabsTrigger>
          </TabsList>

          <TabsContent value="areas" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {researchAreas.map((area) => (
                <Card key={area.id} className="hover:shadow-lg transition-shadow">
                  {area.image_url && (
                    <div className="aspect-video">
                      <img 
                        src={area.image_url} 
                        alt={area.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                  )}
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
          </TabsContent>

          <TabsContent value="grants" className="space-y-6">
            <div className="space-y-6">
              {researchGrants.map((grant) => (
                <Card key={grant.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-semibold">{grant.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{grant.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Duration: {grant.start_year} - {grant.end_year}</span>
                          <span>Agency: {grant.funding_agency}</span>
                          {grant.funding_amount && <span>Amount: {grant.funding_amount}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="awards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awards.map((award) => (
                <Card key={award.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge>{award.year}</Badge>
                        </div>
                        <h3 className="font-semibold mb-2">{award.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{award.awarding_organization}</p>
                        <p className="text-sm text-gray-500">Recipient: {award.recipient}</p>
                        {award.description && (
                          <p className="text-sm text-gray-600 mt-2">{award.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResearchPage;