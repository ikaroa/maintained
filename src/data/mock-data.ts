// Mock data for MAINTAINED property maintenance app

export interface MaintenanceReport {
  id: string;
  title: string;
  date: string;
  type: "Preventive" | "Corrective" | "Emergency" | "Inspection";
  status: "Completed" | "In Progress" | "Scheduled" | "Pending";
  engineer: string;
  cost: number;
  summary: string;
}

export interface Property {
  id: string;
  name: string;
  unit: string;
  image: string;
  status: "Active" | "Pending" | "Inactive";
  score: number;
  type: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lastInspection: string;
  nextService: string;
  reports: MaintenanceReport[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  priceRange: string;
  estimatedDuration: string;
}

export interface Reward {
  id: string;
  name: string;
  points: number;
  description: string;
  available: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "booking" | "reward" | "property" | "system";
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  propertyId: string;
  propertyName: string;
  date: string;
  timeSlot: string;
  status: "Scheduled" | "In Progress" | "Completed";
  cost: number;
  engineer: string;
}

export interface User {
  name: string;
  email: string;
  points: number;
  tier: string;
}

export const mockUser: User = {
  name: "Ahmed Al Rashid",
  email: "ahmed@maintained.ae",
  points: 1240,
  tier: "Gold",
};

export const mockProperties: Property[] = [
  {
    id: "prop-1",
    name: "Marina Heights Tower",
    unit: "Unit 2405",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    status: "Active",
    score: 87,
    type: "Apartment",
    area: "Dubai Marina",
    bedrooms: 2,
    bathrooms: 3,
    sqft: 1450,
    lastInspection: "2026-03-15",
    nextService: "2026-04-28",
    reports: [
      {
        id: "rpt-101",
        title: "Quarterly AC Maintenance",
        date: "2026-03-15",
        type: "Preventive",
        status: "Completed",
        engineer: "Imran Syed",
        cost: 350,
        summary:
          "Cleaned all AC filters and coils across 3 units. Refrigerant levels optimal. Thermostat calibration adjusted for summer efficiency.",
      },
      {
        id: "rpt-102",
        title: "Kitchen Sink Leak Repair",
        date: "2026-02-20",
        type: "Corrective",
        status: "Completed",
        engineer: "Raj Patel",
        cost: 220,
        summary:
          "Replaced worn gasket under kitchen sink and tightened supply line fittings. Tested for 24 hours with no recurrence.",
      },
      {
        id: "rpt-103",
        title: "Annual Electrical Inspection",
        date: "2026-01-10",
        type: "Inspection",
        status: "Completed",
        engineer: "Faisal Khan",
        cost: 500,
        summary:
          "Full electrical panel inspection. All breakers tested and functional. Replaced two aging GFCI outlets in bathrooms. Wiring compliant with DEWA standards.",
      },
    ],
  },
  {
    id: "prop-2",
    name: "Boulevard Point",
    unit: "Unit 1803",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    status: "Active",
    score: 74,
    type: "Apartment",
    area: "Downtown Dubai",
    bedrooms: 3,
    bathrooms: 4,
    sqft: 2100,
    lastInspection: "2026-02-28",
    nextService: "2026-04-20",
    reports: [
      {
        id: "rpt-201",
        title: "Water Heater Replacement",
        date: "2026-02-28",
        type: "Corrective",
        status: "Completed",
        engineer: "Imran Syed",
        cost: 1800,
        summary:
          "Replaced 80L water heater unit showing corrosion. Installed new Ariston model with 5-year warranty. Pressure tested all connections.",
      },
      {
        id: "rpt-202",
        title: "Balcony Waterproofing",
        date: "2026-01-15",
        type: "Preventive",
        status: "Completed",
        engineer: "Mohammed Tariq",
        cost: 950,
        summary:
          "Applied two-coat polyurethane waterproof membrane to main balcony. Sealed all expansion joints and drainage channels.",
      },
      {
        id: "rpt-203",
        title: "Emergency Pipe Burst",
        date: "2025-12-05",
        type: "Emergency",
        status: "Completed",
        engineer: "Raj Patel",
        cost: 650,
        summary:
          "Emergency callout for burst pipe behind master bathroom wall. Isolated supply, repaired section with CPVC fitting. Drywall patch required follow-up.",
      },
      {
        id: "rpt-204",
        title: "Smart Lock Installation",
        date: "2025-11-20",
        type: "Corrective",
        status: "Completed",
        engineer: "Faisal Khan",
        cost: 1200,
        summary:
          "Installed Yale Assure smart lock on main entry. Configured Bluetooth and Wi-Fi bridge. Programmed 4 user codes and connected to property management app.",
      },
    ],
  },
];

export const mockServices: Service[] = [
  {
    id: "svc-1",
    name: "AC Maintenance",
    description:
      "Complete AC servicing including filter cleaning, coil wash, gas top-up, and thermostat calibration for optimal cooling.",
    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
    priceRange: "AED 150-350",
    estimatedDuration: "1-2 hours",
  },
  {
    id: "svc-2",
    name: "Plumbing Repair",
    description:
      "Fix leaks, unclog drains, repair or replace fixtures, and address water pressure issues throughout your property.",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    priceRange: "AED 200-800",
    estimatedDuration: "1-3 hours",
  },
  {
    id: "svc-3",
    name: "Electrical Work",
    description:
      "Panel inspections, outlet repairs, light fixture installation, and full wiring assessments to DEWA standards.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    priceRange: "AED 250-1,200",
    estimatedDuration: "2-4 hours",
  },
  {
    id: "svc-4",
    name: "Painting & Touch-up",
    description:
      "Interior and exterior painting, wall patching, accent walls, and full apartment repaints with premium finishes.",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    priceRange: "AED 500-3,000",
    estimatedDuration: "4-8 hours",
  },
  {
    id: "svc-5",
    name: "Deep Cleaning",
    description:
      "Professional deep cleaning for kitchens, bathrooms, carpets, and upholstery using industrial-grade equipment.",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    priceRange: "AED 300-1,500",
    estimatedDuration: "3-6 hours",
  },
  {
    id: "svc-6",
    name: "Pest Control",
    description:
      "Comprehensive pest treatment for cockroaches, ants, rodents, and bed bugs with municipality-approved products.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    priceRange: "AED 200-600",
    estimatedDuration: "1-2 hours",
  },
  {
    id: "svc-7",
    name: "Annual Inspection",
    description:
      "Full property health assessment covering structural, mechanical, electrical, and plumbing systems with detailed report.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    priceRange: "AED 800-2,000",
    estimatedDuration: "4-6 hours",
  },
  {
    id: "svc-8",
    name: "Handyman Services",
    description:
      "General fixes including door repairs, furniture assembly, shelf mounting, curtain rod installation, and minor carpentry.",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    priceRange: "AED 150-500",
    estimatedDuration: "1-3 hours",
  },
];

export const mockRewards: Reward[] = [
  {
    id: "rwd-1",
    name: "Free AC Service",
    points: 500,
    description:
      "Redeem for a complimentary AC maintenance session for one unit, including filter cleaning and gas check.",
    available: true,
  },
  {
    id: "rwd-2",
    name: "20% Off Annual Inspection",
    points: 300,
    description:
      "Get 20% discount on a full property annual inspection with detailed report.",
    available: true,
  },
  {
    id: "rwd-3",
    name: "Priority Scheduling",
    points: 200,
    description:
      "Jump the queue with priority booking for your next service — guaranteed same-day slot.",
    available: true,
  },
  {
    id: "rwd-4",
    name: "Free Deep Cleaning",
    points: 800,
    description:
      "Full deep cleaning service for a 2-bedroom apartment including kitchen and all bathrooms.",
    available: true,
  },
  {
    id: "rwd-5",
    name: "AED 100 Service Credit",
    points: 400,
    description:
      "AED 100 credit applied to your next service booking. Valid for any maintenance service.",
    available: true,
  },
  {
    id: "rwd-6",
    name: "Smart Home Starter Kit",
    points: 1500,
    description:
      "Wi-Fi smart plug, motion sensor, and temperature monitor — installed by our engineer.",
    available: false,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Service Confirmed",
    message:
      "Your AC maintenance for Marina Heights Tower (Unit 2405) is confirmed for April 28 at 10:00 AM.",
    date: "2026-04-12",
    read: false,
    type: "booking",
  },
  {
    id: "notif-2",
    title: "Points Earned",
    message:
      "You earned 50 points for your recent plumbing repair at Boulevard Point. Keep it up!",
    date: "2026-04-10",
    read: false,
    type: "reward",
  },
  {
    id: "notif-3",
    title: "Inspection Due Soon",
    message:
      "Boulevard Point (Unit 1803) is due for its next service on April 20. Book now to stay on schedule.",
    date: "2026-04-08",
    read: true,
    type: "property",
  },
  {
    id: "notif-4",
    title: "New Reward Available",
    message:
      "You have enough points to redeem a Free AC Service (500 pts). Check the Rewards section!",
    date: "2026-04-05",
    read: true,
    type: "reward",
  },
  {
    id: "notif-5",
    title: "Summer Maintenance Tips",
    message:
      "Dubai summer is approaching. Read our guide on preparing your AC and plumbing for peak season.",
    date: "2026-04-01",
    read: true,
    type: "system",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "bk-1",
    serviceId: "svc-1",
    serviceName: "AC Maintenance",
    propertyId: "prop-1",
    propertyName: "Marina Heights Tower — Unit 2405",
    date: "2026-04-28",
    timeSlot: "10:00 AM - 12:00 PM",
    status: "Scheduled",
    cost: 280,
    engineer: "Imran Syed",
  },
  {
    id: "bk-2",
    serviceId: "svc-2",
    serviceName: "Plumbing Repair",
    propertyId: "prop-2",
    propertyName: "Boulevard Point — Unit 1803",
    date: "2026-04-10",
    timeSlot: "2:00 PM - 4:00 PM",
    status: "Completed",
    cost: 420,
    engineer: "Raj Patel",
  },
];
