import React, { useState, useMemo } from 'react';
import { getItem, setItem, KEYS } from '../utils/storage';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Filter, X } from 'lucide-react';

const SCHOLARSHIPS = [
  {
    id: 'ns1',
    name: 'National Scholarship Portal (NSP)',
    provider: 'Ministry of Education, India',
    amount: 'Up to ₹25,000/year',
    amountNum: 25000,
    eligibility: 'Need-based',
    deadline: '2024-10-31',
    link: 'https://scholarships.gov.in',
    description: 'Central government scholarships for SC/ST/OBC/Minority students. One of India\'s largest scholarship programmes.',
  },
  {
    id: 'ns2',
    name: 'Prime Minister\'s Scholarship Scheme (PMSS)',
    provider: 'Kendriya Sainik Board',
    amount: '₹2,500/month (boys), ₹3,000/month (girls)',
    amountNum: 36000,
    eligibility: 'Merit + Defence background',
    deadline: '2024-11-30',
    link: 'https://ksb.gov.in',
    description: 'For wards and widows of ex-servicemen/policemen pursuing professional courses.',
  },
  {
    id: 'ns3',
    name: 'Inspire Scholarship',
    provider: 'Department of Science & Technology',
    amount: '₹80,000/year',
    amountNum: 80000,
    eligibility: 'Merit (top 1% in Class 12)',
    deadline: '2024-12-15',
    link: 'https://online-inspire.gov.in',
    description: 'For students who have secured top 1% marks in Class 12 and are pursuing BSc/MSc in natural sciences.',
  },
  {
    id: 'ns4',
    name: 'Central Sector Scheme of Scholarships',
    provider: 'Ministry of Education',
    amount: '₹10,000/year (Degree), ₹20,000/year (PG)',
    amountNum: 20000,
    eligibility: 'Merit + Income < ₹8 LPA',
    deadline: '2024-10-31',
    link: 'https://scholarships.gov.in',
    description: 'For meritorious students from low-income families pursuing higher education.',
  },
  {
    id: 'ns5',
    name: 'HDFC Bank Educational Crisis Scholarship',
    provider: 'HDFC Bank Parivartan',
    amount: '₹75,000 (one-time)',
    amountNum: 75000,
    eligibility: 'Need-based, family crisis',
    deadline: '2024-09-30',
    link: 'https://www.hdfcbank.com/scholarships',
    description: 'For students facing financial crisis due to sudden family adversity (death of breadwinner, accident, etc.).',
  },
  {
    id: 'ns6',
    name: 'Tata Capital Pankh Scholarship',
    provider: 'Tata Capital',
    amount: 'Up to ₹10,000/year',
    amountNum: 10000,
    eligibility: 'Need-based, Class 11–UG',
    deadline: '2024-08-31',
    link: 'https://www.tatacapitalpankh.com',
    description: 'Supports underprivileged students in Class 11 to under-graduation level across India.',
  },
  {
    id: 'ns7',
    name: 'Aditya Birla Capital Scholarship',
    provider: 'Aditya Birla Group',
    amount: '₹65,000/year',
    amountNum: 65000,
    eligibility: 'Merit, top IITs/IIMs/NITs',
    deadline: '2024-10-15',
    link: 'https://www.adityabirlascholarship.com',
    description: 'Prestigious scholarship for students at top engineering and management institutions.',
  },
  {
    id: 'ns8',
    name: 'Reliance Foundation UG Scholarship',
    provider: 'Reliance Foundation',
    amount: '₹2,00,000/year',
    amountNum: 200000,
    eligibility: 'Merit + Need, 60%+ in Class 12',
    deadline: '2024-05-31',
    link: 'https://rf.scholarshiponline.in',
    description: 'For first-year undergraduate students in STEM and humanities, includes mentoring and leadership development.',
  },
  {
    id: 'ns9',
    name: 'Sitaram Jindal Foundation Scholarship',
    provider: 'Sitaram Jindal Foundation',
    amount: '₹1,500–₹5,000/month',
    amountNum: 60000,
    eligibility: 'Need-based, 50%+ marks',
    deadline: '2024-07-31',
    link: 'https://sitaramjindalfoundation.org',
    description: 'Monthly stipends for meritorious and financially needy students across various courses.',
  },
  {
    id: 'ns10',
    name: 'Buddy4Study Government Scholarships Aggregator',
    provider: 'Buddy4Study',
    amount: 'Varies',
    amountNum: 50000,
    eligibility: 'Various',
    deadline: '2024-12-31',
    link: 'https://www.buddy4study.com',
    description: 'Aggregates 3,000+ scholarships. Use to discover hidden scholarships matching your profile.',
  },
  {
    id: 'ns11',
    name: 'Kishore Vaigyanik Protsahan Yojana (KVPY)',
    provider: 'Indian Institute of Science',
    amount: '₹5,000–₹7,000/month',
    amountNum: 84000,
    eligibility: 'Merit, science students',
    deadline: '2024-08-25',
    link: 'https://kvpy.iisc.ac.in',
    description: 'Fellowship for students pursuing basic sciences with strong aptitude for research.',
  },
  {
    id: 'ns12',
    name: 'ONGC Scholarship',
    provider: 'Oil and Natural Gas Corporation',
    amount: '₹48,000/year',
    amountNum: 48000,
    eligibility: 'Merit + Need, SC/ST/OBC',
    deadline: '2024-09-15',
    link: 'https://www.ongcindia.com',
    description: 'For SC/ST/OBC students pursuing engineering or MBA degrees.',
  },
  {
    id: 'ns13',
    name: 'Google Generation Scholarship',
    provider: 'Google',
    amount: 'USD 1,000',
    amountNum: 83000,
    eligibility: 'Merit, underrepresented groups in CS',
    deadline: '2024-12-01',
    link: 'https://buildyourfuture.withgoogle.com/scholarships',
    description: 'For students from underrepresented groups studying computer science or related fields.',
  },
  {
    id: 'ns14',
    name: 'Fulbright-Nehru Fellowship',
    provider: 'U.S. Embassy / USIEF',
    amount: 'Full funding (US study)',
    amountNum: 2000000,
    eligibility: 'Merit, postgrad research',
    deadline: '2024-07-15',
    link: 'https://www.usief.org.in',
    description: 'Prestigious fellowship for Indian students to pursue master\'s or research in the United States.',
  },
  {
    id: 'ns15',
    name: 'Manipal Excellence Scholarship',
    provider: 'Manipal University',
    amount: 'Up to 100% tuition waiver',
    amountNum: 300000,
    eligibility: 'Merit (90%+ in Class 12)',
    deadline: '2024-06-30',
    link: 'https://manipal.edu/mu/scholarships.html',
    description: 'Tuition fee waiver up to 100% for students with exceptional Class 12 scores.',
  },
  {
    id: 'ns16',
    name: 'Swami Vivekananda Merit-Cum-Means Scholarship',
    provider: 'West Bengal Government',
    amount: '₹1,000–₹5,000/month',
    amountNum: 60000,
    eligibility: 'Need + Merit, WB domicile',
    deadline: '2024-10-15',
    link: 'https://svmcm.wbhed.gov.in',
    description: 'State scholarship for meritorious West Bengal students in higher education.',
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
  const [filterType, setFilterType] = useState('');
  const [filterMinAmt, setFilterMinAmt] = useState('');
  const [filterMaxAmt, setFilterMaxAmt] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.provider.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
      }
      if (filterType) {
        const t = filterType.toLowerCase();
        if (!s.eligibility.toLowerCase().includes(t)) return false;
      }
      if (filterMinAmt && s.amountNum < parseInt(filterMinAmt)) return false;
      if (filterMaxAmt && s.amountNum > parseInt(filterMaxAmt)) return false;
      return true;
    });
  }, [search, filterType, filterMinAmt, filterMaxAmt]);

  const bookmarked = filtered.filter(s => bookmarks.includes(s.id));
  const others = filtered.filter(s => !bookmarks.includes(s.id));
  const displayed = [...bookmarked, ...others];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Scholarships</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {SCHOLARSHIPS.length} scholarships curated for Indian students
        </p>
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
              placeholder="Search scholarships..."
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
            <div>
              <label className="text-xs font-medium block mb-1">Eligibility Type</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="w-full border border-black rounded-lg px-2 py-1.5 text-sm">
                <option value="">All</option>
                <option value="merit">Merit</option>
                <option value="need">Need-based</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Min Amount (₹)</label>
              <input type="number" value={filterMinAmt} onChange={e => setFilterMinAmt(e.target.value)}
                className="w-full border border-black rounded-lg px-2 py-1.5 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Max Amount (₹)</label>
              <input type="number" value={filterMaxAmt} onChange={e => setFilterMaxAmt(e.target.value)}
                className="w-full border border-black rounded-lg px-2 py-1.5 text-sm" placeholder="Any" />
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">{displayed.length} scholarship{displayed.length !== 1 ? 's' : ''} found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayed.map(s => {
          const days = getDaysUntil(s.deadline);
          const isBookmarked = bookmarks.includes(s.id);

          return (
            <div key={s.id} className={`border border-black rounded-xl p-5 flex flex-col ${isBookmarked ? 'bg-black text-white' : 'bg-white'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`font-bold text-sm leading-tight ${isBookmarked ? 'text-white' : 'text-black'}`}>{s.name}</h3>
                <button
                  onClick={() => toggleBookmark(s.id)}
                  className={`flex-shrink-0 ${isBookmarked ? 'text-white' : 'text-gray-400 hover:text-black'}`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>

              <p className={`text-xs mb-3 ${isBookmarked ? 'text-gray-300' : 'text-gray-500'}`}>{s.provider}</p>
              <p className={`text-xs mb-3 leading-relaxed ${isBookmarked ? 'text-gray-200' : 'text-gray-600'}`}>{s.description}</p>

              <div className={`grid grid-cols-2 gap-2 text-xs mb-4 ${isBookmarked ? 'text-gray-300' : 'text-gray-600'}`}>
                <div>
                  <span className="font-semibold">Amount:</span>
                  <p className={`font-bold text-sm ${isBookmarked ? 'text-white' : 'text-black'}`}>{s.amount}</p>
                </div>
                <div>
                  <span className="font-semibold">Eligibility:</span>
                  <p>{s.eligibility}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="text-xs">
                  <span className={isBookmarked ? 'text-gray-300' : 'text-gray-500'}>Deadline: {s.deadline}</span>
                  <span className={`ml-2 font-medium px-2 py-0.5 rounded-full border ${
                    days < 0 ? 'border-gray-500 text-gray-500' :
                    days < 30 ? (isBookmarked ? 'border-white text-white' : 'border-black text-black bg-black text-white') :
                    (isBookmarked ? 'border-gray-500 text-gray-300' : 'border-gray-300 text-gray-500')
                  }`}>
                    {days < 0 ? 'Closed' : days === 0 ? 'Today!' : `${days}d left`}
                  </span>
                </div>
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 text-xs font-medium underline ${isBookmarked ? 'text-white' : 'text-black'}`}
                >
                  Apply <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && (
        <div className="border border-black rounded-xl p-10 text-center">
          <p className="text-gray-400">No scholarships match your filters.</p>
        </div>
      )}
    </div>
  );
}
