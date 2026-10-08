export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export type PriceType = "FIXED" | "HOURLY" | "STARTING_FROM";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  location?: string | null;
  createdAt: string | Date;
}

export interface ProviderProfileData {
  id: string;
  userId: string;
  profession: string;
  bio?: string | null;
  experience?: string | null;
  startingPrice?: number | null;
  serviceAreas?: string | null;
  coverImage?: string | null;
  verificationStatus: VerificationStatus;
  rating?: number | null;
  totalReviews?: number | null;
  completedJobs?: number | null;
  cnicNumber?: string | null;
  specialties?: string[];
  toolsEquipment?: string[];
  languages?: string[];
  portfolio?: { id?: string; title: string; description?: string; image: string }[];
  reviews?: any[];
  availability?: { id?: string; dayOfWeek: string; startTime: string; endTime: string; isAvailable?: boolean }[];
  services?: ServiceData[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  user?: SafeUser;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  isActive: boolean;
  serviceCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ServiceData {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceType: PriceType;
  duration?: string | null;
  location: string;
  coverImage?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  provider?: ProviderProfileData;
  category?: CategoryData;
  isFavorited?: boolean;
  images?: { id: string; url: string }[];
}

export interface BookingData {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  address: string;
  notes?: string | null;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  createdAt: string | Date;
  customer?: SafeUser;
  provider?: ProviderProfileData;
  service?: ServiceData;
  review?: ReviewData | null;
}

export interface ReviewData {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  customer?: SafeUser;
}

export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string | Date;
  sender?: SafeUser;
}

export interface ConversationData {
  id: string;
  customerId: string;
  providerId: string;
  serviceId?: string | null;
  lastMessageAt?: string | Date | null;
  createdAt: string | Date;
  customer?: SafeUser;
  provider?: ProviderProfileData;
  service?: ServiceData | null;
  lastMessage?: MessageData | null;
  unreadCount?: number;
}

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  read: boolean;
  createdAt: string | Date;
}
