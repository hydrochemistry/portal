import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Award, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SDG_IMAGES = {
  1: '/sdg-icons/E-SDG-01.jpg',
  2: '/sdg-icons/E-SDG-02.jpg',
  3: '/sdg-icons/E-SDG-03.jpg',
  4: '/sdg-icons/E-SDG-04.jpg',
  5: '/sdg-icons/E-SDG-05.jpg',
  6: '/sdg-icons/E-SDG-06.jpg',
  7: '/sdg-icons/E-SDG-07.jpg',
  8: '/sdg-icons/E-SDG-08.jpg',
  9: '/sdg-icons/E-SDG-09.jpg',
  10: '/sdg-icons/E-SDG-10.jpg',
  11: '/sdg-icons/E-SDG-11.jpg',
  12: '/sdg-icons/E-SDG-12.jpg',
  13: '/sdg-icons/E-SDG-13.jpg',
  14: '/sdg-icons/E-SDG-14.jpg',
  15: '/sdg-icons/E-SDG-15.jpg',
  16: '/sdg-icons/E-SDG-16.jpg',
  17: '/sdg-icons/E-SDG-17.jpg'
};

const ResearchPage = () => {
  const [researchAreas, setResearchAreas] = useState([]);
  const [grants, setGrants] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, grantsRes, awardsRes] = await Promise.all([
          axios.get(`${API}/research-areas`),
          axios.get(`${API}/grants`),
          axios.get(`${API}/awards`)
        ]);
        setResearchAreas(areasRes.data);
        setGrants(grantsRes.data);
        setAwards(awardsRes.data);
      } catch (error) {
        console.error('Error fetching research data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h1 className="text-4xl font-bold mb-4">Research Areas</h1>
          <p className="text-xl text-gray-600">Exploring innovative solutions for environmental challenges</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {researchAreas.length > 0 ? (
            researchAreas.map((area) => (
              <Card key={area.id} className="hover:shadow-lg transition-shadow">
                {area.image_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={area.image_url} 
                      alt={area.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    {area.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 text-sm">{area.description}</p>
                  
                  {area.keywords && area.keywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-xs mb-2">Keywords:</h4>
                      <div className="flex flex-wrap gap-1">
                        {area.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {area.sdgs && area.sdgs.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs mb-2">SDGs:</h4>
                      <div className="flex flex-wrap gap-1">
                        {area.sdgs.map((sdg) => (
                          <img
                            key={sdg}
                            src={SDG_IMAGES[sdg]}
                            alt={`SDG ${sdg}`}
                            className="w-12 h-12 object-contain"
                            title={`SDG ${sdg}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <Lightbulb className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No research areas available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;