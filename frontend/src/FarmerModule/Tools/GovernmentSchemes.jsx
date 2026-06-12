import { useState } from 'react';
import { Search, BookOpen, ExternalLink, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Select, MenuItem } from '@mui/material';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CROPS = [
  'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Groundnut',
  'Soybean', 'Sunflower', 'Vegetables', 'Fruits', 'Millets', 'Tea', 'Coffee', 'Rubber'
];

const FARMER_CATEGORIES = [
  { value: 'small', label: 'Small (< 2.5 acres)' },
  { value: 'marginal', label: 'Marginal (< 1 acre)' },
  { value: 'medium', label: 'Medium (2.5 - 10 acres)' },
  { value: 'large', label: 'Large (> 10 acres)' }
];

const STATIC_SCHEMES = [
  {
    id: 1,
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Central',
    description: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families.',
    eligibility: ['All farmer families', 'Landholding farmers', 'Both small and large farmers'],
    benefits: '₹6,000 per year (₹2,000 per installment)',
    howToApply: [
      'Visit nearest Common Service Centre (CSC)',
      'Register on PM-KISAN portal with Aadhaar',
      'Submit land records and bank details',
      'Receive direct bank transfer'
    ],
    link: 'https://pmkisan.gov.in/',
    applicableStates: 'all',
    applicableCrops: 'all'
  },
  {
    id: 2,
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    category: 'Central',
    description: 'Comprehensive crop insurance scheme protecting farmers against crop loss due to natural calamities, pests, and diseases.',
    eligibility: ['All farmers growing notified crops', 'Sharecroppers and tenant farmers', 'Compulsory for loanee farmers'],
    benefits: 'Up to 90% premium subsidy, Sum insured equals to scale of finance for the crop',
    howToApply: [
      'Approach nearest bank or insurance company',
      'Register within 7 days of sowing',
      'Pay nominal premium (2% for Kharif, 1.5% for Rabi)',
      'Get coverage against natural disasters'
    ],
    link: 'https://pmfby.gov.in/',
    applicableStates: 'all',
    applicableCrops: 'all'
  },
  {
    id: 3,
    name: 'KCC (Kisan Credit Card)',
    category: 'Central',
    description: 'Credit facility for farmers to purchase seeds, fertilizers, and other inputs with concessional interest rates.',
    eligibility: ['Landholding farmers', 'Tenant farmers', 'Oral lessees', 'Self-help groups'],
    benefits: '₹3 lakh at 4% interest (effective rate after subsidy), Flexible repayment',
    howToApply: [
      'Visit nearest bank branch',
      'Submit land documents and Aadhaar',
      'Fill KCC application form',
      'Receive credit card within 15 days'
    ],
    link: 'https://www.india.gov.in/spotlight/kisan-credit-card-kcc',
    applicableStates: 'all',
    applicableCrops: 'all'
  },
  {
    id: 4,
    name: 'Soil Health Card Scheme',
    category: 'Central',
    description: 'Free soil testing and health card providing crop-wise recommendations to improve soil productivity.',
    eligibility: ['All farmers with agricultural land'],
    benefits: 'Free soil testing, Customized fertilizer recommendations, Digital access',
    howToApply: [
      'Contact local agriculture department',
      'Submit soil samples from your field',
      'Receive soil health card within 2 weeks',
      'Get fertilizer recommendations'
    ],
    link: 'https://soilhealth.dac.gov.in/',
    applicableStates: 'all',
    applicableCrops: 'all'
  },
  {
    id: 5,
    name: 'PM-KUSUM (Solar Pump Scheme)',
    category: 'Central',
    description: 'Financial assistance for installation of solar pumps and grid-connected solar power plants on barren land.',
    eligibility: ['Individual farmers', 'Farmer cooperatives', 'Panchayats', 'Farmer Producer Organizations'],
    benefits: '60% subsidy from government, 30% loan from bank, Only 10% farmer contribution',
    howToApply: [
      'Apply through state nodal agency',
      'Submit land ownership documents',
      'Choose empaneled vendor',
      'Get subsidy after installation'
    ],
    link: 'https://www.mnre.gov.in/solar/schemes',
    applicableStates: 'all',
    applicableCrops: 'all'
  },
  {
    id: 6,
    name: 'Tamil Nadu Uzhavar Sandhai Scheme',
    category: 'State',
    description: 'Direct farmer-to-consumer markets eliminating middlemen, ensuring better prices for farmers.',
    eligibility: ['Farmers in Tamil Nadu', 'Registered with local agriculture department'],
    benefits: 'Direct market access, Better prices (10-15% higher), No middleman commission',
    howToApply: [
      'Register at nearest Uzhavar Sandhai',
      'Submit farmer ID and land documents',
      'Book stall space (free)',
      'Sell produce directly to consumers'
    ],
    link: 'https://tn.gov.in/scheme/uzhavar_sandhai',
    applicableStates: ['Tamil Nadu'],
    applicableCrops: 'all'
  },
  {
    id: 7,
    name: 'National Mission for Sustainable Agriculture (NMSA)',
    category: 'Central',
    description: 'Promotes sustainable agriculture practices through organic farming, water conservation, and soil health management.',
    eligibility: ['All farmers', 'Preference to small and marginal farmers'],
    benefits: 'Subsidies on organic inputs, Training programs, Water-saving equipment subsidy',
    howToApply: [
      'Contact district agriculture officer',
      'Enroll in training programs',
      'Adopt sustainable practices',
      'Receive input subsidies'
    ],
    link: 'https://nmsa.dac.gov.in/',
    applicableStates: 'all',
    applicableCrops: 'all'
  }
];

const CustomSelect = ({ name, value, onChange, options, placeholder, required }) => (
  <Select
    name={name}
    value={value}
    onChange={onChange}
    displayEmpty
    required={required}
    className="w-full bg-white"
    sx={{
      borderRadius: '0.5rem',
      fontSize: { xs: '0.875rem', sm: '1rem' },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d1d5db',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#22c55e',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#22c55e',
        borderWidth: '2px',
      },
      '.MuiSelect-select': {
        padding: { xs: '10px 14px', sm: '12.5px 16px' },
        color: value === '' ? '#6b7280' : '#111827',
      }
    }}
    MenuProps={{
      PaperProps: {
        sx: {
          mt: 1,
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          maxHeight: { xs: '250px', sm: '300px' },
          // Hide scrollbar for cleaner look
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }
      }
    }}
  >
    <MenuItem value="" disabled sx={{ color: '#6b7280', fontSize: { xs: '0.875rem', sm: '1rem' } }}>{placeholder}</MenuItem>
    {options.map(opt => (
      <MenuItem 
        key={opt.value || opt} 
        value={opt.value || opt}
        sx={{
          fontSize: { xs: '0.875rem', sm: '1rem' },
          py: { xs: 1.5, sm: 1 },
          px: { xs: 2, sm: 2 },
          '&.Mui-selected': {
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#bbf7d0',
            }
          },
          '&:hover': {
            backgroundColor: '#f3f4f6',
          }
        }}
      >
        {opt.label || opt}
      </MenuItem>
    ))}
  </Select>
);

export default function GovernmentSchemes() {
  const [formData, setFormData] = useState({
    state: '',
    crop: '',
    farmSize: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [aiSchemes, setAiSchemes] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    // Filter static schemes
    const filtered = STATIC_SCHEMES.filter(scheme => {
      const stateMatch = scheme.applicableStates === 'all' || scheme.applicableStates.includes(formData.state);
      const cropMatch = scheme.applicableCrops === 'all';
      return stateMatch && cropMatch;
    });

    setSchemes(filtered);

    // Fetch AI schemes for new/recent schemes
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/schemes/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success && data.aiSchemes) {
        setAiSchemes(data.aiSchemes);
      }
    } catch (error) {
      console.error('Error fetching AI schemes:', error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-24 sm:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Government Schemes Finder</h1>
              <p className="text-xs sm:text-sm text-green-100 mt-1 line-clamp-2">
                Discover schemes & subsidies you're eligible for
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your State
              </label>
              <CustomSelect
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                placeholder="Select State"
                options={STATES}
              />
            </div>

            {/* Crop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Crop
              </label>
              <CustomSelect
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                required
                placeholder="Select Crop"
                options={CROPS}
              />
            </div>

            {/* Farm Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Size (acres)
              </label>
              <input
                type="number"
                name="farmSize"
                value={formData.farmSize}
                onChange={handleInputChange}
                required
                step="0.1"
                min="0.1"
                placeholder="Enter farm size"
                className="w-full px-4 py-[12.5px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farmer Category
              </label>
              <CustomSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                placeholder="Select Category"
                options={FARMER_CATEGORIES}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 sm:py-3.5 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  Find Schemes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div className="space-y-6 sm:space-y-8">
            {/* Static Schemes */}
            {schemes.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  Available Schemes ({schemes.length})
                </h2>
                <div className="grid gap-4 sm:gap-6">
                  {schemes.map(scheme => (
                    <SchemeCard key={scheme.id} scheme={scheme} />
                  ))}
                </div>
              </div>
            )}

            {/* AI Schemes */}
            {aiSchemes.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  Recent Schemes (AI Detected)
                </h2>
                <div className="grid gap-4 sm:gap-6">
                  {aiSchemes.map((scheme, idx) => (
                    <SchemeCard key={`ai-${idx}`} scheme={scheme} isAI />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {schemes.length === 0 && aiSchemes.length === 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Schemes Found</h3>
                <p className="text-sm sm:text-base text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SchemeCard({ scheme, isAI = false }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 flex-1 line-clamp-2">
                {scheme.name}
              </h3>
              {isAI && (
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  NEW
                </span>
              )}
            </div>
            <span className="inline-block px-2 sm:px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {scheme.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 sm:line-clamp-none">
          {scheme.description}
        </p>

        {/* Benefits */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-xs font-medium text-green-700 mb-1">Benefits:</p>
          <p className="text-sm sm:text-base font-semibold text-green-900">{scheme.benefits}</p>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="space-y-4 mb-4">
            {/* Eligibility */}
            {scheme.eligibility && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Eligibility
                </h4>
                <ul className="space-y-1">
                  {scheme.eligibility.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-600 pl-6 relative before:content-['•'] before:absolute before:left-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* How to Apply */}
            {scheme.howToApply && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">How to Apply</h4>
                <ol className="space-y-1.5">
                  {scheme.howToApply.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-600 pl-6 relative">
                      <span className="absolute left-0 font-semibold text-green-600">{idx + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {expanded ? 'Show Less' : 'View Details'}
          </button>
          {scheme.link && (
            <a
              href={scheme.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              Apply Online
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
