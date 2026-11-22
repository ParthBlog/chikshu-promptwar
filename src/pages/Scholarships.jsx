import React, { useState, useMemo } from 'react';
import { getItem, setItem, KEYS } from '../utils/storage';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Filter, GraduationCap, Sparkles, Calendar, CheckCircle2, Award } from 'lucide-react';
import { EmptyGraphic } from '../components/Graphics';

const SCHOLARSHIPS = [
  {
    id: 'ns1',
    name: 'National Scholarship Portal (NSP)',
    provider: 'Ministry of Education, India',
    amount: 'Up to ₹25,000/year',
    amountNum: 25000,
    eligibility: 'Need-based (SC/ST/OBC/Minority)',
    deadline: '2025-10-31',
    link: 'https://scholarships.gov.in',
    category: 'Government',
    description: 'Central government scholarships for SC/ST/OBC/Minority students. One of India\'s largest scholarship programmes with direct DBT transfers.',
  },
  {
    id: 'ns2',
    name: 'Prime Minister\'s Scholarship Scheme (PMSS)',
    provider: 'Kendriya Sainik Board',
    amount: '₹30,000–₹36,000/year',
    amountNum: 36000,
    eligibility: 'Merit + Defence background',
    deadline: '2025-11-30',
    link: 'https://ksb.gov.in',
    category: 'Defence',
    description: 'For wards and widows of ex-servicemen/policemen pursuing professional engineering, medical, and management courses.',
  },
  {
    id: 'ns3',
    name: 'Inspire Scholarship for Higher Education (SHE)',
    provider: 'Department of Science & Technology',
    amount: '₹80,000/year',
    amountNum: 80000,
    eligibility: 'Merit (Top 1% in Class 12)',
    deadline: '2025-12-15',
    link: 'https://online-inspire.gov.in',
    category: 'Merit',
    description: 'Prestigious national scholarship for students pursuing BSc, BS, Int. MSc in natural and basic sciences with research mentorship.',
  },
  {
    id: 'ns4',
    name: 'Central Sector Scheme of Scholarships (CSSS)',
    provider: 'Ministry of Education',
    amount: '₹12,000–₹20,000/year',
    amountNum: 20000,
    eligibility: 'Merit + Family Income < ₹8 LPA',
    deadline: '2025-10-31',
    link: 'https://scholarships.gov.in',
    category: 'Government',
    description: 'Supports meritorious undergraduate college students from middle-income families across all accredited Indian universities.',
  },
  {
    id: 'ns5',
    name: 'HDFC Bank Parivartan Educational Crisis Grant',
    provider: 'HDFC Bank CSR',
    amount: 'Up to ₹75,000',
    amountNum: 75000,
    eligibility: 'Need-based (Personal/Family Crisis)',
    deadline: '2025-09-30',
    link: 'https://www.hdfcbank.com',
    category: 'Corporate',
    description: 'Provides critical financial relief for students facing sudden family adversity, medical emergencies, or breadwinner loss.',
  },
  {
    id: 'ns6',
    name: 'Tata Capital Pankh Scholarship',
    provider: 'Tata Capital',
    amount: 'Up to ₹12,000/year',
    amountNum: 12000,
    eligibility: 'Need-based, Class 11–Undergraduate',
    deadline: '2025-08-31',
    link: 'https://www.tatacapital.com',
    category: 'Corporate',
    description: 'Empowers underprivileged youth to pursue higher degrees without dropping out due to academic fee constraints.',
  },
  {
    id: 'ns7',
    name: 'Aditya Birla Capital Scholarship',
    provider: 'Aditya Birla Group',
    amount: '₹65,000/year',
    amountNum: 65000,
    eligibility: 'Merit (IITs, NITs, BITS, IIMs)',
    deadline: '2025-10-15',
    link: 'https://www.adityabirlascholarship.com',
    category: 'Merit',
    description: 'Prestigious fellowship for premier technical and management institute students, with industry internship opportunities.',
  },
  {
    id: 'ns8',
    name: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    amount: 'Up to ₹2,00,000',
    amountNum: 200000,
    eligibility: 'Merit + Need (60%+ in Class 12)',
    deadline: '2025-10-15',
    link: 'https://www.reliancefoundation.org',
    category: 'Corporate',
    description: 'Competitive nationwide scholarship for first-year undergraduate students in STEM and humanities, including leadership camps.',
  },
  {
    id: 'ns9',
    name: 'Sitaram Jindal Foundation Scholarship',
    provider: 'Sitaram Jindal Foundation',
    amount: '₹1,500–₹5,000/month',
    amountNum: 60000,
    eligibility: 'Need-based, 55%+ marks',
    deadline: '2025-11-20',
    link: 'https://sitaramjindalfoundation.org',
    category: 'NGO',
    description: 'Continuous monthly stipends for deserving students enrolled in polytechnic, degree, engineering, and medical courses.',
  },
  {
    id: 'ns10',
    name: 'Google Generation Scholarship (APAC)',
    provider: 'Google',
    amount: 'USD 2,500 (~₹2,05,000)',
    amountNum: 205000,
    eligibility: 'Women & Underrepresented Groups in CS',
    deadline: '2025-12-01',
    link: 'https://buildyourfuture.withgoogle.com',
    category: 'Tech',
    description: 'Empowers women in computer science and gaming. Includes an invitation to Google retreat, coding workshops, and community.',
  },
  {
    id: 'ns11',
    name: 'ONGC Scholarship for SC/ST/OBC Students',
    provider: 'Oil and Natural Gas Corporation',
    amount: '₹48,000/year',
    amountNum: 48000,
    eligibility: 'Merit + Need, Reserved categories',
    deadline: '2025-09-15',
    link: 'https://www.ongcindia.com',
    category: 'Government',
    description: 'Annual financial support for engineering, geology, and MBA students with excellent university track records.',
  },
  {
    id: 'ns12',
    name: 'Swami Vivekananda Merit-Cum-Means (SVMCM)',
    provider: 'State Government',
    amount: '₹12,000–₹60,000/year',
    amountNum: 60000,
    eligibility: 'Merit (60%+ marks) + Domicile',
    deadline: '2025-10-15',
    link: 'https://svmcm.wbhed.gov.in',
    category: 'Government',
    description: 'Comprehensive financial backing for students in higher secondary, diploma, undergraduate, and postgraduate programs.',
  },
];

function getDaysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export default function Scholarships() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    return getItem(KEYS.BOOKMARKED_SCHOLARSHIPS, []);
  });

  function toggleBookmark(id) {
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    setItem(KEYS.BOOKMARKED_SCHOLARSHIPS, newBookmarks);
  }

  const filtered = useMemo(() => {
    return SCHOLARSHIPS.filter(s => {
      if (onlyBookmarked && !bookmarks.includes(s.id)) return false;
      if (filterCategory && s.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.provider.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, filterCategory, onlyBookmarked, bookmarks]);

  const categories = ['All', 'Government', 'Corporate', 'Merit', 'Tech', 'Defence'];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Scholarship Discovery Engine
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Scholarships & Grants</h1>
          <p className="mt-1 text-sky-100 text-xs sm:text-sm">
            Curated list of verified national, corporate, and merit-based financial aid opportunities for Indian students.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-xs">
          <Award className="w-5 h-5 text-yellow-300" />
          <span>Over <strong>₹8.5 Lakhs+</strong> in active funding listed</span>
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
              placeholder="Search by scholarship name, provider, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              onlyBookmarked
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            Saved Only ({bookmarks.length})
          </button>
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

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong>{filtered.length}</strong> available scholarships</span>
        {bookmarks.length > 0 && <span>{bookmarks.length} bookmarked for deadline tracking</span>}
      </div>

      {/* Scholarships Grid */}
      {filtered.length === 0 ? (
        <EmptyGraphic
          title="No scholarships found"
          message="Try different search keywords or switch category filter to 'All'."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((s) => {
            const isBookmarked = bookmarks.includes(s.id);
            const days = getDaysUntil(s.deadline);
            const isHighValue = s.amountNum >= 50000;

            return (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isBookmarked
                    ? 'border-blue-400 bg-blue-50/15 ring-2 ring-blue-100'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {s.category}
                      </span>
                      {isHighValue && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> High Value
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleBookmark(s.id)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark scholarship'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{s.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{s.provider}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.description}</p>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl my-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Award Amount</span>
                      <p className="font-black text-slate-900 text-sm mt-0.5">{s.amount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Eligibility</span>
                      <p className="font-medium text-slate-700 mt-0.5 truncate">{s.eligibility}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline:</span>
                    <span className={`font-bold ${days < 30 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {days < 0 ? 'Closed' : `${days}d left`}
                    </span>
                  </div>

                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Apply Now <ExternalLink className="w-3 h-3" />
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
