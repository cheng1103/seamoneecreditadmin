export interface Admin {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'editor';
  avatar?: string;
}

export interface ApplicationAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
}

export interface Application {
  _id: string;
  applicationId: string;
  loanType: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'contacted';
  fullName: string;
  icNumber?: string;
  icNumberMasked?: string;
  phone: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  address?: ApplicationAddress;
  monthlyIncome?: number;
  loanAmount?: number;
  loanTerm?: number;
  loanAmountRange?: string;
  loanPurpose?: string;
  monthlyPayment?: number;
  employmentStatus?: string;
  companyName?: string;
  position?: string;
  yearsEmployed?: number;
  employerPhone?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  marketingConsent?: boolean;
  ctosConsent?: boolean;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  documents?: Array<{
    _id?: string;
    type?: string;
    url?: string;
    uploadedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  processedBy?: {
    name: string;
    email: string;
  };
  notes?: string;
  notifications?: ApplicationNotification[];
  whatsappLink?: string;
}

export interface ApplicationNotification {
  _id?: string;
  type: 'received' | 'status_update' | 'document_reminder' | 'approval' | 'custom';
  channel: 'whatsapp' | 'email' | 'sms';
  sentAt: string;
  sentBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  meta?: Record<string, unknown>;
}

export interface Contact {
  _id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  replyMessage?: string;
  repliedAt?: string;
  repliedBy?: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  _id: string;
  title: { en: string; ms: string };
  slug: string;
  content: { en: string; ms: string };
  excerpt: { en: string; ms: string };
  featuredImage?: { url: string; alt: { en: string; ms: string } };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  author?: { name: string };
  seo?: {
    title?: { en?: string; ms?: string };
    description?: { en?: string; ms?: string };
    keywords?: string[];
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  _id: string;
  question: { en: string; ms: string };
  answer: { en: string; ms: string };
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LocalizedValue = {
  en?: string;
  ms?: string;
};

export interface SiteLocationFaq {
  question?: LocalizedValue;
  answer?: LocalizedValue;
}

export interface SiteLocation {
  slug: string;
  name: LocalizedValue;
  summary: LocalizedValue;
  address: LocalizedValue;
  phone?: string;
  whatsapp?: string;
  email?: string;
  hours?: LocalizedValue;
  mapEmbedUrl?: string;
  geo?: {
    lat?: number;
    lng?: number;
  };
  services?: LocalizedValue[];
  areasServed?: LocalizedValue[];
  faqs?: SiteLocationFaq[];
  ratingSummary?: {
    score?: number;
    count?: number;
  };
}

export interface Testimonial {
  _id: string;
  name: string;
  location?: string;
  avatar?: string;
  rating: number;
  content: { en: string; ms: string };
  loanType?: string;
  occupation?: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: { en: string; ms: string };
  slug: string;
  description: { en: string; ms: string };
  loanAmount: { min: number; max: number };
  interestRate: { min: number; max: number; type: string };
  tenure: { min: number; max: number };
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

export interface DashboardStats {
  total: number;
  pending: number;
  today: number;
  thisMonth: number;
  lastMonth: number;
  growth: string;
}

export interface SiteSettings {
  _id?: string;
  siteName?: string;
  tagline?: LocalizedValue;
  logo?: { light?: string; dark?: string };
  favicon?: string;
  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: LocalizedValue;
    googleMapsUrl?: string;
    geo?: {
      lat?: number;
      lng?: number;
    };
  };
  businessHours?: LocalizedValue;
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  seo?: {
    defaultTitle?: LocalizedValue;
    defaultDescription?: LocalizedValue;
    keywords?: string[];
    aggregateRating?: {
      value?: number;
      count?: number;
    };
    googleVerification?: string;
  };
  legal?: {
    companyName?: string;
    registrationNumber?: string;
    licenseNumber?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
  features?: {
    showWhatsappButton?: boolean;
    showLoanCalculator?: boolean;
    enableBlog?: boolean;
    enableTestimonials?: boolean;
  };
  locations?: SiteLocation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  statusCounts?: Record<string, number>;
}
