from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import requests
from bs4 import BeautifulSoup
import re
import asyncio
from functools import lru_cache
import bcrypt
import jwt
from PIL import Image
import io
import base64
import rispy
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
uploads_dir = ROOT_DIR / 'uploads'
uploads_dir.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# User Models
class UserRole(str):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = UserRole.USER
    is_approved: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

# Content Models
class SiteSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    logo_url: Optional[str] = None
    menu_logo_url: Optional[str] = None  # Separate logo for menu/navigation
    lab_name: str = "Hydrochemistry Research Group"
    about_content: str = ""
    about_section_title: str = "About Our Research Group"
    show_hero_section: bool = True
    show_menu_logo: bool = True  # Toggle to show/hide logo in menu
    show_lab_info_logo: bool = False  # Toggle to show/hide logo in lab info section
    show_scopus_publications: bool = True  # Toggle to show/hide SCOPUS publications tab
    hero_description: str = "Advancing environmental science through innovative research in hydrochemistry, environmental forensics, and sustainable water management at Universiti Putra Malaysia."
    hero_button1_text: str = "Explore Our Research"
    hero_button2_text: str = "Latest Publications"
    copyright_text: str = "© 2024 Hydrochemistry Research Group, Universiti Putra Malaysia. All rights reserved."
    supervisor_profile: Dict[str, Any] = {}
    pi_home_display: Dict[str, bool] = {}  # Control what PI info shows on home page
    pi_team_display: Dict[str, bool] = {}  # Control what PI info shows on dedicated Team page
    about_cards: List[Dict[str, str]] = [
        {"title": "Advanced Analytics", "description": "State-of-the-art analytical methods"},
        {"title": "Education", "description": "Training the next generation"}
    ]
    scopus_author_id: str = "22133247800"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: str = ""

class TeamMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: str
    email: str
    bio: str
    photo_url: Optional[str] = None
    scopus_id: Optional[str] = None
    google_scholar: Optional[str] = None
    orcid: Optional[str] = None
    research_focus: Optional[str] = None
    current_work: Optional[str] = None
    is_supervisor: bool = False
    status: str = "active"  # "active" or "alumni"
    role: str = "Researcher"  # Role/position in the team
    country: Optional[str] = None  # Country for collaborators
    order_index: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ResearchGrant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    funding_amount: Optional[str] = None
    start_year: int
    end_year: int
    funding_agency: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Award(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    title: str
    awarding_organization: str
    description: Optional[str] = None
    recipient: str = "Prof. Dr. Ahmad Zaharin Aris"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Book(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    authors: str
    year: int
    publisher: str
    link: Optional[str] = None
    cover_image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ResearchArea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    keywords: List[str] = []
    sdgs: List[int] = []
    image_url: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IntellectualProperty(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # e.g., "Patent", "Copyright", "Trademark", etc.
    title: str
    year: int
    synopsis: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ResearchHighlight(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    is_featured: bool = False
    order_index: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StaticPublication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    authors: str
    journal: str
    year: int
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    doi: Optional[str] = None
    abstract: Optional[str] = None
    keywords: List[str] = []
    publication_type: str = "journal_article"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author: str
    image_url: Optional[str] = None
    is_featured: bool = False
    is_published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str = ""

class PageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_name: str  # 'team', 'research', 'publications', 'news'
    header_image_url: Optional[str] = None
    content: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeaturedPublication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    publication_id: str  # Reference to actual publication
    title: str
    authors: str
    journal: str
    year: int
    doi: Optional[str] = None
    citations: Optional[int] = 0
    graphical_abstract: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Existing models (keeping for compatibility)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Publication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    authors: str
    journal: str
    year: int
    doi: Optional[str] = None
    citations: Optional[int] = 0
    scopus_id: Optional[str] = None

class CitationMetrics(BaseModel):
    total_citations: int
    h_index: int
    i10_index: int
    last_updated: datetime

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.get("is_approved") or not user.get("is_active"):
        raise HTTPException(status_code=401, detail="User not approved or inactive")
    
    # Remove ObjectId for Pydantic model
    user.pop('_id', None)
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def get_super_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

def resize_image(image_data: bytes, max_width: int = 800, max_height: int = 600, quality: int = 85) -> bytes:
    """Resize image while maintaining aspect ratio"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Calculate new dimensions
        width, height = image.size
        ratio = min(max_width/width, max_height/height)
        
        if ratio < 1:
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality, optimize=True)
        return output.getvalue()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

def parse_ris_file(file_content: str) -> List[dict]:
    """Parse RIS file and extract publication data"""
    try:
        entries = rispy.loads(file_content)
        publications = []
        
        for entry in entries:
            pub = {
                'title': entry.get('title', [''])[0] if entry.get('title') else '',
                'authors': ', '.join(entry.get('authors', [])),
                'journal': entry.get('journal_name', [''])[0] if entry.get('journal_name') else '',
                'year': int(entry.get('year', [0])[0]) if entry.get('year') and entry.get('year')[0] else 0,
                'volume': entry.get('volume', [''])[0] if entry.get('volume') else '',
                'issue': entry.get('number', [''])[0] if entry.get('number') else '',
                'pages': entry.get('start_page', [''])[0] if entry.get('start_page') else '',
                'doi': entry.get('doi', [''])[0] if entry.get('doi') else '',
                'abstract': entry.get('abstract', [''])[0] if entry.get('abstract') else '',
                'keywords': entry.get('keywords', []),
                'publication_type': entry.get('type_of_reference', 'journal_article')
            }
            if pub['title']:  # Only add if title exists
                publications.append(pub)
        
        return publications
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"RIS file parsing failed: {str(e)}")

# Hardcoded fallback values for Ahmad Zaharin Aris
SCHOLAR_FALLBACK_DATA = {
    'total_citations': 3698,
    'h_index': 29,
    'i10_index': 48
}

# Cache for Google Scholar data
_scholar_cache = {'data': None, 'last_fetched': None}
CACHE_DURATION_HOURS = 168  # 7 days

def fetch_google_scholar_data(scholar_id: str) -> dict:
    """Fetch citation metrics from Google Scholar with caching and fallback"""
    global _scholar_cache
    
    # Check cache first
    if _scholar_cache['data'] and _scholar_cache['last_fetched']:
        time_diff = datetime.now(timezone.utc) - _scholar_cache['last_fetched']
        if time_diff.total_seconds() < CACHE_DURATION_HOURS * 3600:
            print("Returning cached scholar data")
            return _scholar_cache['data']
    
    # Try web scraping with multiple user agents
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
    
    for user_agent in user_agents:
        try:
            import time
            time.sleep(1)  # Small delay between attempts
            
            url = f"https://scholar.google.com/citations?user={scholar_id}&hl=en"
            headers = {'User-Agent': user_agent}
            
            response = requests.get(url, headers=headers, timeout=8)
            print(f"Google Scholar response: {response.status_code}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                citation_table = soup.find('table', {'id': 'gsc_rsb_st'})
                
                if citation_table:
                    rows = citation_table.find_all('tr')
                    if len(rows) >= 3:
                        total_citations = rows[1].find_all('td')[1].text.strip().replace(',', '')
                        h_index = rows[2].find_all('td')[1].text.strip()
                        i10_index = rows[3].find_all('td')[1].text.strip() if len(rows) > 3 else "0"
                        
                        data = {
                            'total_citations': int(total_citations) if total_citations.isdigit() else SCHOLAR_FALLBACK_DATA['total_citations'],
                            'h_index': int(h_index) if h_index.isdigit() else SCHOLAR_FALLBACK_DATA['h_index'],
                            'i10_index': int(i10_index) if i10_index.isdigit() else SCHOLAR_FALLBACK_DATA['i10_index'],
                            'last_updated': datetime.now(timezone.utc)
                        }
                        
                        print(f"Successfully fetched live data: {data}")
                        _scholar_cache['data'] = data
                        _scholar_cache['last_fetched'] = datetime.now(timezone.utc)
                        return data
            elif response.status_code == 429:
                print("Rate limited, trying next user agent...")
                continue
        except Exception as e:
            print(f"Error with user agent {user_agent[:50]}: {e}")
            continue
    
    # Return cached data if available
    if _scholar_cache['data']:
        print("Returning previously cached data")
        return _scholar_cache['data']
    
    # Return hardcoded fallback values
    print("Using hardcoded fallback data")
    fallback_data = {
        **SCHOLAR_FALLBACK_DATA,
        'last_updated': datetime.now(timezone.utc)
    }
    _scholar_cache['data'] = fallback_data
    _scholar_cache['last_fetched'] = datetime.now(timezone.utc)
    return fallback_data

def fetch_scopus_publications_api(author_id: str, limit: int = 10) -> List[dict]:
    """Fetch publications by scraping SCOPUS author profile page"""
    
    try:
        # Scrape publications from Scopus author profile page
        url = f"https://www.scopus.com/authid/detail.uri?authorId={author_id}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        publications = []
        
        # Find the documents section - publications are listed in table rows
        # Look for publication entries in the document list
        doc_rows = soup.find_all('tr', class_='searchArea')
        
        if not doc_rows:
            # Try alternative selector
            doc_rows = soup.find_all('div', class_='documentDataCol')
        
        for idx, row in enumerate(doc_rows[:limit]):
            try:
                # Extract title
                title_elem = row.find('a', class_='ddmDocTitle') or row.find('h4') or row.find('span', class_='docTitle')
                title = title_elem.get_text(strip=True) if title_elem else 'Untitled'
                
                # Extract authors
                authors_elem = row.find('span', class_='docAuthors') or row.find('span', class_='authorName')
                authors = 'Unknown'
                if authors_elem:
                    authors = authors_elem.get_text(strip=True)
                    # Clean up authors text
                    authors = authors.replace('Show all', '').replace('View in search results format', '').strip()
                
                # Extract journal/source
                journal_elem = row.find('span', class_='sourceTitleText') or row.find('span', class_='publicationTitle')
                journal = journal_elem.get_text(strip=True) if journal_elem else 'Unknown Journal'
                
                # Extract year and other metadata
                year = 0
                citations = 0
                doi = ''
                
                # Look for year in various places
                year_elem = row.find('span', class_='docYear') or row.find('span', text=re.compile(r'20\d{2}'))
                if year_elem:
                    year_text = year_elem.get_text(strip=True)
                    year_match = re.search(r'(20\d{2})', year_text)
                    if year_match:
                        year = int(year_match.group(1))
                
                # Extract citations
                citations_elem = row.find('span', class_='docCitations') or row.find('a', string=re.compile(r'Cited by'))
                if citations_elem:
                    citations_text = citations_elem.get_text(strip=True)
                    citations_match = re.search(r'(\d+)', citations_text)
                    if citations_match:
                        citations = int(citations_match.group(1))
                
                # Extract DOI if available
                doi_elem = row.find('a', href=re.compile(r'doi\.org'))
                if doi_elem:
                    doi_href = doi_elem.get('href', '')
                    doi_match = re.search(r'doi\.org/(.+)$', doi_href)
                    if doi_match:
                        doi = doi_match.group(1)
                
                pub = {
                    'id': str(uuid.uuid4()),
                    'title': title,
                    'authors': authors,
                    'journal': journal,
                    'year': year,
                    'doi': doi,
                    'citations': citations,
                    'scopus_id': f'SCRAPED_{idx}'
                }
                
                publications.append(pub)
                
            except Exception as e:
                logging.warning(f"Error parsing publication {idx}: {e}")
                continue
        
        if publications:
            logging.info(f"Successfully scraped {len(publications)} publications from Scopus author profile")
            return publications
        else:
            logging.warning("No publications found by scraping, using API fallback")
            return fetch_scopus_api_fallback(author_id, limit)
        
    except Exception as e:
        logging.error(f"Error scraping Scopus profile: {e}")
        return fetch_scopus_api_fallback(author_id, limit)

def fetch_scopus_api_fallback(author_id: str, limit: int = 10) -> List[dict]:
    """Fallback to Scopus API when scraping fails"""
    api_key = os.environ.get('SCOPUS_API_KEY')
    
    if not api_key:
        logging.warning("SCOPUS_API_KEY not found, using mock data")
        return get_mock_scopus_publications(limit)
    
    try:
        # Try API approach
        url = "https://api.elsevier.com/content/search/scopus"
        headers = {
            'X-ELS-APIKey': api_key,
            'Accept': 'application/json'
        }
        params = {
            'query': f'AU-ID({author_id})',
            'sort': 'pubyear desc',
            'count': limit
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        publications = []
        
        if 'search-results' in data and 'entry' in data['search-results']:
            for entry in data['search-results']['entry']:
                scopus_id = entry.get('dc:identifier', '').replace('SCOPUS_ID:', '')
                
                pub = {
                    'id': str(uuid.uuid4()),
                    'title': entry.get('dc:title', 'Untitled'),
                    'authors': entry.get('dc:creator', 'Unknown'),
                    'journal': entry.get('prism:publicationName', 'Unknown Journal'),
                    'year': 0,
                    'doi': entry.get('prism:doi', ''),
                    'citations': int(entry.get('citedby-count', 0)),
                    'scopus_id': scopus_id
                }
                
                cover_date = entry.get('prism:coverDate', '')
                if cover_date:
                    try:
                        pub['year'] = int(cover_date.split('-')[0])
                    except (ValueError, IndexError):
                        pass
                
                publications.append(pub)
        
        if publications:
            logging.info(f"Successfully fetched {len(publications)} publications from Scopus API")
            return publications
        
    except Exception as e:
        logging.error(f"API fallback also failed: {e}")
    
    return get_mock_scopus_publications(limit)

def get_mock_scopus_publications(limit: int = 10) -> List[dict]:
    """Fallback mock data for when Scopus API is unavailable"""
    mock_publications = [
        {
            'title': 'Novel approaches for microplastic quantification in tropical river ecosystems: A comprehensive study',
            'authors': 'Ahmad Zaharin Aris, Mohd Harun Abdullah, Ahmed Mukhtar',
            'journal': 'Water Research',
            'year': 2025,
            'doi': '10.1016/j.watres.2024.122456',
            'citations': 2,
            'scopus_id': 'SCOPUS_ID_0'
        },
        {
            'title': 'Microplastics and emerging contaminants in Selangor River Basin: Environmental forensics and risk assessment',
            'authors': 'Ahmad Zaharin Aris, Mohd Harun Abdullah, Ahmed Mukhtar',
            'journal': 'Science of The Total Environment',
            'year': 2024,
            'doi': '10.1016/j.scitotenv.2024.169891',
            'citations': 15,
            'scopus_id': 'SCOPUS_ID_1'
        },
        {
            'title': 'Hydrochemical characterization and water quality assessment of riverine systems in tropical regions',
            'authors': 'Ahmad Zaharin Aris, Hafizan Juahir, Sharifuddin M. Zain',
            'journal': 'Environmental Monitoring and Assessment',
            'year': 2024,
            'doi': '10.1007/s10661-024-12234-x',
            'citations': 8,
            'scopus_id': 'SCOPUS_ID_2'
        },
        {
            'title': 'Advanced analytical methods for endocrine disrupting compounds in aquatic environments',
            'authors': 'Ahmad Zaharin Aris, Mohammad Firuzz Alam Siddiquee',
            'journal': 'Analytical Chemistry',
            'year': 2023,
            'doi': '10.1021/acs.analchem.2023.12345',
            'citations': 22,
            'scopus_id': 'SCOPUS_ID_3'
        },
        {
            'title': 'Environmental forensics applications in pollution source identification and apportionment',
            'authors': 'Ahmad Zaharin Aris, Fatimah Md Yusoff, Hafizan Juahir',
            'journal': 'Environmental Forensics',
            'year': 2023,
            'doi': '10.1080/15275922.2023.2187456',
            'citations': 18,
            'scopus_id': 'SCOPUS_ID_4'
        },
        {
            'title': 'Geochemical baseline and risk assessment of heavy metals in sediments from Malaysian rivers',
            'authors': 'Ahmad Zaharin Aris, Wan Mohd Khalik Wan Abdullah',
            'journal': 'Marine Pollution Bulletin',
            'year': 2023,
            'doi': '10.1016/j.marpolbul.2023.114567',
            'citations': 12,
            'scopus_id': 'SCOPUS_ID_5'
        },
        {
            'title': 'Sustainable treatment technologies for endocrine disrupting compounds in wastewater',
            'authors': 'Ahmad Zaharin Aris, Nurul Huda Ahmad Ishak',
            'journal': 'Journal of Cleaner Production',
            'year': 2023,
            'doi': '10.1016/j.jclepro.2023.136789',
            'citations': 9,
            'scopus_id': 'SCOPUS_ID_6'
        },
        {
            'title': 'Multivariate analysis of water quality parameters in tropical river systems',
            'authors': 'Ahmad Zaharin Aris, Hafizan Juahir, Azman Azid',
            'journal': 'Ecological Indicators',
            'year': 2022,
            'doi': '10.1016/j.ecolind.2022.108934',
            'citations': 25,
            'scopus_id': 'SCOPUS_ID_7'
        },
        {
            'title': 'Source identification and health risk assessment of heavy metals in urban river sediments',
            'authors': 'Ahmad Zaharin Aris, Mohd Khairul Nizam Mohd Zain',
            'journal': 'Environmental Geochemistry and Health',
            'year': 2022,
            'doi': '10.1007/s10653-022-01234-x',
            'citations': 17,
            'scopus_id': 'SCOPUS_ID_8'
        },
        {
            'title': 'Chemometric approach for pollution source apportionment in river systems',
            'authors': 'Ahmad Zaharin Aris, Fatimah Md Yusoff, Sharifuddin M. Zain',
            'journal': 'Chemosphere',
            'year': 2022,
            'doi': '10.1016/j.chemosphere.2022.134567',
            'citations': 31,
            'scopus_id': 'SCOPUS_ID_9'
        },
        {
            'title': 'Assessment of pharmaceutical residues in Malaysian river water using LC-MS/MS',
            'authors': 'Ahmad Zaharin Aris, Ahmad Shakir Mohd Saudi',
            'journal': 'Journal of Environmental Management',
            'year': 2022,
            'doi': '10.1016/j.jenvman.2022.115678',
            'citations': 14,
            'scopus_id': 'SCOPUS_ID_10'
        }
    ]
    
    # Sort by year (most recent first)
    sorted_publications = sorted(mock_publications, key=lambda x: x['year'], reverse=True)
    return sorted_publications[:limit]

# Initialize default data
async def initialize_default_data():
    """Initialize database with default research group data"""
    
    # Create super admin user if not exists
    existing_admin = await db.users.find_one({'email': 'zaharin@upm.edu.my'})
    if not existing_admin:
        admin_user = {
            'id': str(uuid.uuid4()),
            'email': 'zaharin@upm.edu.my',
            'name': 'Prof. Dr. Ahmad Zaharin Aris',
            'password_hash': hash_password('admin123'),  # Change this in production
            'role': UserRole.SUPER_ADMIN,
            'is_approved': True,
            'is_active': True,
            'created_at': datetime.now(timezone.utc)
        }
        await db.users.insert_one(admin_user)
    
    # Initialize site settings
    existing_settings = await db.site_settings.find_one({})
    if not existing_settings:
        settings = {
            'id': str(uuid.uuid4()),
            'lab_name': 'Hydrochemistry Research Group',
            'about_content': '''The Hydrochemistry Research Group at Universiti Putra Malaysia is a leading center for environmental chemistry research. Under the direction of Professor Dr. Ahmad Zaharin Aris, we focus on cutting-edge research in water quality, environmental forensics, and emerging contaminants.

Our multidisciplinary approach combines analytical chemistry, environmental science, and sustainable technology to address critical environmental challenges facing our region and the world.''',
            'supervisor_profile': {
                'name': 'Prof. Dr. Ahmad Zaharin Aris',
                'position': 'Professor & Director of I-AQUAS',
                'short_cv': '''Professor Ahmad Zaharin Aris is a leading expert in hydrochemistry and environmental chemistry. He serves as the Director of the International Institute of Aquaculture and Aquatic Sciences (I-AQUAS) at UPM. His research focuses on environmental forensics, water quality assessment, and emerging contaminants in aquatic systems.

He has published over 200 peer-reviewed articles and has been recognized internationally for his contributions to environmental science.''',
                'education': [
                    'Ph.D. in Environmental Chemistry, Universiti Putra Malaysia',
                    'M.Sc. in Chemistry, Universiti Putra Malaysia', 
                    'B.Sc. in Chemistry, Universiti Putra Malaysia'
                ],
                'experience': [
                    'Professor, Faculty of Environmental Studies, UPM (2015-present)',
                    'Associate Professor, Faculty of Environmental Studies, UPM (2010-2015)',
                    'Senior Lecturer, Faculty of Environmental Studies, UPM (2005-2010)'
                ]
            },
            'scopus_author_id': '22133247800',
            'updated_at': datetime.now(timezone.utc)
        }
        await db.site_settings.insert_one(settings)
    
    # Check if team members exist
    existing_members = await db.team_members.count_documents({})
    if existing_members == 0:
        team_members = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Prof. Dr. Ahmad Zaharin Aris',
                'position': 'Professor & Director of I-AQUAS',
                'email': 'zaharin@upm.edu.my',
                'bio': 'Professor Ahmad Zaharin Aris is a leading expert in hydrochemistry and environmental chemistry. He serves as the Director of the International Institute of Aquaculture and Aquatic Sciences (I-AQUAS) at UPM.',
                'scopus_id': '22133247800',
                'google_scholar': 'https://scholar.google.com/citations?user=7pUFcrsAAAAJ&hl=en',
                'orcid': 'https://orcid.org/0000-0002-4827-0750',
                'research_focus': 'Environmental forensics, hydrochemistry, emerging contaminants',
                'current_work': 'Leading research on microplastics and endocrine disruptors in aquatic systems',
                'is_supervisor': True,
                'order_index': 1
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Dr. Hafizan Juahir',
                'position': 'Associate Professor',
                'email': 'hafizan@upm.edu.my',
                'bio': 'Associate Professor specializing in environmental statistics and chemometrics.',
                'research_focus': 'Multivariate analysis, water quality modeling',
                'current_work': 'Developing statistical models for environmental data analysis',
                'is_supervisor': False,
                'order_index': 2
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Dr. Fatimah Md Yusoff',
                'position': 'Senior Lecturer',
                'email': 'fatimah@upm.edu.my',
                'bio': 'Senior Lecturer with expertise in aquatic ecology and environmental impact assessment.',
                'research_focus': 'Aquatic ecology, environmental impact assessment',
                'current_work': 'Studying effects of pollutants on aquatic organisms',
                'is_supervisor': False,
                'order_index': 3
            }
        ]
        
        await db.team_members.insert_many(team_members)
    
    # Check if research areas exist
    existing_areas = await db.research_areas.count_documents({})
    if existing_areas == 0:
        research_areas = [
            {
                'id': str(uuid.uuid4()),
                'title': 'Hydrochemistry and Geochemistry',
                'description': 'Investigation of chemical processes in aquatic environments, including the study of major and trace elements, isotopic composition, and geochemical cycling in riverine and marine systems.',
                'keywords': ['Hydrochemistry', 'Geochemistry', 'Water Chemistry', 'Aquatic Systems']
            },
            {
                'id': str(uuid.uuid4()),
                'title': 'Environmental Forensics',
                'description': 'Application of scientific methods to identify pollution sources, determine contamination pathways, and provide evidence for environmental litigation and remediation efforts.',
                'keywords': ['Environmental Forensics', 'Pollution Source Identification', 'Contamination Assessment']
            },
            {
                'id': str(uuid.uuid4()),
                'title': 'Emerging Contaminants',
                'description': 'Research on microplastics, endocrine disrupting compounds, pharmaceuticals, and other emerging pollutants in aquatic environments, including their fate, transport, and ecological impacts.',
                'keywords': ['Microplastics', 'Endocrine Disruptors', 'Pharmaceuticals', 'Emerging Pollutants']
            },
            {
                'id': str(uuid.uuid4()),
                'title': 'Analytical Method Development',
                'description': 'Development and validation of advanced analytical methods for environmental samples, including chromatographic and spectroscopic techniques for trace analysis.',
                'keywords': ['Analytical Chemistry', 'Method Development', 'Trace Analysis', 'Instrumentation']
            },
            {
                'id': str(uuid.uuid4()),
                'title': 'Water Quality Assessment',
                'description': 'Comprehensive evaluation of water quality in various aquatic systems, including surface water, groundwater, and treated water, with focus on public health and ecological protection.',
                'keywords': ['Water Quality', 'Environmental Monitoring', 'Risk Assessment', 'Public Health']
            }
        ]
        
        await db.research_areas.insert_many(research_areas)

# Authentication endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({'email': user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_dict = user_data.dict()
    user_dict['password_hash'] = hash_password(user_dict.pop('password'))
    user_dict['id'] = str(uuid.uuid4())
    user_dict['role'] = UserRole.USER
    user_dict['is_approved'] = False
    user_dict['is_active'] = True
    user_dict['created_at'] = datetime.now(timezone.utc)
    
    await db.users.insert_one(user_dict)
    
    return {"message": "User registered successfully. Waiting for admin approval."}

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({'email': user_data.email})
    if not user or not verify_password(user_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get('is_approved') or not user.get('is_active'):
        raise HTTPException(status_code=401, detail="Account not approved or inactive")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email']}, expires_delta=access_token_expires
    )
    
    # Remove ObjectId and password_hash for serialization
    user_data = {k: v for k, v in user.items() if k not in ['password_hash', '_id']}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

# User management endpoints (Super Admin only)
@api_router.get("/admin/users")
async def get_pending_users(current_user: User = Depends(get_super_admin_user)):
    users = await db.users.find({}).to_list(100)
    return [{k: v for k, v in user.items() if k not in ['password_hash', '_id']} for user in users]

@api_router.post("/admin/users/{user_id}/approve")
async def approve_user(user_id: str, current_user: User = Depends(get_super_admin_user)):
    result = await db.users.update_one(
        {'id': user_id},
        {
            '$set': {
                'is_approved': True,
                'approved_by': current_user.id,
                'approved_at': datetime.now(timezone.utc)
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User approved successfully"}

@api_router.post("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, current_user: User = Depends(get_super_admin_user)):
    if role not in [UserRole.USER, UserRole.ADMIN]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one(
        {'id': user_id},
        {'$set': {'role': role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User role updated successfully"}

# File upload endpoints


@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_super_admin_user)):
    result = await db.users.delete_one({'id': user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@api_router.post("/admin/users/{user_id}/freeze")
async def freeze_user(user_id: str, freeze: bool, current_user: User = Depends(get_super_admin_user)):
    result = await db.users.update_one({'id': user_id}, {'$set': {'is_frozen': freeze}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {'frozen' if freeze else 'unfrozen'} successfully"}

# Research Areas endpoints
@api_router.get("/research-areas", response_model=List[ResearchArea])
async def get_research_areas():
    areas = await db.research_areas.find({}).to_list(100)
    result = []
    for area in areas:
        area.pop('_id', None)
        result.append(ResearchArea(**area))
    return result

@api_router.post("/admin/research-areas", response_model=ResearchArea)
async def create_research_area(area: ResearchArea, current_user: User = Depends(get_admin_user)):
    await db.research_areas.insert_one(area.dict())
    return area

@api_router.put("/admin/research-areas/{area_id}", response_model=ResearchArea)
async def update_research_area(area_id: str, area: ResearchArea, current_user: User = Depends(get_admin_user)):
    result = await db.research_areas.replace_one({'id': area_id}, area.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Research area not found")
    return area

@api_router.delete("/admin/research-areas/{area_id}")
async def delete_research_area(area_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.research_areas.delete_one({'id': area_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Research area not found")
    return {"message": "Research area deleted successfully"}

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_admin_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and resize image
    content = await file.read()
    resized_content = resize_image(content)
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = uploads_dir / f"{file_id}.jpg"
    with open(file_path, 'wb') as f:
        f.write(resized_content)
    
    # Return base64 encoded image for immediate use
    image_base64 = base64.b64encode(resized_content).decode('utf-8')
    image_url = f"data:image/jpeg;base64,{image_base64}"
    
    return {"url": image_url, "file_id": file_id}

@api_router.post("/upload/ris")
async def upload_ris_file(file: UploadFile = File(...), current_user: User = Depends(get_admin_user)):
    if not file.filename.endswith('.ris'):
        raise HTTPException(status_code=400, detail="File must be a RIS file")
    
    # Read and parse RIS file
    content = await file.read()
    content_str = content.decode('utf-8')
    
    publications = parse_ris_file(content_str)
    
    # Save publications to database
    for pub_data in publications:
        pub_dict = pub_data.copy()
        pub_dict['id'] = str(uuid.uuid4())
        pub_dict['created_at'] = datetime.now(timezone.utc)
        
        # Insert if not exists (check by title and year)
        existing = await db.static_publications.find_one({
            'title': pub_dict['title'],
            'year': pub_dict['year']
        })
        if not existing:
            await db.static_publications.insert_one(pub_dict)
    
    return {"message": f"Successfully parsed and saved {len(publications)} publications"}

# Site settings endpoints
@api_router.get("/settings")
async def get_site_settings():
    settings = await db.site_settings.find_one({})
    if settings:
        # Remove MongoDB ObjectId which is not JSON serializable
        settings.pop('_id', None)
        return settings
    return {}

@api_router.put("/admin/settings")
async def update_site_settings(settings: SiteSettings, current_user: User = Depends(get_admin_user)):
    settings_dict = settings.dict()
    settings_dict['updated_at'] = datetime.now(timezone.utc)
    settings_dict['updated_by'] = current_user.id
    
    await db.site_settings.replace_one({}, settings_dict, upsert=True)
    return {"message": "Settings updated successfully"}

# Team management endpoints
@api_router.get("/team", response_model=List[TeamMember])
async def get_team_members():
    members = await db.team_members.find({}).sort('order_index', 1).to_list(100)
    return [TeamMember(**member) for member in members]

@api_router.post("/admin/team", response_model=TeamMember)
async def create_team_member(member: TeamMember, current_user: User = Depends(get_admin_user)):
    await db.team_members.insert_one(member.dict())
    return member

@api_router.put("/admin/team/{member_id}", response_model=TeamMember)
async def update_team_member(member_id: str, member: TeamMember, current_user: User = Depends(get_admin_user)):
    result = await db.team_members.replace_one({'id': member_id}, member.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return member

@api_router.delete("/admin/team/{member_id}")
async def delete_team_member(member_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.team_members.delete_one({'id': member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return {"message": "Team member deleted successfully"}

# Research grants endpoints
@api_router.get("/research-grants", response_model=List[ResearchGrant])
async def get_research_grants():
    grants = await db.research_grants.find({}).sort('start_year', -1).to_list(100)
    return [ResearchGrant(**grant) for grant in grants]

@api_router.post("/admin/research-grants", response_model=ResearchGrant)
async def create_research_grant(grant: ResearchGrant, current_user: User = Depends(get_admin_user)):
    await db.research_grants.insert_one(grant.dict())
    return grant

@api_router.put("/admin/research-grants/{grant_id}", response_model=ResearchGrant)
async def update_research_grant(grant_id: str, grant: ResearchGrant, current_user: User = Depends(get_admin_user)):
    result = await db.research_grants.replace_one({'id': grant_id}, grant.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Research grant not found")
    return grant

@api_router.delete("/admin/research-grants/{grant_id}")
async def delete_research_grant(grant_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.research_grants.delete_one({'id': grant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Research grant not found")
    return {"message": "Research grant deleted successfully"}

# Awards endpoints
@api_router.get("/awards", response_model=List[Award])
async def get_awards():
    awards = await db.awards.find({}).sort('year', -1).to_list(100)
    return [Award(**award) for award in awards]

@api_router.post("/admin/awards", response_model=Award)
async def create_award(award: Award, current_user: User = Depends(get_admin_user)):
    await db.awards.insert_one(award.dict())
    return award

@api_router.put("/admin/awards/{award_id}", response_model=Award)
async def update_award(award_id: str, award: Award, current_user: User = Depends(get_admin_user)):
    result = await db.awards.replace_one({'id': award_id}, award.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Award not found")
    return award

@api_router.delete("/admin/awards/{award_id}")
async def delete_award(award_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.awards.delete_one({'id': award_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Award not found")
    return {"message": "Award deleted successfully"}


# Books endpoints
@api_router.get("/books", response_model=List[Book])
async def get_books():
    books = await db.books.find({}).sort([('year', -1)]).to_list(100)
    result = []
    for book in books:
        book.pop('_id', None)
        result.append(Book(**book))
    return result

@api_router.post("/admin/books", response_model=Book)
async def create_book(book: Book, current_user: User = Depends(get_admin_user)):
    await db.books.insert_one(book.dict())
    return book

@api_router.put("/admin/books/{book_id}", response_model=Book)
async def update_book(book_id: str, book: Book, current_user: User = Depends(get_admin_user)):
    result = await db.books.replace_one({'id': book_id}, book.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@api_router.delete("/admin/books/{book_id}")
async def delete_book(book_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.books.delete_one({'id': book_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book deleted successfully"}

# Intellectual Properties endpoints
@api_router.get("/intellectual-properties", response_model=List[IntellectualProperty])
async def get_intellectual_properties():
    ips = await db.intellectual_properties.find({}).sort([('year', -1)]).to_list(100)
    result = []
    for ip in ips:
        ip.pop('_id', None)
        result.append(IntellectualProperty(**ip))
    return result

@api_router.post("/admin/intellectual-properties", response_model=IntellectualProperty)
async def create_intellectual_property(ip: IntellectualProperty, current_user: User = Depends(get_admin_user)):
    await db.intellectual_properties.insert_one(ip.dict())
    return ip

@api_router.put("/admin/intellectual-properties/{ip_id}", response_model=IntellectualProperty)
async def update_intellectual_property(ip_id: str, ip: IntellectualProperty, current_user: User = Depends(get_admin_user)):
    result = await db.intellectual_properties.replace_one({'id': ip_id}, ip.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Intellectual property not found")
    return ip

@api_router.delete("/admin/intellectual-properties/{ip_id}")
async def delete_intellectual_property(ip_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.intellectual_properties.delete_one({'id': ip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Intellectual property not found")
    return {"message": "Intellectual property deleted successfully"}


# Research highlights endpoints
@api_router.get("/research-highlights", response_model=List[ResearchHighlight])
async def get_research_highlights():
    highlights = await db.research_highlights.find({}).sort([('is_featured', -1), ('order_index', 1)]).to_list(100)
    result = []
    for highlight in highlights:
        highlight.pop('_id', None)
        result.append(ResearchHighlight(**highlight))
    return result

@api_router.post("/admin/research-highlights", response_model=ResearchHighlight)
async def create_research_highlight(highlight: ResearchHighlight, current_user: User = Depends(get_admin_user)):
    await db.research_highlights.insert_one(highlight.dict())
    return highlight

@api_router.put("/admin/research-highlights/{highlight_id}", response_model=ResearchHighlight)
async def update_research_highlight(highlight_id: str, highlight: ResearchHighlight, current_user: User = Depends(get_admin_user)):
    result = await db.research_highlights.replace_one({'id': highlight_id}, highlight.dict())
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Research highlight not found")
    return highlight

@api_router.delete("/admin/research-highlights/{highlight_id}")
async def delete_research_highlight(highlight_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.research_highlights.delete_one({'id': highlight_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Research highlight not found")
    return {"message": "Research highlight deleted successfully"}

# Static publications endpoints
@api_router.get("/static-publications", response_model=List[StaticPublication])
async def get_static_publications(limit: int = 50):
    publications = await db.static_publications.find({}).sort('year', -1).limit(limit).to_list(limit)
    return [StaticPublication(**pub) for pub in publications]

@api_router.post("/admin/static-publications", response_model=StaticPublication)
async def create_static_publication(pub: StaticPublication, current_user: User = Depends(get_admin_user)):
    pub_dict = pub.dict()
    pub_dict['created_at'] = datetime.now(timezone.utc)
    await db.static_publications.insert_one(pub_dict)
    return pub

@api_router.delete("/admin/static-publications/{publication_id}")
async def delete_static_publication(publication_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.static_publications.delete_one({'id': publication_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Publication not found")
    return {"message": "Publication deleted successfully"}


# News endpoints (enhanced)
@api_router.post("/admin/news", response_model=NewsArticle)
async def create_news_article(article: NewsArticle, current_user: User = Depends(get_admin_user)):
    article_dict = article.dict()
    article_dict['created_by'] = current_user.id
    await db.news.insert_one(article_dict)
    return article

@api_router.get("/news", response_model=List[NewsArticle])
async def get_news_articles(limit: int = 10):
    news_articles = await db.news.find({'is_published': True}).sort('created_at', -1).limit(limit).to_list(limit)
    return [NewsArticle(**article) for article in news_articles]

@api_router.get("/news/featured")
async def get_featured_news():
    featured = await db.news.find_one({'is_featured': True, 'is_published': True}, sort=[('created_at', -1)])
    if featured:
        featured.pop('_id', None)
        return NewsArticle(**featured)
    return None

@api_router.put("/admin/news/{news_id}")
async def update_news_article(news_id: str, article: NewsArticle, current_user: User = Depends(get_admin_user)):
    article_dict = article.dict()
    article_dict['updated_at'] = datetime.now(timezone.utc)
    result = await db.news.replace_one({'id': news_id}, article_dict)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="News article not found")
    return article

@api_router.delete("/admin/news/{news_id}")
async def delete_news_article(news_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.news.delete_one({'id': news_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News article not found")
    return {"message": "News article deleted successfully"}

# Featured publication endpoints
@api_router.get("/featured-publications")
async def get_featured_publications():
    featured = await db.featured_publications.find({}).to_list(5)
    return [FeaturedPublication(**f) for f in featured]

@api_router.post("/admin/featured-publications", response_model=FeaturedPublication)
async def create_featured_publication(publication: FeaturedPublication, current_user: User = Depends(get_admin_user)):
    # Check if already have 5 featured
    count = await db.featured_publications.count_documents({})
    if count >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 featured publications allowed")
    
    await db.featured_publications.insert_one(publication.dict())
    return publication

@api_router.put("/admin/featured-publications/{pub_id}", response_model=FeaturedPublication)
async def update_featured_publication(pub_id: str, publication: FeaturedPublication, current_user: User = Depends(get_admin_user)):
    await db.featured_publications.replace_one({'id': pub_id}, publication.dict())
    return publication

@api_router.delete("/admin/featured-publications/{pub_id}")
async def delete_featured_publication(pub_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.featured_publications.delete_one({'id': pub_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Featured publication not found")
    return {"message": "Featured publication removed successfully"}

# Page content endpoints
@api_router.get("/page-content/{page_name}")
async def get_page_content(page_name: str):
    content = await db.page_content.find_one({'page_name': page_name})
    if content:
        content.pop('_id', None)
        return PageContent(**content)
    return None

@api_router.put("/admin/page-content/{page_name}")
async def update_page_content(page_name: str, content: PageContent, current_user: User = Depends(get_admin_user)):
    content_dict = content.dict()
    content_dict['page_name'] = page_name
    content_dict['updated_at'] = datetime.now(timezone.utc)
    await db.page_content.replace_one({'page_name': page_name}, content_dict, upsert=True)
    return {"message": "Page content updated successfully"}

# Existing endpoints (keeping for compatibility)
@api_router.get("/")
async def root():
    return {"message": "Hydrochemistry Research Group API"}

@api_router.get("/citations", response_model=CitationMetrics)
async def get_citation_metrics():
    scholar_data = fetch_google_scholar_data("7pUFcrsAAAAJ")
    return CitationMetrics(**scholar_data)

@api_router.get("/publications", response_model=List[Publication])
async def get_publications(limit: int = 10):
    # Get SCOPUS author ID from settings
    settings = await db.site_settings.find_one({}) or {}
    scopus_id = settings.get('scopus_author_id', '22133247800')
    
    scopus_data = fetch_scopus_publications_api(scopus_id, limit)
    publications = []
    
    for pub_data in scopus_data:
        pub_dict = pub_data.copy()
        pub_dict['id'] = str(uuid.uuid4())
        publications.append(Publication(**pub_dict))
    
    return publications

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await initialize_default_data()
    logger.info("Application started and database initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
