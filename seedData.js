require("dotenv").config();
const mongoose = require("mongoose");

const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const RefreshToken = require("../models/RefreshToken");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const { seedDefaultPlans, getPlan } = require("../utils/subscriptionPlans");

const MONGO_URL = process.env.MONGO_URL;
const DEFAULT_PASSWORD = "Demo12345";
const reset = process.argv.includes("--reset");
const fresh = process.argv.includes("--fresh");
const help = process.argv.includes("--help") || process.argv.includes("-h");

const demoEmails = [
  "superadmin@luxestate.test",
  "agency.admin@luxestate.test",
  "agent.one@luxestate.test",
  "agent.two@luxestate.test",
  "ind.agent@luxestate.test",
  "buyer.one@luxestate.test",
  "buyer.two@luxestate.test",
];

// ── Real Unsplash image sets per property category ────────────────────────────
// Each set has 4 images: cover + 3 interior/detail shots
// All URLs use Unsplash's resize API (?w=1200&q=80) for consistent quality

const imageSets = {
  house: [
    [
      // DHA modern family house — Karachi
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      // Bahria Town rental house — Rawalpindi
      {
        url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      // Model Town classic house — Lahore
      {
        url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80",
        isCover: false,
      },
    ],
  ],

  apartment: [
    [
      // Gulberg luxury apartment — Lahore (for rent)
      {
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      // F-10 modern flat — Islamabad (for rent)
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1533779183510-8f55a55f4e4e?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80",
        isCover: false,
      },
    ],
  ],

  villa: [
    [
      // Clifton ultra-luxury villa — Karachi (awaiting review)
      {
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      // DHA Phase 5 resort-style villa — Lahore
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200&q=80",
        isCover: false,
      },
    ],
  ],

  penthouse: [
    [
      // DHA Phase 5 penthouse — Lahore (rejected demo)
      {
        url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      // High-rise penthouse — Islamabad
      {
        url: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
        isCover: false,
      },
    ],
  ],

  plot: [
    [
      // G-11 commercial plot — Islamabad
      {
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      // Faisalabad residential plot
      {
        url: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
        isCover: false,
      },
    ],
  ],

  commercial: [
    [
      // Gulberg commercial space — Lahore
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      // Blue Area office — Islamabad
      {
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
        isCover: false,
      },
    ],
  ],
};

// ── Agent avatar URLs (real portrait-style photos from Unsplash) ───────────────
const agentAvatars = {
  hamzaRaza:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  saraKhan:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  bilalAhmed:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  ayeshaMalik:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
};

const cityCoordinates = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Faisalabad: { lat: 31.4504, lng: 73.135 },
  Multan: { lat: 30.1575, lng: 71.5249 },
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const withPlanSettings = async (scope, slug) => {
  const plan = await getPlan(slug, scope);
  if (scope === "agency") {
    return {
      subscription: { plan: plan.slug, startDate: new Date() },
      settings: {
        maxAgents: plan.maxAgents,
        maxListings: plan.maxListings,
        maxFeaturedListings: plan.maxFeaturedListings,
      },
    };
  }
  return {
    subscription: { plan: plan.slug, status: "active", startDate: new Date() },
    settings: {
      maxListings: plan.maxListings,
      maxFeaturedListings: plan.maxFeaturedListings,
    },
  };
};

async function upsertTenant({
  name,
  email,
  phone,
  plan = "pro",
  status = "active",
}) {
  const planSettings = await withPlanSettings("agency", plan);
  const tenant = await Tenant.findOne({ email });
  if (tenant) {
    tenant.name = name;
    tenant.slug = slugify(name);
    tenant.phone = phone;
    tenant.status = status;
    tenant.subscription = planSettings.subscription;
    tenant.settings = planSettings.settings;
    await tenant.save();
    return tenant;
  }
  return Tenant.create({
    name,
    slug: slugify(name),
    email,
    phone,
    status,
    ...planSettings,
  });
}

async function upsertUser(payload) {
  const user = await User.findOne({ email: payload.email });
  const data = {
    ...payload,
    password: DEFAULT_PASSWORD,
    status: payload.status || "active",
    isVerified: payload.isVerified ?? true,
    lastLogin: payload.lastLogin || new Date(Date.now() - 6 * 60 * 60 * 1000),
  };
  if (user) {
    Object.assign(user, data);
    await user.save();
    return user;
  }
  return User.create(data);
}

function makeProperty(index, overrides, imageSet) {
  const coord = cityCoordinates[overrides.city] || cityCoordinates.Karachi;
  return {
    title: overrides.title,
    description:
      overrides.description ||
      "A polished demo listing with strong photography, useful amenities, and realistic market details for testing the platform workflow.",
    listingType: overrides.listingType || "for_sale",
    category: overrides.category || "house",
    price: overrides.price || 25000000,
    currency: "PKR",
    city: overrides.city || "Karachi",
    area: overrides.area || "DHA Phase 6",
    address:
      overrides.address ||
      `${overrides.area || "DHA Phase 6"}, ${overrides.city || "Karachi"}`,
    coordinates: {
      lat: coord.lat + index * 0.006,
      lng: coord.lng + index * 0.006,
    },
    size: overrides.size ?? 2400,
    beds: overrides.beds ?? 4,
    baths: overrides.baths ?? 4,
    kitchens: overrides.kitchens ?? 1,
    attachedBathrooms:
      overrides.attachedBathrooms ??
      Math.min(overrides.beds ?? 4, overrides.baths ?? 4),
    parking: overrides.parking ?? 2,
    floors: overrides.floors ?? 2,
    yearBuilt: overrides.yearBuilt || 2022,
    images: imageSet,
    amenities: overrides.amenities || [
      "Parking",
      "Security",
      "CCTV",
      "Backup Generator",
      "Garden",
    ],
    views: overrides.views || 0,
    inquiries: overrides.inquiries || 0,
    ...overrides,
  };
}

async function main() {
  if (help) {
    console.log("Usage:");
    console.log("  npm run seed        Create or refresh demo seed data");
    console.log(
      "  npm run seed:reset  Remove old demo seed data first, then recreate it",
    );
    console.log(
      "  npm run seed:fresh  Clear all app collections, then recreate clean demo data",
    );
    console.log("");
    console.log("Demo password for all accounts: Demo12345");
    return;
  }

  if (!MONGO_URL) throw new Error("MONGO_URL is missing in backend .env");

  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");

  if (fresh) {
    await Promise.all([
      RefreshToken.deleteMany({}),
      Availability.deleteMany({}),
      Appointment.deleteMany({}),
      Inquiry.deleteMany({}),
      Property.deleteMany({}),
      User.deleteMany({}),
      Tenant.deleteMany({}),
      SubscriptionPlan.deleteMany({}),
    ]);
    console.log("Fresh mode: cleared all app collections");
  }

  await seedDefaultPlans();
  console.log("Subscription plans synced");

  if (reset) {
    const demoUsers = await User.find({ email: { $in: demoEmails } }).select(
      "_id",
    );
    const demoUserIds = demoUsers.map((u) => u._id);
    await Promise.all([
      Inquiry.deleteMany({
        $or: [
          { buyerId: { $in: demoUserIds } },
          { agentId: { $in: demoUserIds } },
        ],
      }),
      Appointment.deleteMany({
        $or: [
          { buyerId: { $in: demoUserIds } },
          { agentId: { $in: demoUserIds } },
        ],
      }),
      Availability.deleteMany({ agentId: { $in: demoUserIds } }),
      Property.deleteMany({ agentId: { $in: demoUserIds } }),
      User.deleteMany({ email: { $in: demoEmails } }),
      Tenant.deleteMany({ email: { $in: ["hello@demoagency.test"] } }),
    ]);
    console.log("Reset old demo data");
  }

  // ── Tenant ─────────────────────────────────────────────────────────────────
  const agency = await upsertTenant({
    name: "Demo Realty Group",
    email: "hello@demoagency.test",
    phone: "+92-300-1002003",
    plan: "pro",
  });

  const agentPlan = await withPlanSettings("agent", "pro");
  const freeAgentPlan = await withPlanSettings("agent", "free");

  // ── Users ──────────────────────────────────────────────────────────────────
  const [
    superAdmin,
    agencyAdmin,
    agencyAgentOne,
    agencyAgentTwo,
    independentAgent,
    buyerOne,
    buyerTwo,
  ] = await Promise.all([
    upsertUser({
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@luxestate.test",
      phone: "+92-300-0000001",
      role: "super_admin",
      tenantId: null,
    }),
    upsertUser({
      firstName: "Ayesha",
      lastName: "Malik",
      email: "agency.admin@luxestate.test",
      phone: "+92-300-0000002",
      role: "agency_admin",
      tenantId: agency._id,
      avatar: agentAvatars.ayeshaMalik,
    }),
    upsertUser({
      firstName: "Hamza",
      lastName: "Raza",
      email: "agent.one@luxestate.test",
      phone: "+92-300-0000003",
      role: "agent",
      tenantId: agency._id,
      city: "Karachi",
      bio: "Agency specialist for premium residential homes in DHA and Clifton. With 6 years on the ground, I help families find their perfect match.",
      specialties: ["Luxury Homes", "Family Houses", "DHA Properties"],
      languages: ["English", "Urdu"],
      experience: 6,
      responseTime: "< 2 hours",
      avatar: agentAvatars.hamzaRaza,
      ...freeAgentPlan,
    }),
    upsertUser({
      firstName: "Sara",
      lastName: "Khan",
      email: "agent.two@luxestate.test",
      phone: "+92-300-0000004",
      role: "agent",
      tenantId: agency._id,
      city: "Lahore",
      bio: "Focused on rentals and investment apartments across Gulberg and DHA Lahore. I make the rental process seamless for both landlords and tenants.",
      specialties: ["Apartments", "Rentals", "Investment Properties"],
      languages: ["English", "Urdu", "Punjabi"],
      experience: 4,
      responseTime: "< 4 hours",
      avatar: agentAvatars.saraKhan,
      ...freeAgentPlan,
    }),
    upsertUser({
      firstName: "Bilal",
      lastName: "Ahmed",
      email: "ind.agent@luxestate.test",
      phone: "+92-300-0000005",
      role: "agent",
      tenantId: null,
      city: "Islamabad",
      bio: "Independent real estate consultant specialising in Islamabad plots and commercial spaces. 8 years of market expertise, CDA-approved sector knowledge.",
      specialties: ["Plots", "Commercial", "CDA Sectors"],
      languages: ["English", "Urdu"],
      experience: 8,
      responseTime: "< 1 hour",
      avatar: agentAvatars.bilalAhmed,
      ...agentPlan,
    }),
    upsertUser({
      firstName: "Maham",
      lastName: "Ali",
      email: "buyer.one@luxestate.test",
      phone: "+92-300-0000006",
      role: "buyer",
      tenantId: null,
    }),
    upsertUser({
      firstName: "Usman",
      lastName: "Sheikh",
      email: "buyer.two@luxestate.test",
      phone: "+92-300-0000007",
      role: "buyer",
      tenantId: null,
    }),
  ]);

  // ── Clean existing demo properties / interactions ─────────────────────────
  await Promise.all([
    Inquiry.deleteMany({
      $or: [
        {
          agentId: {
            $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id],
          },
        },
        { buyerId: { $in: [buyerOne._id, buyerTwo._id] } },
      ],
    }),
    Appointment.deleteMany({
      $or: [
        {
          agentId: {
            $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id],
          },
        },
        { buyerId: { $in: [buyerOne._id, buyerTwo._id] } },
      ],
    }),
    Availability.deleteMany({
      agentId: {
        $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id],
      },
    }),
    Property.deleteMany({
      agentId: {
        $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id],
      },
    }),
  ]);

  // ── Availability ──────────────────────────────────────────────────────────
  const availabilityDocs = [
    agencyAgentOne,
    agencyAgentTwo,
    independentAgent,
  ].flatMap((agent) =>
    [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      agentId: agent._id,
      tenantId: agent.tenantId || null,
      dayOfWeek,
      slots:
        dayOfWeek === 5
          ? ["10:00 AM", "12:00 PM"]
          : ["10:00 AM", "02:00 PM", "04:00 PM"],
      isActive: true,
    })),
  );
  await Availability.insertMany(availabilityDocs);

  // ── Properties ────────────────────────────────────────────────────────────
  const propertyPayloads = [
    // 0 — Featured approved house (Karachi, for sale)
    makeProperty(
      0,
      {
        title: "Modern Family House in DHA Phase 6",
        description:
          "Spacious 5-bedroom home in the heart of DHA Phase 6 featuring Italian marble flooring, a landscaped garden, solar panels, and a double-height entrance lobby. Ideal for large families seeking luxury and security.",
        city: "Karachi",
        area: "DHA Phase 6",
        price: 68500000,
        beds: 5,
        baths: 5,
        size: 4200,
        floors: 2,
        yearBuilt: 2021,
        amenities: [
          "Swimming Pool",
          "Backup Generator",
          "CCTV",
          "Garden",
          "Servant Quarter",
          "Solar Panels",
          "Parking",
        ],
        status: "approved",
        featuredApprovalStatus: "approved",
        featuredRequested: true,
        featuredRequestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        featuredReviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        featuredReviewedBy: superAdmin._id,
        featuredUntil: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 145,
        inquiries: 8,
      },
      imageSets.house[0],
    ),

    // 1 — Featured-pending apartment (Lahore, for rent)
    makeProperty(
      1,
      {
        title: "Luxury Apartment Near Gulberg Main Boulevard",
        description:
          "Modern 3-bed apartment with floor-to-ceiling windows overlooking Gulberg's main boulevard. Building amenities include a rooftop gym, concierge, and covered parking. Perfect for young professionals.",
        city: "Lahore",
        area: "Gulberg III",
        category: "apartment",
        listingType: "for_rent",
        price: 185000,
        beds: 3,
        baths: 3,
        size: 1850,
        floors: 1,
        yearBuilt: 2020,
        amenities: [
          "Gym",
          "Elevator",
          "CCTV",
          "Intercom",
          "Parking",
          "Balcony",
          "Central AC",
        ],
        status: "pending_featured_approval",
        featuredApprovalStatus: "pending",
        featuredRequested: true,
        featuredPreviousStatus: "approved",
        featuredRequestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 78,
        inquiries: 3,
      },
      imageSets.apartment[0],
    ),

    // 2 — Approved commercial plot (Islamabad, for sale)
    makeProperty(
      2,
      {
        title: "Islamabad Commercial Plot for Investment — G-11",
        description:
          "Prime 3,600 sq ft commercial plot in G-11 Markaz, one of Islamabad's highest-traffic commercial hubs. CDA-approved, all utilities available on-plot. Excellent for a retail mall, office tower, or mixed-use development.",
        city: "Islamabad",
        area: "G-11",
        category: "plot",
        price: 42000000,
        beds: 0,
        baths: 0,
        size: 3600,
        amenities: ["Electricity", "Gas", "Water Connection", "Sui Gas"],
        status: "approved",
        tenantId: null,
        agentId: independentAgent._id,
        views: 93,
        inquiries: 5,
      },
      imageSets.plot[0],
    ),

    // 3 — Villa awaiting super-admin review (Karachi, submitted)
    makeProperty(
      3,
      {
        title: "Ultra-Luxury Villa in Clifton Block 2",
        description:
          "Palatial 7,000 sq ft villa in Karachi's most prestigious enclave. Features a private pool, home cinema, 6 en-suite bedrooms, smart home automation, and a triple-car garage. Ownership documents verified.",
        city: "Karachi",
        area: "Clifton Block 2",
        category: "villa",
        price: 125000000,
        size: 7000,
        beds: 6,
        baths: 7,
        floors: 3,
        yearBuilt: 2023,
        amenities: [
          "Swimming Pool",
          "Home Theater",
          "Smart Home",
          "Garden",
          "Parking",
          "CCTV",
          "Servant Quarter",
          "Jacuzzi",
        ],
        status: "submitted",
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 14,
        inquiries: 1,
      },
      imageSets.villa[0],
    ),

    // 4 — Rejected penthouse (Lahore, incomplete docs)
    makeProperty(
      4,
      {
        title: "Penthouse with Panoramic Views — DHA Phase 5",
        description:
          "Sky-high 3,600 sq ft penthouse on the 18th floor of an iconic DHA tower. Two private terraces with 360° city views, a private jacuzzi, and premium imported fittings throughout.",
        city: "Lahore",
        area: "DHA Phase 5",
        category: "penthouse",
        price: 78000000,
        size: 3600,
        beds: 4,
        baths: 4,
        floors: 1,
        yearBuilt: 2022,
        amenities: [
          "Jacuzzi",
          "Balcony",
          "Elevator",
          "Gym",
          "CCTV",
          "Central AC",
          "Parking",
        ],
        status: "rejected",
        rejectionReason:
          "Ownership document verification is incomplete. Please resubmit with a verified NOC from DHA Lahore and a copy of the registered title deed.",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 31,
        inquiries: 0,
      },
      imageSets.penthouse[0],
    ),

    // 5 — Approved rental house (Rawalpindi, for rent)
    makeProperty(
      5,
      {
        title: "Spacious Rental House Near Bahria Town, Rawalpindi",
        description:
          "Well-maintained 4-bedroom double-storey house in a gated community near Bahria Town Phase 8. Marble flooring, modular kitchen, servant quarter, and a roomy driveway. Ready to move in.",
        city: "Rawalpindi",
        area: "Bahria Town",
        listingType: "for_rent",
        price: 125000,
        size: 3000,
        beds: 4,
        baths: 4,
        floors: 2,
        yearBuilt: 2019,
        amenities: [
          "Backup Generator",
          "Security",
          "CCTV",
          "Garden",
          "Servant Quarter",
          "Parking",
        ],
        status: "approved",
        tenantId: null,
        agentId: independentAgent._id,
        views: 66,
        inquiries: 2,
      },
      imageSets.house[1],
    ),

    // 6 — Approved apartment for rent (Islamabad, independent agent)
    makeProperty(
      6,
      {
        title: "Contemporary Flat in F-10 Markaz, Islamabad",
        description:
          "Bright 2-bed apartment in F-10 Markaz with a south-facing balcony, modular kitchen, and dedicated car parking. Walking distance to major restaurants and Jinnah Super Market. Available from 1st of next month.",
        city: "Islamabad",
        area: "F-10",
        category: "apartment",
        listingType: "for_rent",
        price: 95000,
        beds: 2,
        baths: 2,
        size: 1350,
        floors: 1,
        yearBuilt: 2018,
        amenities: [
          "Elevator",
          "CCTV",
          "Intercom",
          "Parking",
          "Backup Generator",
          "Balcony",
        ],
        status: "approved",
        tenantId: null,
        agentId: independentAgent._id,
        views: 42,
        inquiries: 4,
      },
      imageSets.apartment[1],
    ),

    // 7 — Commercial office space (Lahore, for sale)
    makeProperty(
      7,
      {
        title: "Prime Office Space in Gulberg III — Ready to Occupy",
        description:
          "1,800 sq ft turnkey office space on the 4th floor of a corporate tower in Gulberg III. Open-plan layout, raised flooring, server room, 2 executive cabins, and 24/7 building security. CCTV throughout.",
        city: "Lahore",
        area: "Gulberg III",
        category: "commercial",
        price: 32000000,
        size: 1800,
        beds: 0,
        baths: 2,
        floors: 1,
        yearBuilt: 2017,
        amenities: [
          "Elevator",
          "Backup Generator",
          "CCTV",
          "Central AC",
          "Parking",
          "Intercom",
        ],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 55,
        inquiries: 6,
      },
      imageSets.commercial[0],
    ),

    // 8 — Villa for sale (Lahore, draft by agency)
    makeProperty(
      8,
      {
        title: "Resort-Style Villa with Private Pool — DHA Lahore",
        description:
          "Stunning 5,200 sq ft villa on a corner plot in DHA Phase 5 with a private heated pool, lush garden, home gym, and dedicated staff quarters. Architectural design inspired by contemporary Mediterranean styling.",
        city: "Lahore",
        area: "DHA Phase 5",
        category: "villa",
        price: 98000000,
        size: 5200,
        beds: 5,
        baths: 6,
        floors: 2,
        yearBuilt: 2020,
        amenities: [
          "Swimming Pool",
          "Gym",
          "Garden",
          "Servant Quarter",
          "Solar Panels",
          "Smart Home",
          "Parking",
          "CCTV",
        ],
        status: "draft",
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 0,
        inquiries: 0,
      },
      imageSets.villa[1],
    ),
  ];

  const properties = await Property.insertMany(propertyPayloads);

  // ── Inquiries ──────────────────────────────────────────────────────────────
  await Inquiry.insertMany([
    {
      propertyId: properties[0]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerOne._id,
      message:
        "I am very interested in visiting this house this weekend. Could we schedule a Saturday afternoon slot? My family would like to see the garden and pool area in person.",
      status: "agent_replied",
      lastReplyByRole: "agent",
      lastReplyAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      replies: [
        {
          senderId: agencyAgentOne._id,
          senderRole: "agent",
          message:
            "Absolutely! Saturday afternoon works perfectly. How does 3:00 PM sound? I will be on-site to walk you through the full property.",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ],
    },
    {
      propertyId: properties[2]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerTwo._id,
      message:
        "Please share the expected rental yield, title transfer timeline, and whether the plot is on a corner or mid-block. Also confirm CDA approval status.",
      status: "open",
    },
    {
      propertyId: properties[6]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerOne._id,
      message:
        "Is the apartment still available? I would like to book it from next month. Can you confirm whether utilities are included in the rent?",
      status: "agent_replied",
      lastReplyByRole: "agent",
      lastReplyAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      replies: [
        {
          senderId: independentAgent._id,
          senderRole: "agent",
          message:
            "Yes, still available! Utilities are not included but average PKR 8,000–12,000/month. Happy to arrange a viewing any weekday.",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      ],
    },
    {
      propertyId: properties[7]._id,
      tenantId: agency._id,
      agentId: agencyAgentTwo._id,
      buyerId: buyerTwo._id,
      message:
        "We are looking to relocate our 30-person team to a new office by Q3. Does this space support a server room fit-out and would you accept a 2-year lease instead of a sale?",
      status: "open",
    },
  ]);

  // ── Appointments ───────────────────────────────────────────────────────────
  await Appointment.insertMany([
    {
      propertyId: properties[0]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerOne._id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      timeSlot: "03:00 PM",
      message:
        "Family visit for the DHA house — my wife and parents will be joining.",
      status: "approved",
    },
    {
      propertyId: properties[5]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerTwo._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      timeSlot: "11:00 AM",
      message:
        "Would prefer a virtual tour first if possible, then an in-person visit.",
      status: "pending",
    },
    {
      propertyId: properties[6]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerOne._id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      timeSlot: "10:00 AM",
      message: "Morning visit to check natural light in the apartment.",
      status: "approved",
    },
  ]);

  console.log("\n✅  Demo seed complete");
  console.log(`🔑  Password for all demo accounts: ${DEFAULT_PASSWORD}`);
  console.log("\nAccounts:");
  demoEmails.forEach((email) => console.log(`   - ${email}`));
  console.log(`\nProperties: ${properties.length}`);
  console.log(`Availability rows: ${availabilityDocs.length}`);
  console.log("\nImage sets used:");
  console.log(
    "   house × 2, apartment × 2, villa × 2, plot × 1, penthouse × 1, commercial × 1",
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
