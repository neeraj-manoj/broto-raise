// Brocamp Training Centers
export const BROCAMP_LOCATIONS = [
  {
    id: 'kochi',
    name: 'Kochi (Headquarters)',
    city: 'Kochi',
    state: 'Kerala',
    address: 'Edathuruthikaran Holdings, 10/450-2, Kundanoor, Maradu, Ernakulam, Kerala 682304',
    features: ['Headquarters', 'Full Facilities', 'Mentorship Hub'],
    isHeadquarters: true,
  },
  {
    id: 'kozhikode',
    name: 'Kozhikode (Calicut)',
    city: 'Kozhikode',
    state: 'Kerala',
    address: 'KINFRA Techno Industrialpark, Calicut University PO, Kakkanchery, Kerala 673635',
    features: ['24/7 Access', 'Community Hub', 'Tech Park'],
    is24x7: true,
  },
  {
    id: 'trivandrum',
    name: 'Trivandrum',
    city: 'Trivandrum',
    state: 'Kerala',
    address: 'Dotspace Business Park, Kazhakkoottam, Thiruvananthapuram, Kerala 695585',
    features: ['Business Park', 'Full Facilities'],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Hustlehub Tech Park, Sector 2, HSR Layout, Bengaluru, Karnataka 560102',
    features: ['Tech Park', 'Metro Access', 'Full Facilities'],
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '4th Floor, 35/4, Desabandhu St, Ramarkovk, Ram Nagar, Coimbatore, Tamil Nadu 641009',
    features: ['Co-working Space', 'Full Facilities'],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Canyon Coworking Space, A4, Chandrasekaran Avenue, 1st Main Rd, Thoraipakkam, Tamil Nadu 600097',
    features: ['Co-working Space', 'Full Facilities'],
  },
] as const

export type LocationId = typeof BROCAMP_LOCATIONS[number]['id']

// Complaint Categories specific to Brocamp
export const COMPLAINT_CATEGORIES = [
  {
    id: 'mentor',
    name: 'Mentor',
    icon: '👨‍�',
    description: 'Issues related to mentorship, guidance, or mentor availability',
    keywords: ['mentor', 'guidance', 'doubt', 'help', 'support', 'teaching', 'explanation', 'session'],
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: '�',
    description: 'Administrative concerns, fees, documentation, or processes',
    keywords: ['admin', 'fee', 'payment', 'isa', 'document', 'certificate', 'process', 'registration'],
  },
  {
    id: 'academic-counsellor',
    name: 'Academic Counsellor',
    icon: '🎓',
    description: 'Academic guidance, course planning, or counsellor-related issues',
    keywords: ['counsellor', 'academic', 'guidance', 'course', 'planning', 'advice', 'career', 'study'],
  },
  {
    id: 'working-hub',
    name: 'Working Hub',
    icon: '🏢',
    description: 'Workspace facilities, internet, equipment, or infrastructure issues',
    keywords: ['workspace', 'wifi', 'internet', 'desk', 'chair', 'ac', 'power', 'facility', 'infrastructure'],
  },
  {
    id: 'peer',
    name: 'Peer',
    icon: '🤝',
    description: 'Peer interactions, collaboration, or community-related concerns',
    keywords: ['peer', 'group', 'community', 'collaboration', 'teammate', 'disturbance', 'behavior'],
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📝',
    description: 'Any other feedback or suggestions',
    keywords: ['other', 'suggestion', 'feedback', 'general', 'miscellaneous'],
  },
] as const

export type CategoryId = typeof COMPLAINT_CATEGORIES[number]['id']

// Complaint Status
export const COMPLAINT_STATUS = {
  NEW: { id: 'new', label: 'New', color: 'blue', icon: '🆕' },
  UNDER_REVIEW: { id: 'under_review', label: 'Under Review', color: 'yellow', icon: '👀' },
  IN_PROGRESS: { id: 'in_progress', label: 'In Progress', color: 'orange', icon: '⚙️' },
  RESOLVED: { id: 'resolved', label: 'Resolved', color: 'green', icon: '✅' },
  CLOSED: { id: 'closed', label: 'Closed', color: 'gray', icon: '🔒' },
  URGENT: { id: 'urgent', label: 'Urgent', color: 'red', icon: '🚨' },
} as const

export type ComplaintStatusId = keyof typeof COMPLAINT_STATUS

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: { id: 'low', label: 'Low', color: 'gray' },
  MEDIUM: { id: 'medium', label: 'Medium', color: 'yellow' },
  HIGH: { id: 'high', label: 'High', color: 'orange' },
  URGENT: { id: 'urgent', label: 'Urgent', color: 'red' },
} as const

export type PriorityId = keyof typeof PRIORITY_LEVELS

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// App Configuration
export const APP_CONFIG = {
  name: 'BrotoRaise',
  tagline: 'Your Voice, Brocamp\'s Commitment. Transparent. Fast. Impactful.',
  description: 'Complaint Management System for Brocamp Students',
  supportEmail: 'ceo@brototype.com',
  website: 'https://brototype.com',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf', 'audio/mpeg', 'audio/wav'],
  complaintsPerPage: 20,
  enableAnonymous: true,
  enableUpvoting: true,
  enableComments: true,
}

// Sentiment Analysis Thresholds
export const SENTIMENT_CONFIG = {
  urgentThreshold: 0.7, // If negative sentiment > 0.7, mark as urgent
  keywords: {
    urgent: ['urgent', 'emergency', 'immediate', 'asap', 'critical', 'broken', 'not working', 'severe'],
    negative: ['bad', 'terrible', 'awful', 'worst', 'disappointed', 'frustrated', 'angry', 'unhappy'],
  },
}

// Chart Configuration
export const CHART_CONFIG = {
  defaultHeight: 300,
  compactHeight: 280,
  pieOuterRadius: 70,
  xAxisAngle: -45,
  xAxisHeight: 100,
  lineStrokeWidth: 2,
  barMaxBarSize: 60,
  margins: {
    default: { left: -20, right: 10, top: 5, bottom: 5 },
    withLabels: { left: 0, right: 10, top: 5, bottom: 60 },
  },
} as const

// AI Model Configuration
export const AI_CONFIG = {
  temperature: {
    default: 0.7,           // Balanced creativity and consistency
    creative: 0.8,          // Higher creativity for varied responses
    creative_high: 0.9,     // Very high creativity for question generation
    consistent: 0.3,        // Lower temperature for classification tasks
  },
  maxTokens: {
    default: 500,
    extended: 1000,
  },
  retryAttempts: 3,
  timeoutMs: 30000,
} as const
