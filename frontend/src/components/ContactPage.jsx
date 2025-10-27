import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="bg-white py-16">
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
                      <h3 className="font-semibold mb-2">Academic Profiles</h3>
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
                        <a 
                          href="https://orcid.org/0000-0002-4827-0750" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-blue-600 hover:underline"
                        >
                          ORCID Profile
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
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2">For Students & Researchers:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• PhD and Masters research opportunities</li>
                  <li>• International exchange programs</li>
                  <li>• Joint research projects</li>
                  <li>• Conference collaborations</li>
                </ul>
              </div>
              
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

export default ContactPage;