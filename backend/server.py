from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup
import re
import asyncio
from functools import lru_cache

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class NewsArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsArticleCreate(BaseModel):
    title: str
    content: str
    author: str

class NewsArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

class TeamMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: str
    email: str
    bio: str
    image_url: Optional[str] = None
    google_scholar: Optional[str] = None
    orcid: Optional[str] = None

class ResearchArea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    keywords: List[str]
    image_url: Optional[str] = None

# Data fetching functions
def fetch_google_scholar_data(scholar_id: str) -> dict:
    """Fetch citation metrics from Google Scholar"""
    try:
        url = f"https://scholar.google.com/citations?user={scholar_id}&hl=en"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract citation metrics
        citation_table = soup.find('table', {'id': 'gsc_rsb_st'})
        if citation_table:
            rows = citation_table.find_all('tr')
            if len(rows) >= 3:
                total_citations = rows[1].find_all('td')[1].text.strip()
                h_index = rows[2].find_all('td')[1].text.strip()
                i10_index = rows[3].find_all('td')[1].text.strip() if len(rows) > 3 else "0"
                
                return {
                    'total_citations': int(total_citations) if total_citations.isdigit() else 0,
                    'h_index': int(h_index) if h_index.isdigit() else 0,
                    'i10_index': int(i10_index) if i10_index.isdigit() else 0,
                    'last_updated': datetime.now(timezone.utc)
                }
    except Exception as e:
        print(f"Error fetching Google Scholar data: {e}")
    
    return {
        'total_citations': 0,
        'h_index': 0,
        'i10_index': 0,
        'last_updated': datetime.now(timezone.utc)
    }

def fetch_scopus_publications(author_id: str, limit: int = 10) -> List[dict]:
    """Fetch recent publications from SCOPUS"""
    # For now, return mock data as SCOPUS requires authentication and has anti-bot protection
    # In production, you would use SCOPUS API with proper credentials
    mock_publications = [
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
    
    return mock_publications[:limit]

# Initialize default data
async def initialize_default_data():
    """Initialize database with default research group data"""
    
    # Check if team members exist
    existing_members = await db.team_members.count_documents({})
    if existing_members == 0:
        team_members = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Prof. Dr. Ahmad Zaharin Aris',
                'position': 'Professor & Director of I-AQUAS',
                'email': 'zaharin@upm.edu.my',
                'bio': 'Professor Ahmad Zaharin Aris is a leading expert in hydrochemistry and environmental chemistry. He serves as the Director of the International Institute of Aquaculture and Aquatic Sciences (I-AQUAS) at UPM. His research focuses on environmental forensics, water quality assessment, and emerging contaminants in aquatic systems.',
                'google_scholar': 'https://scholar.google.com/citations?user=7pUFcrsAAAAJ&hl=en',
                'orcid': 'https://orcid.org/0000-0002-4827-0750'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Dr. Hafizan Juahir',
                'position': 'Associate Professor',
                'email': 'hafizan@upm.edu.my',
                'bio': 'Associate Professor specializing in environmental statistics and chemometrics. Research interests include multivariate analysis of environmental data and water quality modeling.',
                'google_scholar': '',
                'orcid': ''
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Dr. Fatimah Md Yusoff',
                'position': 'Senior Lecturer',
                'email': 'fatimah@upm.edu.my',
                'bio': 'Senior Lecturer with expertise in aquatic ecology and environmental impact assessment. Focus on the effects of pollutants on aquatic organisms and ecosystem health.',
                'google_scholar': '',
                'orcid': ''
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

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Hydrochemistry Research Group API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# News endpoints
@api_router.post("/news", response_model=NewsArticle)
async def create_news_article(article: NewsArticleCreate):
    article_dict = article.dict()
    news_obj = NewsArticle(**article_dict)
    await db.news.insert_one(news_obj.dict())
    return news_obj

@api_router.get("/news", response_model=List[NewsArticle])
async def get_news_articles(limit: int = 10):
    news_articles = await db.news.find().sort('created_at', -1).limit(limit).to_list(limit)
    return [NewsArticle(**article) for article in news_articles]

@api_router.get("/news/{news_id}", response_model=NewsArticle)
async def get_news_article(news_id: str):
    article = await db.news.find_one({'id': news_id})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    return NewsArticle(**article)

@api_router.put("/news/{news_id}", response_model=NewsArticle)
async def update_news_article(news_id: str, update_data: NewsArticleUpdate):
    article = await db.news.find_one({'id': news_id})
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    await db.news.update_one({'id': news_id}, {'$set': update_dict})
    
    updated_article = await db.news.find_one({'id': news_id})
    return NewsArticle(**updated_article)

@api_router.delete("/news/{news_id}")
async def delete_news_article(news_id: str):
    result = await db.news.delete_one({'id': news_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News article not found")
    return {"message": "News article deleted successfully"}

# Citation metrics endpoint
@api_router.get("/citations", response_model=CitationMetrics)
async def get_citation_metrics():
    scholar_data = fetch_google_scholar_data("7pUFcrsAAAAJ")
    return CitationMetrics(**scholar_data)

# Publications endpoint
@api_router.get("/publications", response_model=List[Publication])
async def get_publications(limit: int = 10):
    scopus_data = fetch_scopus_publications("22133247800", limit)
    publications = []
    
    for pub_data in scopus_data:
        pub_dict = pub_data.copy()
        pub_dict['id'] = str(uuid.uuid4())
        publications.append(Publication(**pub_dict))
    
    return publications

# Team members endpoints
@api_router.get("/team", response_model=List[TeamMember])
async def get_team_members():
    members = await db.team_members.find().to_list(100)
    return [TeamMember(**member) for member in members]

@api_router.post("/team", response_model=TeamMember)
async def create_team_member(member: TeamMember):
    await db.team_members.insert_one(member.dict())
    return member

# Research areas endpoints
@api_router.get("/research-areas", response_model=List[ResearchArea])
async def get_research_areas():
    areas = await db.research_areas.find().to_list(100)
    return [ResearchArea(**area) for area in areas]

@api_router.post("/research-areas", response_model=ResearchArea)
async def create_research_area(area: ResearchArea):
    await db.research_areas.insert_one(area.dict())
    return area

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
