import { ConversationData, MessageData, SafeUser } from "./types";
import { MOCK_PROVIDERS, MOCK_SERVICES, MOCK_USERS } from "./mockData";

// Global in-memory storage preserved across hot reloads in dev
const globalForChat = globalThis as typeof globalThis & {
  __kaamhub_conversations?: ConversationData[];
  __kaamhub_messages?: Record<string, MessageData[]>;
};

const DEFAULT_CUSTOMER: SafeUser = {
  id: "usr_cust_1",
  name: "Ahmed Raza",
  email: "customer@kaamhub.com",
  phone: "+92 321 9876543",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
  location: "Karachi",
  role: "CUSTOMER",
  createdAt: new Date().toISOString(),
};

const INITIAL_CONVERSATIONS: ConversationData[] = [
  {
    id: "conv_demo_1",
    customerId: "usr_cust_1",
    providerId: "prof_1",
    serviceId: "srv_1",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: DEFAULT_CUSTOMER,
    provider: MOCK_PROVIDERS[0],
    service: MOCK_SERVICES[0],
    unreadCount: 0,
    lastMessage: {
      id: "msg_1_2",
      conversationId: "conv_demo_1",
      senderId: "usr_prov_1",
      content: "Walaikum Assalam! Yes, our team will arrive around 11:00 AM with all equipment & chemical kit.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  },
  {
    id: "conv_demo_2",
    customerId: "usr_cust_2",
    providerId: "prof_1",
    serviceId: "srv_2",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      id: "usr_cust_2",
      name: "Sara Malik",
      email: "sara.malik@gmail.com",
      phone: "+92 333 4567890",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      location: "Karachi",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    },
    provider: MOCK_PROVIDERS[0],
    service: MOCK_SERVICES[1],
    unreadCount: 0,
    lastMessage: {
      id: "msg_2_2",
      conversationId: "conv_demo_2",
      senderId: "usr_prov_1",
      content: "Yes, our team will bring genuine Honeywell gas gauges and vacuum pump for complete pressure test.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  },
  {
    id: "conv_demo_3",
    customerId: "usr_cust_1",
    providerId: "prof_2",
    serviceId: "srv_3",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    customer: DEFAULT_CUSTOMER,
    provider: MOCK_PROVIDERS[1],
    service: MOCK_SERVICES[2],
    unreadCount: 0,
    lastMessage: {
      id: "msg_3_2",
      conversationId: "conv_demo_3",
      senderId: "usr_prov_2",
      content: "Cleaning team of 3 specialists has been scheduled for Friday 10:00 AM with imported sanitizers.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  },
  {
    id: "conv_demo_4",
    customerId: "usr_cust_1",
    providerId: "prof_3",
    serviceId: "srv_5",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    customer: DEFAULT_CUSTOMER,
    provider: MOCK_PROVIDERS[2],
    service: MOCK_SERVICES[4],
    unreadCount: 0,
    lastMessage: {
      id: "msg_4_2",
      conversationId: "conv_demo_4",
      senderId: "usr_prov_3",
      content: "Assalam o Alaikum! Please keep the main breaker area accessible, I will bring digital multimeter and testing gear.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  },
];

const INITIAL_MESSAGES: Record<string, MessageData[]> = {
  conv_demo_1: [
    {
      id: "msg_1_1",
      conversationId: "conv_demo_1",
      senderId: "usr_cust_1",
      content: "Assalam o Alaikum! I have booked your AC chemical service for tomorrow morning.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      sender: DEFAULT_CUSTOMER,
    },
    {
      id: "msg_1_2",
      conversationId: "conv_demo_1",
      senderId: "usr_prov_1",
      content: "Walaikum Assalam! Yes, our team will arrive around 11:00 AM with all equipment & chemical kit.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      sender: {
        id: "usr_prov_1",
        name: "Tariq Mehmood (AC Master)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        role: "PROVIDER",
        email: "tariq.ac@kaamhub.com",
        location: "Karachi",
        createdAt: new Date().toISOString(),
      },
    },
  ],
  conv_demo_2: [
    {
      id: "msg_2_1",
      conversationId: "conv_demo_2",
      senderId: "usr_cust_2",
      content: "Hello Tariq, can you also test for micro-leaks before filling R410A gas?",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      sender: {
        id: "usr_cust_2",
        name: "Sara Malik",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        role: "CUSTOMER",
        email: "sara.malik@gmail.com",
        location: "Karachi",
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: "msg_2_2",
      conversationId: "conv_demo_2",
      senderId: "usr_prov_1",
      content: "Yes, our team will bring genuine Honeywell gas gauges and vacuum pump for complete pressure test.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      sender: {
        id: "usr_prov_1",
        name: "Tariq Mehmood (AC Master)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        role: "PROVIDER",
        email: "tariq.ac@kaamhub.com",
        location: "Karachi",
        createdAt: new Date().toISOString(),
      },
    },
  ],
  conv_demo_3: [
    {
      id: "msg_3_1",
      conversationId: "conv_demo_3",
      senderId: "usr_cust_1",
      content: "Hi Zainab, we need a complete 3-bedroom deep cleaning this Friday.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      sender: DEFAULT_CUSTOMER,
    },
    {
      id: "msg_3_2",
      conversationId: "conv_demo_3",
      senderId: "usr_prov_2",
      content: "Cleaning team of 3 specialists has been scheduled for Friday 10:00 AM with imported sanitizers.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      sender: {
        id: "usr_prov_2",
        name: "Zainab Bibi (Home Cleaners)",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
        role: "PROVIDER",
        email: "zainab.cleaning@kaamhub.com",
        location: "Karachi",
        createdAt: new Date().toISOString(),
      },
    },
  ],
  conv_demo_4: [
    {
      id: "msg_4_1",
      conversationId: "conv_demo_4",
      senderId: "usr_cust_1",
      content: "Salam Ustad Bilal, the main breaker has been tripping when we run the inverter AC.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      sender: DEFAULT_CUSTOMER,
    },
    {
      id: "msg_4_2",
      conversationId: "conv_demo_4",
      senderId: "usr_prov_3",
      content: "Assalam o Alaikum! Please keep the main breaker area accessible, I will bring digital multimeter and testing gear.",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      sender: {
        id: "usr_prov_3",
        name: "Ustad Bilal Khan (Electrician)",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80",
        role: "PROVIDER",
        email: "bilal.electric@kaamhub.com",
        location: "Lahore",
        createdAt: new Date().toISOString(),
      },
    },
  ],
};

function initStore() {
  if (!globalForChat.__kaamhub_conversations) {
    globalForChat.__kaamhub_conversations = [...INITIAL_CONVERSATIONS];
  }
  if (!globalForChat.__kaamhub_messages) {
    globalForChat.__kaamhub_messages = { ...INITIAL_MESSAGES };
  }
}

export function getAllConversations(userId?: string, role?: string): ConversationData[] {
  initStore();
  const convs = globalForChat.__kaamhub_conversations || [];

  if (!userId) return convs;

  if (role === "PROVIDER") {
    // Find provider profile ID for this user ID
    const provProfile = MOCK_PROVIDERS.find((p) => p.userId === userId);
    const provId = provProfile?.id || userId;
    const filtered = convs.filter((c) => c.providerId === provId || c.provider?.userId === userId);
    return filtered.length > 0 ? filtered : convs;
  }

  // Customer or default
  const filtered = convs.filter((c) => c.customerId === userId);
  return filtered.length > 0 ? filtered : convs;
}

export function getConversationById(convId: string): ConversationData | undefined {
  initStore();
  return globalForChat.__kaamhub_conversations?.find((c) => c.id === convId);
}

export function getMessagesByConvId(convId: string): MessageData[] {
  initStore();
  return globalForChat.__kaamhub_messages?.[convId] || [];
}

export function createOrGetConversation(
  customerId: string,
  providerId: string,
  serviceId?: string,
  customerUser?: SafeUser
): ConversationData {
  initStore();
  const convs = globalForChat.__kaamhub_conversations || [];

  const existing = convs.find(
    (c) => c.customerId === customerId && c.providerId === providerId && (!serviceId || c.serviceId === serviceId)
  );

  if (existing) {
    return existing;
  }

  const prov = MOCK_PROVIDERS.find((p) => p.id === providerId);
  const srv = serviceId ? MOCK_SERVICES.find((s) => s.id === serviceId) : null;
  const cust = customerUser || DEFAULT_CUSTOMER;

  const newConv: ConversationData = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    customerId,
    providerId,
    serviceId: serviceId || null,
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    customer: cust,
    provider: prov,
    service: srv,
    unreadCount: 0,
    lastMessage: null,
  };

  convs.unshift(newConv);
  globalForChat.__kaamhub_conversations = convs;
  globalForChat.__kaamhub_messages = globalForChat.__kaamhub_messages || {};
  globalForChat.__kaamhub_messages[newConv.id] = [];

  return newConv;
}

export function addMessageToStore(
  convId: string,
  senderId: string,
  content: string,
  senderUser?: SafeUser
): MessageData {
  initStore();

  const conv = getConversationById(convId);
  const now = new Date().toISOString();

  let sender = senderUser;
  if (!sender) {
    const mockUser = MOCK_USERS.find((u) => u.id === senderId);
    if (mockUser) {
      sender = mockUser;
    } else {
      sender = {
        id: senderId,
        name: "User",
        email: "user@kaamhub.com",
        location: "Pakistan",
        role: senderId.startsWith("usr_prov") ? "PROVIDER" : "CUSTOMER",
        createdAt: now,
      };
    }
  }

  const userMsg: MessageData = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    conversationId: convId,
    senderId,
    content: content.trim(),
    read: true,
    createdAt: now,
    sender,
  };

  if (!globalForChat.__kaamhub_messages) {
    globalForChat.__kaamhub_messages = {};
  }
  if (!globalForChat.__kaamhub_messages[convId]) {
    globalForChat.__kaamhub_messages[convId] = [];
  }

  globalForChat.__kaamhub_messages[convId].push(userMsg);

  // Update conversation lastMessage
  if (conv) {
    conv.lastMessage = userMsg;
    conv.lastMessageAt = now;
  }

  return userMsg;
}

export function editMessageInStore(
  convId: string,
  messageId: string,
  newContent: string
): MessageData | null {
  initStore();

  const msgs = globalForChat.__kaamhub_messages?.[convId];
  if (!msgs) return null;

  const msgIndex = msgs.findIndex((m) => m.id === messageId);
  if (msgIndex === -1) return null;

  msgs[msgIndex] = {
    ...msgs[msgIndex],
    content: newContent.trim(),
  };

  // If this was the last message, update conversation's lastMessage too
  const conv = getConversationById(convId);
  if (conv && conv.lastMessage?.id === messageId) {
    conv.lastMessage = { ...conv.lastMessage, content: newContent.trim() };
  }

  return msgs[msgIndex];
}

export function deleteMessageFromStore(
  convId: string,
  messageId: string
): boolean {
  initStore();

  const msgs = globalForChat.__kaamhub_messages?.[convId];
  if (!msgs) return false;

  const msgIndex = msgs.findIndex((m) => m.id === messageId);
  if (msgIndex === -1) return false;

  msgs.splice(msgIndex, 1);

  // Update conversation's lastMessage if the deleted message was the last one
  const conv = getConversationById(convId);
  if (conv && conv.lastMessage?.id === messageId) {
    conv.lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
  }

  return true;
}
