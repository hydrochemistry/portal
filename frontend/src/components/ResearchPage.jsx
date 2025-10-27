import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SDG_IMAGES = {
  1: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-01.jpg',
  2: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-02.jpg',
  3: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-03.jpg',
  4: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-04.jpg',
  5: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-05.jpg',
  6: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-06.jpg',
  7: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-07.jpg',
  8: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-08.jpg',
  9: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-09.jpg',
  10: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-10.jpg',
  11: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-11.jpg',
  12: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-12.jpg',
  13: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-13.jpg',
  14: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-14.jpg',
  15: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-15.jpg',
  16: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-16.jpg',
  17: 'https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-17.jpg'
};

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
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Research Areas</h1>
          <p className="text-xl text-gray-600">Exploring innovative solutions for environmental challenges</p>
        </div>

        <div className="space-y-8">
          {researchAreas.length > 0 ? (
            researchAreas.map((area) => (
              <Card key={area.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-blue-600" />
                    {area.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{area.description}</p>
                  
                  {area.keywords && area.keywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">Keywords:</h4>
                      <div className="flex flex-wrap gap-2">
                        {area.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {area.sdgs && area.sdgs.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Sustainable Development Goals:</h4>
                      <div className="flex flex-wrap gap-2">
                        {area.sdgs.map((sdg) => (
                          <img
                            key={sdg}
                            src={SDG_IMAGES[sdg]}
                            alt={`SDG ${sdg}`}
                            className="w-16 h-16 object-contain"
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
            <div className="text-center py-12">
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