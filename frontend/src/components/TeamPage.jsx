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
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('principal');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [teamRes, settingsRes] = await Promise.all([
          axios.get(`${API}/team`),
          axios.get(`${API}/settings`)
        ]);
        setTeam(teamRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  // Separate principal, active members and alumni
  const principal = settings.supervisor_profile || {};
  const activeMembers = team.filter(member => member.status !== 'alumni' && member.role !== 'Principal');
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
          {member.status === 'alumni' && (
            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
              <Award className="w-3 h-3 mr-1" />
              Alumni
            </Badge>
          )}
        </div>
        <CardTitle>{member.name}</CardTitle>
        <CardDescription className="space-y-1">
          <div>{member.position}</div>
          {member.role && (
            <Badge variant="outline" className="text-xs">
              {member.role}
            </Badge>
          )}
        </CardDescription>
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
  );

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-gray-600">Meet the researchers driving innovation in hydrochemistry</p>
        </div>

        <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Members ({activeMembers.length})
            </TabsTrigger>
            <TabsTrigger value="alumni" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Alumni ({alumniMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-8">
            {sortedActiveMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedActiveMembers.map((member) => renderMemberCard(member))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No active team members at the moment.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="alumni" className="space-y-8">
            {alumniMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {alumniMembers.map((member) => renderMemberCard(member))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No alumni members listed yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamPage;