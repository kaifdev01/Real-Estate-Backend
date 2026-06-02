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

const imageSets = [
  [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  ],
  [
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
  ],
  [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
    "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200",
  ],
];

const cityCoordinates = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Faisalabad: { lat: 31.4504, lng: 73.135 },
  Multan: { lat: 30.1575, lng: 71.5249 },
};

const slugify = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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

async function upsertTenant({ name, email, phone, plan = "pro", status = "active" }) {
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

function propertyTemplate(index, overrides) {
  const coord = cityCoordinates[overrides.city] || cityCoordinates.Karachi;
  const images = imageSets[index % imageSets.length].map((url, imgIndex) => ({ url, isCover: imgIndex === 0 }));

  return {
    title: overrides.title,
    description: overrides.description || "A polished demo listing with strong photography, useful amenities, and realistic market details for testing the platform workflow.",
    listingType: overrides.listingType || "for_sale",
    category: overrides.category || "house",
    price: overrides.price || 25000000,
    currency: "PKR",
    city: overrides.city || "Karachi",
    area: overrides.area || "DHA Phase 6",
    address: overrides.address || `${overrides.area || "DHA Phase 6"}, ${overrides.city || "Karachi"}`,
    coordinates: {
      lat: coord.lat + index * 0.006,
      lng: coord.lng + index * 0.006,
    },
    size: overrides.size || 2400,
    beds: overrides.beds ?? 4,
    baths: overrides.baths ?? 4,
    kitchens: overrides.kitchens ?? 1,
    attachedBathrooms: overrides.attachedBathrooms ?? Math.min(overrides.beds ?? 4, overrides.baths ?? 4),
    parking: overrides.parking ?? 2,
    floors: overrides.floors ?? 2,
    yearBuilt: overrides.yearBuilt || 2022,
    images,
    amenities: overrides.amenities || ["Parking", "Security", "CCTV", "Backup Generator", "Garden"],
    views: overrides.views || 0,
    inquiries: overrides.inquiries || 0,
    ...overrides,
  };
}

async function main() {
  if (help) {
    console.log("Usage:");
    console.log("  npm run seed        Create or refresh demo seed data");
    console.log("  npm run seed:reset  Remove old demo seed data first, then recreate it");
    console.log("  npm run seed:fresh  Clear all app collections, then recreate clean demo data");
    console.log("");
    console.log("Important:");
    console.log("  seed:fresh deletes users, tenants, properties, inquiries, appointments, sessions, availability, and subscription plans.");
    console.log("Demo password for all accounts: Demo12345");
    return;
  }

  if (!MONGO_URL) {
    throw new Error("MONGO_URL is missing in backend .env");
  }

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
    const demoUsers = await User.find({ email: { $in: demoEmails } }).select("_id");
    const demoUserIds = demoUsers.map((user) => user._id);
    await Promise.all([
      Inquiry.deleteMany({ $or: [{ buyerId: { $in: demoUserIds } }, { agentId: { $in: demoUserIds } }] }),
      Appointment.deleteMany({ $or: [{ buyerId: { $in: demoUserIds } }, { agentId: { $in: demoUserIds } }] }),
      Availability.deleteMany({ agentId: { $in: demoUserIds } }),
      Property.deleteMany({ agentId: { $in: demoUserIds } }),
      User.deleteMany({ email: { $in: demoEmails } }),
      Tenant.deleteMany({ email: { $in: ["hello@demoagency.test"] } }),
    ]);
    console.log("Reset old demo data");
  }

  const agency = await upsertTenant({
    name: "Demo Realty Group",
    email: "hello@demoagency.test",
    phone: "+92-300-1002003",
    plan: "pro",
  });

  const agentPlan = await withPlanSettings("agent", "pro");
  const freeAgentPlan = await withPlanSettings("agent", "free");

  const [superAdmin, agencyAdmin, agencyAgentOne, agencyAgentTwo, independentAgent, buyerOne, buyerTwo] = await Promise.all([
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
    }),
    upsertUser({
      firstName: "Hamza",
      lastName: "Raza",
      email: "agent.one@luxestate.test",
      phone: "+92-300-0000003",
      role: "agent",
      tenantId: agency._id,
      city: "Karachi",
      bio: "Agency specialist for premium residential homes.",
      specialties: ["Luxury Homes", "Family Houses"],
      languages: ["English", "Urdu"],
      experience: 6,
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
      bio: "Focused on rentals and investment apartments.",
      specialties: ["Apartments", "Rentals"],
      languages: ["English", "Urdu", "Punjabi"],
      experience: 4,
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
      bio: "Independent consultant for Islamabad and Rawalpindi.",
      specialties: ["Plots", "Commercial"],
      languages: ["English", "Urdu"],
      experience: 8,
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

  await Promise.all([
    Inquiry.deleteMany({ $or: [{ agentId: { $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id] } }, { buyerId: { $in: [buyerOne._id, buyerTwo._id] } }] }),
    Appointment.deleteMany({ $or: [{ agentId: { $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id] } }, { buyerId: { $in: [buyerOne._id, buyerTwo._id] } }] }),
    Availability.deleteMany({ agentId: { $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id] } }),
    Property.deleteMany({ agentId: { $in: [agencyAgentOne._id, agencyAgentTwo._id, independentAgent._id] } }),
  ]);

  const availabilityDocs = [agencyAgentOne, agencyAgentTwo, independentAgent].flatMap((agent) => (
    [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      agentId: agent._id,
      tenantId: agent.tenantId || null,
      dayOfWeek,
      slots: dayOfWeek === 5 ? ["10:00 AM", "12:00 PM"] : ["10:00 AM", "02:00 PM", "04:00 PM"],
      isActive: true,
    }))
  ));
  await Availability.insertMany(availabilityDocs);

  const propertyPayloads = [
    propertyTemplate(0, {
      title: "Modern Family House in DHA Phase 6",
      city: "Karachi",
      area: "DHA Phase 6",
      price: 68500000,
      beds: 5,
      baths: 5,
      size: 4200,
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
    }),
    propertyTemplate(1, {
      title: "Luxury Apartment Near Gulberg Main Boulevard",
      city: "Lahore",
      area: "Gulberg III",
      category: "apartment",
      listingType: "for_rent",
      price: 185000,
      beds: 3,
      baths: 3,
      size: 1850,
      status: "pending_featured_approval",
      featuredApprovalStatus: "pending",
      featuredRequested: true,
      featuredPreviousStatus: "approved",
      featuredRequestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tenantId: agency._id,
      agentId: agencyAgentTwo._id,
      views: 78,
      inquiries: 3,
    }),
    propertyTemplate(2, {
      title: "Islamabad Commercial Plot for Investment",
      city: "Islamabad",
      area: "G-11",
      category: "plot",
      price: 42000000,
      beds: 0,
      baths: 0,
      size: 3600,
      status: "approved",
      tenantId: null,
      agentId: independentAgent._id,
      views: 93,
      inquiries: 5,
    }),
    propertyTemplate(3, {
      title: "Agency Submitted Villa Awaiting Review",
      city: "Karachi",
      area: "Clifton Block 2",
      category: "villa",
      price: 125000000,
      size: 7000,
      beds: 6,
      baths: 7,
      status: "submitted",
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      views: 14,
      inquiries: 1,
    }),
    propertyTemplate(4, {
      title: "Rejected Penthouse With Missing Documents",
      city: "Lahore",
      area: "DHA Phase 5",
      category: "penthouse",
      price: 78000000,
      size: 3600,
      beds: 4,
      baths: 4,
      status: "rejected",
      rejectionReason: "Ownership document verification is incomplete.",
      tenantId: agency._id,
      agentId: agencyAgentTwo._id,
      views: 31,
      inquiries: 0,
    }),
    propertyTemplate(5, {
      title: "Rawalpindi Rental House Near Bahria Town",
      city: "Rawalpindi",
      area: "Bahria Town",
      listingType: "for_rent",
      price: 125000,
      size: 3000,
      beds: 4,
      baths: 4,
      status: "approved",
      tenantId: null,
      agentId: independentAgent._id,
      views: 66,
      inquiries: 2,
    }),
  ];

  const properties = await Property.insertMany(propertyPayloads);

  await Inquiry.insertMany([
    {
      propertyId: properties[0]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerOne._id,
      message: "I am interested in visiting this house this weekend.",
      status: "agent_replied",
      lastReplyByRole: "agent",
      lastReplyAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      replies: [
        { senderId: agencyAgentOne._id, senderRole: "agent", message: "Sure, Saturday afternoon is available.", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      ],
    },
    {
      propertyId: properties[2]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerTwo._id,
      message: "Please share expected rental yield and transfer details.",
      status: "open",
    },
  ]);

  await Appointment.insertMany([
    {
      propertyId: properties[0]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerOne._id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      timeSlot: "03:00 PM",
      message: "Family visit for DHA house.",
      status: "approved",
    },
    {
      propertyId: properties[5]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerTwo._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      timeSlot: "11:00 AM",
      message: "Need a virtual tour first.",
      status: "pending",
    },
  ]);

  console.log("\nDemo seed complete");
  console.log(`Password for all demo accounts: ${DEFAULT_PASSWORD}`);
  console.log("Accounts:");
  demoEmails.forEach((email) => console.log(`- ${email}`));
  console.log(`Properties: ${properties.length}`);
  console.log(`Availability rows: ${availabilityDocs.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
