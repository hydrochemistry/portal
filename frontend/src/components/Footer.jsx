import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Beaker } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Footer = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          
          {/* Left side - Logo and Lab Name */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Lab Logo" 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Beaker className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-lg font-semibold">
              {settings.lab_name || 'Hydrochemistry Research Group'}
            </span>
          </div>

          {/* Right side - Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-300">
              {settings.copyright_text || '© 2024 Hydrochemistry Research Group, Universiti Putra Malaysia. All rights reserved.'}
            </p>
          </div>

        </div>
        
        {/* Bottom border */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Faculty of Environmental Studies, Universiti Putra Malaysia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;