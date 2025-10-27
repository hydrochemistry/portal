import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Mail, ExternalLink, User, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

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

  // Separate active and alumni members
  const activeMembers = team.filter(member => member.status !== 'alumni');
  const alumniMembers = team.filter(member => member.status === 'alumni');

  // Sort active members by role priority
  const rolePriority = {
    'Principal': 1,
    'Researcher': 2,
    'Post-Doctoral': 3,
    'PhD Student': 4,
    'MS Student': 5,
    'Research Assistant': 6,
    'Intern': 7,
    'Research Attachment': 8
  };

  const sortedActiveMembers = [...activeMembers].sort((a, b) => {
    const priorityA = rolePriority[a.role] || 999;
    const priorityB = rolePriority[b.role] || 999;
    return priorityA - priorityB;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderMemberCard = (member) => (
    <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="text-center">
        <div className="relative mb-4">
                  {member.photo_url ? (
                    <img 
                      src={member.photo_url} 
                      alt={member.name}
                      className="w-24 h-24 mx-auto rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {member.is_supervisor && (
                    <Badge className="absolute -top-2 -right-2 bg-yellow-500">Supervisor</Badge>
                  )}
                </div>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.position}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                
                {member.research_focus && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Research Focus:</h4>
                    <p className="text-sm text-gray-600">{member.research_focus}</p>
                  </div>
                )}
                
                {member.current_work && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Current Work:</h4>
                    <p className="text-sm text-gray-600">{member.current_work}</p>
                  </div>
                )}
                
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
                  {member.scopus_id && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`https://www.scopus.com/authid/detail.uri?authorId=${member.scopus_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm"
                      >
                        SCOPUS Profile
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

export default TeamPage;