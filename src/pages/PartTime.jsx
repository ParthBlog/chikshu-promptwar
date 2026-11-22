import React, { useState, useMemo } from 'react';
import { getItem, setItem, KEYS } from '../utils/storage';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Filter, Clock, IndianRupee } from 'lucide-react';

const JOBS = [
  {
    id: 'j1',
    name: 'Online Tutor (Vedantu / Unacademy)',
    type: 'Online',
    category: 'Teaching',
    income: '₹8,000–₹25,000/month',
    incomeMin: 8000, incomeMax: 25000,
    hours: '10–20 hrs/week',
    hoursNum: 15,
    howToApply: 'Apply at vedantu.com/become-a-teacher or unacademy.com/teach',
    description: 'Teach K-12 students online. Flexible hours, paid per session. Great for students strong in academics.',
  },
  {
    id: 'j2',
    name: 'Freelance Content Writer',
    type: 'Online',
    category: 'Freelancing',
    income: '₹5,000–₹30,000/month',
    incomeMin: 5000, incomeMax: 30000,
    hours: 'Flexible',
    hoursNum: 10,
    howToApply: 'Register on Internshala, Worknrby, or iWriter',
    description: 'Write blog posts, product descriptions, and articles for businesses. No experience needed to start.',
  },
  {
    id: 'j3',
    name: 'Swiggy / Zomato Delivery Partner',
    type: 'Offline',
    category: 'Delivery',
    income: '₹10,000–₹20,000/month',
    incomeMin: 10000, incomeMax: 20000,
    hours: '4–8 hrs/day (flexible)',
    hoursNum: 25,
    howToApply: 'Apply at partner.swiggy.in or zomato.com/delivery-partner',
    description: 'Deliver food orders using a two-wheeler. Flexible schedule, daily earnings, weekly payouts.',
  },
  {
    id: 'j4',
    name: 'Campus Brand Ambassador',
    type: 'Offline',
    category: 'Campus Job',
    income: '₹3,000–₹10,000/month + perks',
    incomeMin: 3000, incomeMax: 10000,
    hours: '5–10 hrs/week',
    hoursNum: 7,
    howToApply: 'Check Internshala and LinkedIn for campus ambassador programs',
    description: 'Represent brands like Amazon, Nykaa, or startups on campus. Build your network and earn commissions.',
  },
  {
    id: 'j5',
    name: 'Graphic Designer (Freelance)',
    type: 'Online',
    category: 'Freelancing',
    income: '₹10,000–₹40,000/month',
    incomeMin: 10000, incomeMax: 40000,
    hours: 'Flexible',
    hoursNum: 15,
    howToApply: 'Create a portfolio on Behance, then apply on Fiverr or 99designs',
    description: 'Design logos, social media posts, and marketing materials. High demand, great for design students.',
  },
  {
    id: 'j6',
    name: 'Data Entry Operator',
    type: 'Online',
    category: 'Remote Work',
    income: '₹5,000–₹12,000/month',
    incomeMin: 5000, incomeMax: 12000,
    hours: '3–6 hrs/day',
    hoursNum: 20,
    howToApply: 'Apply on Naukri, WorkNHire, or Truelancer',
    description: 'Simple data entry tasks for companies. No prior experience needed. Work from home.',
  },
  {
    id: 'j7',
    name: 'Library / Lab Assistant (Campus)',
    type: 'Offline',
    category: 'Campus Job',
    income: '₹2,000–₹5,000/month',
    incomeMin: 2000, incomeMax: 5000,
    hours: '10–15 hrs/week',
    hoursNum: 12,
    howToApply: 'Check your college notice board or administration office',
    description: 'Help manage college library or lab resources. Easy work, great for students who want on-campus jobs.',
  },
  {
    id: 'j8',
    name: 'Social Media Manager',
    type: 'Online',
    category: 'Freelancing',
    income: '₹8,000–₹25,000/month per client',
    incomeMin: 8000, incomeMax: 25000,
    hours: '5–10 hrs/week',
    hoursNum: 7,
    howToApply: 'Cold-pitch local businesses or find clients on LinkedIn/Upwork',
    description: 'Manage Instagram, Facebook pages for small businesses. Great for social media-savvy students.',
  },
  {
    id: 'j9',
    name: 'Internship (Paid) — Internshala',
    type: 'Online',
    category: 'Internship',
    income: '₹5,000–₹15,000/month',
    incomeMin: 5000, incomeMax: 15000,
    hours: '20–40 hrs/week',
    hoursNum: 30,
    howToApply: 'Browse internshala.com and apply directly',
    description: 'Paid internships in marketing, development, design, and finance. Builds resume while earning.',
  },
  {
    id: 'j10',
    name: 'Photography / Videography',
    type: 'Offline',
    category: 'Freelancing',
    income: '₹3,000–₹20,000/event',
    incomeMin: 3000, incomeMax: 20000,
    hours: 'Event-based',
    hoursNum: 8,
    howToApply: 'Market yourself on Instagram, charge per event',
    description: 'Shoot college events, family functions, or product photography. High per-hour rate.',
  },
  {
    id: 'j11',
    name: 'Competitive Exam Notes Seller',
    type: 'Online',
    category: 'Digital Products',
    income: '₹2,000–₹15,000/month',
    incomeMin: 2000, incomeMax: 15000,
    hours: 'Passive',
    hoursNum: 5,
    howToApply: 'Sell on Instagram, Telegram, or platforms like Studocu, NotesGen',
    description: 'Sell well-made notes for JEE, NEET, UPSC, or competitive exams. Passive income once created.',
  },
  {
    id: 'j12',
    name: 'Web Developer (Freelance)',
    type: 'Online',
    category: 'Freelancing',
    income: '₹15,000–₹60,000/project',
    incomeMin: 15000, incomeMax: 60000,
    hours: 'Project-based',
    hoursNum: 20,
    howToApply: 'Build a portfolio, then apply on Upwork, Freelancer, or cold-email startups',
    description: 'Build websites for small businesses. High earning potential for students with coding skills.',
  },
  {
    id: 'j13',
    name: 'Yoga / Fitness Instructor',
    type: 'Offline',
    category: 'Teaching',
    income: '₹10,000–₹30,000/month',
    incomeMin: 10000, incomeMax: 30000,
    hours: 'Morning/evening batches',
    hoursNum: 12,
    howToApply: 'Get a certificate from Yoga Alliance India, then advertise locally',
    description: 'Conduct yoga or fitness sessions at parks, housing societies, or online. Growing demand.',
  },
  {
    id: 'j14',
    name: 'Translator / Transcriptionist',
    type: 'Online',
    category: 'Remote Work',
    income: '₹8,000–₹20,000/month',
    incomeMin: 8000, incomeMax: 20000,
    hours: 'Flexible',
    hoursNum: 15,
    howToApply: 'Apply on Rev.com, TranslatorsCafe, or Gengo',
    description: 'Translate documents or transcribe audio/video for Indian or global clients. Good for multilingual students.',
  },
  {
    id: 'j15',
    name: 'Research Assistant (University)',
    type: 'Offline',
    category: 'Campus Job',
    income: '₹5,000–₹15,000/month',
    incomeMin: 5000, incomeMax: 15000,
    hours: '15–20 hrs/week',
    hoursNum: 17,
    howToApply: 'Email professors in your department with your CV and interest',
    description: 'Assist professors with research, literature reviews, and experiments. Builds academic credentials.',
  },
  {
    id: 'j16',
    name: 'Amazon Flex Delivery',
    type: 'Offline',
    category: 'Delivery',
    income: '₹120–₹140/hour',
    incomeMin: 8000, incomeMax: 18000,
    hours: 'Flexible blocks (3–6 hrs)',
    hoursNum: 15,
    howToApply: 'Download Amazon Flex app and register',
    description: 'Deliver Amazon packages in your city. Choose your own schedule, get paid weekly.',
  },
];

const JOB_TYPES = ['Online', 'Offline'];
const CATEGORIES = [...new Set(JOBS.map(j => j.category))];

export default function PartTime() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterMinIncome, setFilterMinIncome] = useState('');
  const [filterMaxHours, setFilterMaxHours] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => getItem(KEYS.BOOKMARKED_JOBS, []));

  function toggleBookmark(id) {
    const nb = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(nb);
    setItem(KEYS.BOOKMARKED_JOBS, nb);
  }

  const filtered = useMemo(() => {
    return JOBS.filter(j => {
      if (search) {
        const q = search.toLowerCase();
        if (!j.name.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q) && !j.category.toLowerCase().includes(q)) return false;
      }
      if (filterType && j.type !== filterType) return false;
      if (filterCat && j.category !== filterCat) return false;
      if (filterMinIncome && j.incomeMin < parseInt(filterMinIncome)) return false;
      if (filterMaxHours && j.hoursNum > parseInt(filterMaxHours)) return false;
      return true;
    });
  }, [search, filterType, filterCat, filterMinIncome, filterMaxHours]);

  const bookmarked = filtered.filter(j => bookmarks.includes(j.id));
  const others = filtered.filter(j => !bookmarks.includes(j.id));
  const displayed = [...bookmarked, ...others];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Part-Time Jobs</h1>
        <p className="text-gray-500 text-sm mt-0.5">{JOBS.length} student-friendly opportunities</p>
      </div>

      {/* Search + Filters */}
      <div className="border border-black rounded-xl p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-9 pr-3 py-2 border border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 border border-black rounded-lg text-sm font-medium ${showFilters ? 'bg-black text-white' : ''}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
            <div>
              <label className="text-xs font-medium block mb-1">Type</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="w-full border border-black rounded-lg px-2 py-1.5 text-sm">
                <option value="">All</option>
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Category</label>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="w-full border border-black rounded-lg px-2 py-1.5 text-sm">
                <option value="">All</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Min Income (₹/mo)</label>
              <input type="number" value={filterMinIncome} onChange={e => setFilterMinIncome(e.target.value)}
                className="w-full border border-black rounded-lg px-2 py-1.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Max Hours/Week</label>
              <input type="number" value={filterMaxHours} onChange={e => setFilterMaxHours(e.target.value)}
                className="w-full border border-black rounded-lg px-2 py-1.5 text-sm" placeholder="Any" />
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">{displayed.length} job{displayed.length !== 1 ? 's' : ''} found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayed.map(job => {
          const isBookmarked = bookmarks.includes(job.id);
          return (
            <div key={job.id} className={`border border-black rounded-xl p-5 flex flex-col ${isBookmarked ? 'bg-black text-white' : 'bg-white'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className={`font-bold text-sm leading-tight ${isBookmarked ? 'text-white' : ''}`}>{job.name}</h3>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${isBookmarked ? 'border-white text-white' : 'border-black text-black'}`}>
                      {job.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${isBookmarked ? 'border-gray-500 text-gray-300' : 'border-gray-300 text-gray-500'}`}>
                      {job.category}
                    </span>
                  </div>
                </div>
                <button onClick={() => toggleBookmark(job.id)} className={`flex-shrink-0 ${isBookmarked ? 'text-white' : 'text-gray-400 hover:text-black'}`}>
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>

              <p className={`text-xs leading-relaxed mb-4 ${isBookmarked ? 'text-gray-200' : 'text-gray-600'}`}>{job.description}</p>

              <div className={`grid grid-cols-2 gap-3 text-xs mb-4 ${isBookmarked ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <div>
                    <p className={`font-semibold ${isBookmarked ? 'text-white' : 'text-black'}`}>{job.income}</p>
                    <p>Estimated earnings</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <div>
                    <p className={`font-semibold ${isBookmarked ? 'text-white' : 'text-black'}`}>{job.hours}</p>
                    <p>Time commitment</p>
                  </div>
                </div>
              </div>

              <div className={`text-xs p-3 rounded-lg border mt-auto ${isBookmarked ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`font-semibold mb-0.5 ${isBookmarked ? 'text-white' : 'text-black'}`}>How to Apply:</p>
                <p className={isBookmarked ? 'text-gray-300' : 'text-gray-600'}>{job.howToApply}</p>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && (
        <div className="border border-black rounded-xl p-10 text-center">
          <p className="text-gray-400">No jobs match your filters.</p>
        </div>
      )}
    </div>
  );
}
