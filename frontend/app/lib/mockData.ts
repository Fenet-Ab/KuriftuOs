// Central mock data for KuriftuOS — all ETB pricing, Ethiopian context

export const mockRoomCategories = [
  { id: 1, name: "Standard", available_rooms: 5, price_per_night: 4500, total_rooms: 20, emoji: "🏠", features: ["Free Wi-Fi", "Garden View", "Air Conditioning"] },
  { id: 2, name: "Deluxe", available_rooms: 3, price_per_night: 8500, total_rooms: 15, emoji: "⭐", features: ["Lake View", "Mini Bar", "Premium Bedding", "Free Wi-Fi"] },
  { id: 3, name: "Suite", available_rooms: 2, price_per_night: 15000, total_rooms: 8, emoji: "🏰", features: ["Panoramic View", "Private Lounge", "Butler Service", "Jacuzzi"] },
  { id: 4, name: "Villa", available_rooms: 1, price_per_night: 25000, total_rooms: 4, emoji: "🌿", features: ["Private Pool", "Full Kitchen", "Outdoor Deck", "Dedicated Staff"] },
];

export const mockStaff = [
  { id: 1, name: "Abebe Bikila", role: "staff", email: "abebe@kuriftu.com", department: "Housekeeping", location: "Bishoftu" },
  { id: 2, name: "Sara Girma", role: "staff", email: "sara@kuriftu.com", department: "F&B", location: "Entoto" },
  { id: 3, name: "Dawit Kebede", role: "staff", email: "dawit@kuriftu.com", department: "Security", location: "Bishoftu" },
  { id: 4, name: "Hiwot Tadesse", role: "staff", email: "hiwot@kuriftu.com", department: "Reception", location: "Lake Tana" },
  { id: 5, name: "Yonas Alemu", role: "staff", email: "yonas@kuriftu.com", department: "Maintenance", location: "Awash" },
  { id: 6, name: "Tigist Bekele", role: "staff", email: "tigist@kuriftu.com", department: "Spa", location: "Entoto" },
  { id: 7, name: "Fekadu Haile", role: "staff", email: "fekadu@kuriftu.com", department: "Housekeeping", location: "Bishoftu" },
  { id: 8, name: "Meron Desta", role: "staff", email: "meron@kuriftu.com", department: "F&B", location: "Lake Tana" },
];

export const initialTasks = [
  {
    id: 1, category: "Housekeeping", description: "Deliver fresh towels to Room 302",
    priority: "high", status: "new", assigned_to: null,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 2, category: "Maintenance", description: "Fix air conditioning in Suite 102",
    priority: "urgent", status: "in_progress", assigned_to: 5,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 3, category: "F&B", description: "Room service order for Villa 7 — Ethiopian breakfast",
    priority: "normal", status: "new", assigned_to: null,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 4, category: "Housekeeping", description: "Deep clean Deluxe Room 215 before guest arrival",
    priority: "high", status: "completed", assigned_to: 1,
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    resolved_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 5, category: "Concierge", description: "Arrange airport pickup for Alemayehu family — 3:30 PM",
    priority: "normal", status: "new", assigned_to: null,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 6, category: "Security", description: "Patrol pool area — late evening shift",
    priority: "low", status: "new", assigned_to: 3,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 7, category: "Spa", description: "Prepare couple's spa room for 5:00 PM booking",
    priority: "high", status: "in_progress", assigned_to: 6,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
];

export const mockBookings = [
  {
    id: 1, room_type: "Suite", check_in: "2026-04-15T14:00", check_out: "2026-04-18T11:00",
    status: "confirmed", location: "Bishoftu", total_price: 45000,
  },
  {
    id: 2, room_type: "Deluxe", check_in: "2026-04-20T14:00", check_out: "2026-04-22T11:00",
    status: "pending", location: "Entoto", total_price: 17000,
  },
];

export const mockAnalytics = {
  activeBookings: 122,
  pendingApprovals: 4,
  guestFeedback: 4.8,
  activeStaff: 38,
  totalStaff: 47,
  activeGuests: 184,
  dailyRevenue: 287500,
  taskCompletionRate: 87,
  activeTasksCount: initialTasks.filter(t => ["new", "in_progress"].includes(t.status)).length,
  completedTasksCount: initialTasks.filter(t => t.status === "completed").length,
};

export const mockArrivals = [
  { name: "Alemayehu Tadesse", room: "Suite 405", guests: 2, time: "10:30 AM", location: "Bishoftu" },
  { name: "Mekdes Haile", room: "Villa 12", guests: 4, time: "11:15 AM", location: "Entoto" },
  { name: "Solomon Girma", room: "Deluxe 202", guests: 1, time: "01:00 PM", location: "Bishoftu" },
  { name: "Hana Bekele", room: "Standard 118", guests: 3, time: "03:30 PM", location: "Lake Tana" },
];

export const mockRecentLogins = [
  { name: "Abebe Bikila", role: "Manager", location: "Bishoftu", time: "09:12 AM" },
  { name: "Sara Girma", role: "Staff", location: "Entoto", time: "09:05 AM" },
  { name: "Dawit Kebede", role: "Admin", location: "Head Office", time: "08:45 AM" },
  { name: "Hiwot Tadesse", role: "Staff", location: "Lake Tana", time: "08:30 AM" },
  { name: "Tigist Bekele", role: "Staff", location: "Entoto", time: "08:15 AM" },
];

// RevSense
export const mockPricingRecommendations = [
  {
    id: 1, category: "Standard", currentRate: 4500, suggestedRate: 6200,
    change: 37.8, confidence: "HIGH" as const,
    reason: "Fasika weekend approaching — +42% search velocity in last 24h",
  },
  {
    id: 2, category: "Deluxe", currentRate: 8500, suggestedRate: 11200,
    change: 31.8, confidence: "HIGH" as const,
    reason: "Timkat festival historically drives 35% occupancy spike at Bishoftu",
  },
  {
    id: 3, category: "Suite", currentRate: 15000, suggestedRate: 18500,
    change: 23.3, confidence: "MEDIUM" as const,
    reason: "Corporate conference at Millennium Hall 12–14 Apr increases demand",
  },
  {
    id: 4, category: "Villa", currentRate: 25000, suggestedRate: 28000,
    change: 12.0, confidence: "LOW" as const,
    reason: "Low booking velocity — slight premium recommended for exclusivity positioning",
  },
];

export const mockHolidayAlerts = [
  {
    holiday: "Fasika (Ethiopian Easter)",
    date: "Apr 19, 2026",
    demand: "+38%",
    urgency: "HIGH",
    message: "Lake-view suites trending +38% demand — accept rate adjustments now",
  },
  {
    holiday: "Timkat (Epiphany)",
    date: "Apr 7, 2026",
    demand: "+25%",
    urgency: "MEDIUM",
    message: "Bishoftu location typically sees full occupancy on Timkat weekend",
  },
  {
    holiday: "Enkutatash (Ethiopian New Year)",
    date: "Sep 11, 2026",
    demand: "+30%",
    urgency: "LOW",
    message: "Early planning recommended — start marketing campaign in August",
  },
];

export const mockUpsellPackages = [
  { id: 1, name: "Couples Spa Retreat", price: 3500, category: "Wellness", conversions: 12, icon: "💆", description: "2-hour full-body massage + aromatherapy for two" },
  { id: 2, name: "Sunrise Lake Boat Tour", price: 1800, category: "Experience", conversions: 23, icon: "🚣", description: "Private boat tour on Lake Bishoftu at sunrise" },
  { id: 3, name: "Ethiopian Dinner Experience", price: 2200, category: "Dining", conversions: 31, icon: "🍽️", description: "Traditional injera feast with live cultural music" },
  { id: 4, name: "4x4 Safari to Awash NP", price: 6500, category: "Adventure", conversions: 8, icon: "🦁", description: "Full-day guided safari with expert naturalist" },
  { id: 5, name: "Coffee Ceremony & Tasting", price: 950, category: "Culture", conversions: 45, icon: "☕", description: "Authentic Ethiopian coffee ceremony with farm visit" },
  { id: 6, name: "Helicopter Tour (Entoto → Bishoftu)", price: 18000, category: "Luxury", conversions: 3, icon: "🚁", description: "Scenic aerial tour across Kuriftu locations" },
];

export const mockStaffingForecast = [
  { date: "Apr 5", housekeeping: 8, fnb: 6, security: 4, reception: 3 },
  { date: "Apr 6", housekeeping: 9, fnb: 7, security: 4, reception: 3 },
  { date: "Apr 7", housekeeping: 12, fnb: 10, security: 6, reception: 5 }, // Timkat
  { date: "Apr 8", housekeeping: 11, fnb: 9, security: 5, reception: 4 },
  { date: "Apr 9", housekeeping: 8, fnb: 6, security: 4, reception: 3 },
  { date: "Apr 10", housekeeping: 8, fnb: 6, security: 4, reception: 3 },
  { date: "Apr 11", housekeeping: 9, fnb: 7, security: 4, reception: 3 },
  { date: "Apr 12", housekeeping: 10, fnb: 8, security: 5, reception: 4 },
  { date: "Apr 13", housekeeping: 11, fnb: 9, security: 5, reception: 4 },
  { date: "Apr 14", housekeeping: 12, fnb: 10, security: 6, reception: 5 },
  { date: "Apr 15", housekeeping: 14, fnb: 12, security: 7, reception: 6 },
  { date: "Apr 16", housekeeping: 15, fnb: 13, security: 7, reception: 6 },
  { date: "Apr 17", housekeeping: 16, fnb: 14, security: 8, reception: 7 },
  { date: "Apr 18", housekeeping: 18, fnb: 16, security: 9, reception: 8 }, // Fasika weekend
];

export const mockRevenueTrend = [
  { day: "Mar 29", revenue: 187000 },
  { day: "Mar 30", revenue: 205000 },
  { day: "Mar 31", revenue: 198000 },
  { day: "Apr 1", revenue: 223000 },
  { day: "Apr 2", revenue: 241000 },
  { day: "Apr 3", revenue: 267000 },
  { day: "Apr 4", revenue: 287500 },
];

export const mockGuestFeedback = [
  { id: 1, guest: "Mekdes H.", rating: 5, comment: "The coffee ceremony was unforgettable. Selam AI helped me book everything perfectly!", location: "Bishoftu", date: "Apr 3" },
  { id: 2, guest: "John K.", rating: 4, comment: "Beautiful lake view from the suite. Staff was exceptionally attentive.", location: "Lake Tana", date: "Apr 2" },
  { id: 3, guest: "Tigist A.", rating: 5, comment: "The Ethiopian dinner experience is a must-do. Highly recommend the Villa package.", location: "Entoto", date: "Apr 1" },
];
