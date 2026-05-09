export const AFRICAN_COUNTRIES = [
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬' },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', flag: '🇷🇼' },
  { code: 'SN', name: 'Senegal', currency: 'XOF', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroon', currency: 'XAF', flag: '🇨🇲' },
  { code: 'MZ', name: 'Mozambique', currency: 'MZN', flag: '🇲🇿' },
  { code: 'ZM', name: 'Zambia', currency: 'ZMW', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', currency: 'ZWL', flag: '🇿🇼' },
  { code: 'MA', name: 'Morocco', currency: 'MAD', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', currency: 'TND', flag: '🇹🇳' },
  { code: 'AO', name: 'Angola', currency: 'AOA', flag: '🇦🇴' },
];

export const INDUSTRIES = [
  { value: 'fintech', label: 'Fintech & Payments', icon: '💳' },
  { value: 'agritech', label: 'Agritech & Food', icon: '🌾' },
  { value: 'healthtech', label: 'Healthtech', icon: '🏥' },
  { value: 'ecommerce', label: 'E-Commerce & Retail', icon: '🛒' },
  { value: 'logistics', label: 'Logistics & Supply Chain', icon: '🚚' },
  { value: 'edtech', label: 'EdTech & Learning', icon: '📚' },
  { value: 'cleantech', label: 'Cleantech & Energy', icon: '♻️' },
  { value: 'saas', label: 'SaaS & Software', icon: '💻' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'real_estate', label: 'Real Estate & PropTech', icon: '🏠' },
  { value: 'fashion', label: 'Fashion & Beauty', icon: '👗' },
  { value: 'tourism', label: 'Tourism & Hospitality', icon: '✈️' },
  { value: 'consulting', label: 'Consulting & Services', icon: '💼' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'other', label: 'Other', icon: '🔷' },
];

export const GROWTH_STAGES = [
  {
    value: 'IDEA',
    label: 'Idea Stage',
    description: 'Validating concept, pre-revenue',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    value: 'EARLY',
    label: 'Early Stage',
    description: 'First customers, building product-market fit',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'GROWTH',
    label: 'Growth Stage',
    description: 'Scaling operations, increasing revenue',
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'SCALE',
    label: 'Scale Stage',
    description: 'Expanding to new markets',
    color: 'bg-purple-100 text-purple-700',
  },
];

export const CAMPAIGN_TYPES = [
  { value: 'EMAIL', label: 'Email Campaign', icon: '📧' },
  { value: 'SOCIAL', label: 'Social Media', icon: '📱' },
  { value: 'ADS', label: 'Paid Ads', icon: '📢' },
  { value: 'MULTI_CHANNEL', label: 'Multi-Channel', icon: '🔀' },
];

export const SOCIAL_PLATFORMS = [
  { value: 'TWITTER', label: 'X (Twitter)', color: '#1DA1F2' },
  { value: 'FACEBOOK', label: 'Facebook', color: '#1877F2' },
  { value: 'INSTAGRAM', label: 'Instagram', color: '#E1306C' },
  { value: 'LINKEDIN', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'TIKTOK', label: 'TikTok', color: '#010101' },
  { value: 'WHATSAPP', label: 'WhatsApp', color: '#25D366' },
];

export const MARKETING_CHANNELS = [
  'Email Marketing',
  'Social Media',
  'SEO / Content',
  'Paid Ads (Google)',
  'Paid Ads (Meta)',
  'WhatsApp Marketing',
  'SMS Marketing',
  'Influencer Marketing',
  'Community / Events',
  'Referral Programs',
];

export const BUDGET_RANGES = [
  { value: '0-500', label: 'Under $500/mo' },
  { value: '500-2000', label: '$500 – $2,000/mo' },
  { value: '2000-5000', label: '$2,000 – $5,000/mo' },
  { value: '5000-20000', label: '$5,000 – $20,000/mo' },
  { value: '20000+', label: '$20,000+/mo' },
];

export const AFRICAN_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'sw', name: 'Swahili' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'am', name: 'Amharic' },
  { code: 'tw', name: 'Twi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zu', name: 'Zulu' },
  { code: 'af', name: 'Afrikaans' },
];

export const AI_SUGGESTED_PROMPTS = [
  'Generate a social media strategy for my startup this month',
  'Write a 3-email welcome sequence for new customers',
  'What marketing channels work best for fintech in Ghana?',
  'Help me analyze my target market in West Africa',
  'Create ad copy for a Facebook campaign targeting SMEs',
  'What are the top growth hacks for African e-commerce?',
  'Build a content calendar for the next 30 days',
  'How do I use WhatsApp effectively for B2C marketing?',
];
