import React, { useState, useMemo } from 'react';
import { getItem, setItem, KEYS } from '../utils/storage';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Filter, Clock, IndianRupee, Briefcase, Sparkles, MapPin, Laptop, ChevronRight } from 'lucide-react';
import { EmptyGraphic } from '../components/Graphics';

const JOBS = [
  {
    id: 'j1',
    name: 'Online Tutor (Vedantu / Unacademy / Chegg)',
    type: 'Online',
    category: 'Teaching',
    income: '₹8,000–₹25,000/mo',
    incomeMin: 8000, incomeMax: 25000,
    hours: '10–15 hrs/week',
    skillLevel: 'Academic Strengths',
    howToApply: 'https://www.vedantu.com',
    description: 'Teach K-12 school students online in Maths, Physics, Coding, or English. Flexible night/weekend batches.',
  },
  {
    id: 'j2',
    name: 'Freelance Tech & SEO Content Writer',
    type: 'Online',
    category: 'Freelancing',
    income: '₹6,000–₹30,000/mo',
    incomeMin: 6000, incomeMax: 30000,
    hours: 'Flexible / Per Project',
    skillLevel: 'Good English & Research',
    howToApply: 'https://internshala.com',
    description: 'Write articles, technical blogs, and product documentation for startups. Completely remote from hostel.',
  },
  {
    id: 'j3',
    name: 'Swiggy / Zomato Delivery Partner',
    type: 'Offline',
    category: 'Delivery',
    income: '₹12,000–₹22,000/mo',
    incomeMin: 12000, incomeMax: 22000,
    hours: '4–6 hrs/day (Flexible)',
    skillLevel: 'Two-Wheeler + Driving License',
    howToApply: 'https://partner.swiggy.in',
    description: 'Deliver food orders during peak lunch/dinner hours in your university city. Instant weekly payouts.',
  },
  {
    id: 'j4',
    name: 'Campus Brand Ambassador (Amazon / Red Bull / Startups)',
    type: 'Offline',
    category: 'Campus Job',
    income: '₹4,000–₹12,000/mo + Swag',
    incomeMin: 4000, incomeMax: 12000,
    hours: '5–8 hrs/week',
    skillLevel: 'Networking & Social Media',
    howToApply: 'https://www.linkedin.com',
    description: 'Organize campus product activations, hackathon sponsorships, and app downloads. Great for resumes.',
  },
  {
    id: 'j5',
    name: 'Graphic Designer & Thumbnail Creator',
    type: 'Online',
    category: 'Freelancing',
    income: '₹10,000–₹35,000/mo',
    incomeMin: 10000, incomeMax: 35000,
    hours: 'Flexible (Canva / Figma)',
    skillLevel: 'Design Basics',
    howToApply: 'https://www.fiverr.com',
    description: 'Create YouTube thumbnails, Instagram carousels, and poster designs for creators and local brands.',
  },
  {
    id: 'j6',
    name: 'College Library / Computer Lab Assistant',
    type: 'Offline',
    category: 'Campus Job',
    income: '₹3,000–₹6,000/mo',
    incomeMin: 3000, incomeMax: 6000,
    hours: '10 hrs/week (On-Campus)',
    skillLevel: 'Punctuality',
    howToApply: '#',
    description: 'Help manage book lending systems and computer terminal logins. Ample downtime to study during shifts.',
  },
  {
    id: 'j7',
    name: 'Social Media & Community Manager',
    type: 'Online',
    category: 'Remote Work',
    income: '₹8,000–₹22,000/mo',
    incomeMin: 8000, incomeMax: 22000,
    hours: '10–12 hrs/week',
    skillLevel: 'Instagram & Discord Savvy',
    howToApply: 'https://internshala.com',
    description: 'Moderate college student Discord channels, schedule Twitter/LinkedIn posts, and engage with followers.',
  },
  {
    id: 'j8',
    name: 'Junior Web & Frontend Developer',
    type: 'Online',
    category: 'Tech',
    income: '₹15,000–₹45,000/mo',
    incomeMin: 15000, incomeMax: 45000,
    hours: '15–20 hrs/week',
    skillLevel: 'HTML, CSS, React, JS',
    howToApply: 'https://wellfound.com',
    description: 'Build landing pages and bugfix React components for early-stage startups and local commerce clients.',
  },
  {
    id: 'j9',
    name: 'University Professor Research Assistant',
    type: 'Offline',
    category: 'Campus Job',
    income: '₹6,000–₹14,000/mo',
    incomeMin: 6000, incomeMax: 14000,
    hours: '12–15 hrs/week',
    skillLevel: 'Subject Knowledge',
    howToApply: '#',
    description: 'Conduct literature surveys, format research papers, and assist in lab data collection with department faculty.',
  },
  {
    id: 'j10',
    name: 'Amazon Flex Package Delivery Partner',
    type: 'Offline',
    category: 'Delivery',
    income: '₹140–₹160/hr',
    incomeMin: 8000, incomeMax: 18000,
    hours: '3–4 hour booking blocks',
    skillLevel: 'Vehicle & Smartphone',
    howToApply: 'https://flex.amazon.in',
    description: 'Deliver e-commerce packages during weekends or free afternoon college slots. You choose your hours.',
  },
  {
    id: 'j11',
    name: 'Video Editor for YouTube Shorts & Reels',
    type: 'Online',
    category: 'Freelancing',
    income: '₹12,000–₹40,000/mo',
    incomeMin: 12000, incomeMax: 40000,
    hours: 'Project-based (CapCut / Premiere)',
    skillLevel: 'Fast Paced Editing',
    howToApply: 'https://twitter.com',
    description: 'Cut vertical short-form videos for educational influencers and startup podcasts. High demand.',
  },
  {
    id: 'j12',
    name: 'Competitive Exam Notes & Study Guide Seller',
    type: 'Online',
    category: 'Digital Products',
    income: '₹4,000–₹18,000/mo (Passive)',
    incomeMin: 4000, incomeMax: 18000,
    hours: 'One-time creation',
    skillLevel: 'Clean Handwritten Notes',
    howToApply: 'https://www.studocu.com',
    description: 'Digitize your semester engineering/medical notes and earn passive royalties per download on student marketplaces.',
  },
];

export default function PartTime() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => getItem(KEYS.BOOKMARKED_JOBS, []));

  function toggleBookmark(id) {
    const nb = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(nb);
    setItem(KEYS.BOOKMARKED_JOBS, nb);
  }

  const filtered = useMemo(() => {
    return JOBS.filter(j => {
      if (onlyBookmarked && !bookmarks.includes(j.id)) return false;
      if (filterType && j.type !== filterType) return false;
      if (filterCategory && j.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!j.name.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q) && !j.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, filterType, filterCategory, onlyBookmarked, bookmarks]);

  const categories = ['All', 'Teaching', 'Tech', 'Freelancing', 'Campus Job', 'Delivery'];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            Student Income Opportunities
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Part-Time Jobs & Student Gigs</h1>
          <p className="mt-1 text-teal-100 text-xs sm:text-sm">
            Legitimate remote gigs, campus assistantships, tutoring, and freelance work designed around college schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-xs">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span>Average Student Side-Income: <strong>₹12,000/mo</strong></span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, skill (e.g. tutoring, react, writing)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="">Online & Offline</option>
              <option value="Online">Online Only</option>
              <option value="Offline">Offline / Campus</option>
            </select>

            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                onlyBookmarked
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              Saved ({bookmarks.length})
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {categories.map((cat) => {
            const isSelected = (cat === 'All' && !filterCategory) || filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat === 'All' ? '' : cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Grid */}
      {filtered.length === 0 ? (
        <EmptyGraphic
          title="No opportunities found"
          message="Try broadening your search term or selecting 'All' categories."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((j) => {
            const isBookmarked = bookmarks.includes(j.id);
            const isOnline = j.type === 'Online';

            return (
              <div
                key={j.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isBookmarked ? 'border-teal-400 bg-teal-50/15 ring-2 ring-teal-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isOnline ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {j.type}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {j.category}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleBookmark(j.id)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        isBookmarked ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{j.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{j.description}</p>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl my-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Est. Earning Potential</span>
                      <p className="font-black text-emerald-700 text-sm mt-0.5">{j.income}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Commitment</span>
                      <p className="font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {j.hours}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Skills:</span>
                    <span>{j.skillLevel}</span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Verified Listing</span>
                  <a
                    href={j.howToApply}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Apply / Learn More <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
