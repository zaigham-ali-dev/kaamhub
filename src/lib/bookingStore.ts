import { BookingData, ReviewData, BookingStatus, PaymentStatus } from "./types";
import { MOCK_PROVIDERS, MOCK_SERVICES } from "./mockData";

// Global in-memory storage preserved across hot reloads in dev
const globalForBookings = globalThis as typeof globalThis & {
  __kaamhub_bookings?: BookingData[];
  __kaamhub_reviews?: ReviewData[];
};

const INITIAL_BOOKINGS: BookingData[] = [
  {
    id: "bk_demo_1",
    customerId: "usr_cust_1",
    providerId: "prof_1",
    serviceId: "srv_1",
    date: "2026-10-05",
    startTime: "11:00 AM",
    address: "House 45, Street 12, Phase 6 DHA, Karachi",
    notes: "Please bring ladder and chemical wash kit for 2 inverter split units.",
    price: 2500,
    status: "ACCEPTED",
    paymentStatus: "PAID",
    paymentMethod: "ONLINE",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    customer: {
      id: "usr_cust_1",
      name: "Fatima Ali",
      email: "customer@kaamhub.com",
      phone: "+92 321 9876543",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      location: "Karachi",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    },
    service: MOCK_SERVICES[0],
    provider: MOCK_PROVIDERS[0],
  },
  {
    id: "bk_demo_2",
    customerId: "usr_cust_1",
    providerId: "prof_2",
    serviceId: "srv_3",
    date: "2026-10-08",
    startTime: "02:00 PM",
    address: "Apartment 4B, Clifton Block 4, Karachi",
    notes: "3 bedroom apartment post-renovation cleanup.",
    price: 9500,
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: "CASH",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    customer: {
      id: "usr_cust_1",
      name: "Fatima Ali",
      email: "customer@kaamhub.com",
      phone: "+92 321 9876543",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      location: "Karachi",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    },
    service: MOCK_SERVICES[2],
    provider: MOCK_PROVIDERS[1],
  },
  {
    id: "bk_demo_3",
    customerId: "usr_cust_1",
    providerId: "prof_3",
    serviceId: "srv_5",
    date: "2026-10-10",
    startTime: "04:30 PM",
    address: "House 12-A, Gulberg III, Lahore",
    notes: "Main breaker tripping on heavy load.",
    price: 3500,
    status: "IN_PROGRESS",
    paymentStatus: "PAID",
    paymentMethod: "JAZZCASH",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    customer: {
      id: "usr_cust_1",
      name: "Fatima Ali",
      email: "customer@kaamhub.com",
      phone: "+92 321 9876543",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      location: "Karachi",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    },
    service: MOCK_SERVICES[4],
    provider: MOCK_PROVIDERS[2],
  },
  {
    id: "bk_demo_4",
    customerId: "usr_cust_1",
    providerId: "prof_1",
    serviceId: "srv_2",
    date: "2026-09-28",
    startTime: "10:00 AM",
    address: "Sector F-7/2, Islamabad",
    notes: "R410A gas top-up with cooling test.",
    price: 4500,
    status: "COMPLETED",
    paymentStatus: "PAID",
    paymentMethod: "ONLINE",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    customer: {
      id: "usr_cust_1",
      name: "Fatima Ali",
      email: "customer@kaamhub.com",
      phone: "+92 321 9876543",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      location: "Karachi",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    },
    service: MOCK_SERVICES[1],
    provider: MOCK_PROVIDERS[0],
  },
];

if (!globalForBookings.__kaamhub_bookings) {
  globalForBookings.__kaamhub_bookings = [...INITIAL_BOOKINGS];
}

if (!globalForBookings.__kaamhub_reviews) {
  globalForBookings.__kaamhub_reviews = [
    {
      id: "rev_1",
      bookingId: "bk_demo_4",
      customerId: "usr_cust_1",
      providerId: "prof_1",
      rating: 5,
      comment: "Tariq bhai arrived right on time in Clifton. Very polite, thorough chemical wash, and our AC is cooling like brand new!",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];
}

export function getAllInMemoryBookings(filter?: {
  status?: string;
  customerId?: string;
  providerId?: string;
  role?: string;
}): BookingData[] {
  let list = globalForBookings.__kaamhub_bookings || [];

  if (filter?.status && filter.status !== "ALL") {
    list = list.filter((b) => b.status === filter.status);
  }

  // Filter by user/provider role to ensure authentic personal dashboard
  if (filter?.role === "PROVIDER" || filter?.providerId) {
    const provId = filter.providerId;
    if (provId) {
      list = list.filter((b) => b.providerId === provId || b.provider?.userId === provId);
    }
  } else if (filter?.customerId) {
    list = list.filter((b) => b.customerId === filter.customerId);
  }

  // Attach reviews if any
  const reviews = globalForBookings.__kaamhub_reviews || [];
  return list.map((b) => {
    const rev = reviews.find((r) => r.bookingId === b.id);
    return {
      ...b,
      review: rev || b.review || null,
    };
  });
}

export function getInMemoryBookingById(id: string): BookingData | undefined {
  const b = globalForBookings.__kaamhub_bookings?.find((item) => item.id === id);
  if (!b) return undefined;
  const rev = globalForBookings.__kaamhub_reviews?.find((r) => r.bookingId === b.id);
  return { ...b, review: rev || b.review || null };
}

export function addInMemoryBooking(newBooking: BookingData): BookingData {
  if (!globalForBookings.__kaamhub_bookings) {
    globalForBookings.__kaamhub_bookings = [];
  }
  globalForBookings.__kaamhub_bookings.unshift(newBooking);
  return newBooking;
}

export function deleteInMemoryBooking(id: string): boolean {
  if (!globalForBookings.__kaamhub_bookings) return false;
  const initialLength = globalForBookings.__kaamhub_bookings.length;
  globalForBookings.__kaamhub_bookings = globalForBookings.__kaamhub_bookings.filter((b) => b.id !== id);
  return globalForBookings.__kaamhub_bookings.length < initialLength;
}

export function updateInMemoryBookingStatus(id: string, status?: BookingStatus, paymentStatus?: PaymentStatus): BookingData | null {
  if (!globalForBookings.__kaamhub_bookings) return null;
  const index = globalForBookings.__kaamhub_bookings.findIndex((b) => b.id === id);
  if (index === -1) {
    return null;
  }

  const existing = globalForBookings.__kaamhub_bookings[index];
  const updated: BookingData = {
    ...existing,
    status: status ? status : existing.status,
    paymentStatus: paymentStatus ? paymentStatus : existing.paymentStatus,
  };

  globalForBookings.__kaamhub_bookings[index] = updated;
  return updated;
}

export function addInMemoryReview(review: ReviewData): ReviewData {
  if (!globalForBookings.__kaamhub_reviews) {
    globalForBookings.__kaamhub_reviews = [];
  }
  globalForBookings.__kaamhub_reviews.unshift(review);

  // Also update booking review pointer
  if (globalForBookings.__kaamhub_bookings) {
    const b = globalForBookings.__kaamhub_bookings.find((item) => item.id === review.bookingId);
    if (b) {
      b.review = review;
    }
  }

  return review;
}

export function getAllInMemoryReviews(providerId?: string): ReviewData[] {
  const list = globalForBookings.__kaamhub_reviews || [];
  if (providerId) {
    return list.filter((r) => r.providerId === providerId);
  }
  return list;
}
