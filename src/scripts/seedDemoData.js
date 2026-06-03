// require("dotenv").config();
// const mongoose = require("mongoose");

// const Tenant = require("../models/Tenant");
// const User = require("../models/User");
// const Property = require("../models/Property");
// const Inquiry = require("../models/Inquiry");
// const Appointment = require("../models/Appointment");
// const Availability = require("../models/Availability");
// const RefreshToken = require("../models/RefreshToken");
// const SubscriptionPlan = require("../models/SubscriptionPlan");
// const { seedDefaultPlans, getPlan } = require("../utils/subscriptionPlans");

// const MONGO_URL = process.env.MONGO_URL;
// const DEFAULT_PASSWORD = "Demo12345";
// const reset = process.argv.includes("--reset");
// const fresh = process.argv.includes("--fresh");
// const help = process.argv.includes("--help") || process.argv.includes("-h");

// const demoEmails = [
//   "superadmin@luxestate.test",
//   "agency.admin@luxestate.test",
//   "agent.one@luxestate.test",
//   "agent.two@luxestate.test",
//   "ind.agent@luxestate.test",
//   "buyer.one@luxestate.test",
//   "buyer.two@luxestate.test",
// ];

// // ── Unsplash image sets per category (cover first, isCover:true) ──────────────
// const IMG = {
//   house: [
//     [
//       {
//         url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//   ],
//   apartment: [
//     [
//       {
//         url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1533779183510-8f55a55f4e4e?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1512916194211-3f2b7f5f7de3?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//   ],
//   villa: [
//     [
//       {
//         url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//   ],
//   penthouse: [
//     [
//       {
//         url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1512916194211-3f2b7f5f7de3?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//   ],
//   plot: [
//     [
//       {
//         url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//   ],
//   commercial: [
//     [
//       {
//         url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//     [
//       {
//         url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80",
//         isCover: true,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
//         isCover: false,
//       },
//       {
//         url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
//         isCover: false,
//       },
//     ],
//   ],
// };

// // ── Agent avatars ─────────────────────────────────────────────────────────────
// const agentAvatars = {
//   hamzaRaza:
//     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
//   saraKhan:
//     "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
//   bilalAhmed:
//     "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
//   ayeshaMalik:
//     "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
// };

// const cityCoordinates = {
//   Karachi: { lat: 24.8607, lng: 67.0011 },
//   Lahore: { lat: 31.5204, lng: 74.3587 },
//   Islamabad: { lat: 33.6844, lng: 73.0479 },
//   Rawalpindi: { lat: 33.5651, lng: 73.0169 },
//   Faisalabad: { lat: 31.4504, lng: 73.135 },
//   Multan: { lat: 30.1575, lng: 71.5249 },
// };

// const slugify = (v) =>
//   v
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-|-$/g, "");

// const withPlanSettings = async (scope, slug) => {
//   const plan = await getPlan(slug, scope);
//   if (scope === "agency") {
//     return {
//       subscription: { plan: plan.slug, startDate: new Date() },
//       settings: {
//         maxAgents: plan.maxAgents,
//         maxListings: plan.maxListings,
//         maxFeaturedListings: plan.maxFeaturedListings,
//       },
//     };
//   }
//   return {
//     subscription: { plan: plan.slug, status: "active", startDate: new Date() },
//     settings: {
//       maxListings: plan.maxListings,
//       maxFeaturedListings: plan.maxFeaturedListings,
//     },
//   };
// };

// async function upsertTenant({
//   name,
//   email,
//   phone,
//   plan = "pro",
//   status = "active",
// }) {
//   const planSettings = await withPlanSettings("agency", plan);
//   const tenant = await Tenant.findOne({ email });
//   if (tenant) {
//     Object.assign(tenant, {
//       name,
//       slug: slugify(name),
//       phone,
//       status,
//       ...planSettings,
//     });
//     await tenant.save();
//     return tenant;
//   }
//   return Tenant.create({
//     name,
//     slug: slugify(name),
//     email,
//     phone,
//     status,
//     ...planSettings,
//   });
// }

// async function upsertUser(payload) {
//   const user = await User.findOne({ email: payload.email });
//   const data = {
//     ...payload,
//     password: DEFAULT_PASSWORD,
//     status: payload.status || "active",
//     isVerified: payload.isVerified ?? true,
//     lastLogin: payload.lastLogin || new Date(Date.now() - 6 * 60 * 60 * 1000),
//   };
//   if (user) {
//     Object.assign(user, data);
//     await user.save();
//     return user;
//   }
//   return User.create(data);
// }

// function makeProperty(index, overrides, imageSet) {
//   const coord = cityCoordinates[overrides.city] || cityCoordinates.Karachi;
//   return {
//     title: overrides.title,
//     description:
//       overrides.description ||
//       "A polished demo listing with strong photography, useful amenities, and realistic market details for testing the platform workflow.",
//     listingType: overrides.listingType || "for_sale",
//     category: overrides.category || "house",
//     price: overrides.price || 25000000,
//     currency: "PKR",
//     city: overrides.city || "Karachi",
//     area: overrides.area || "DHA Phase 6",
//     address:
//       overrides.address ||
//       `${overrides.area || "DHA Phase 6"}, ${overrides.city || "Karachi"}`,
//     coordinates: {
//       lat: coord.lat + index * 0.004,
//       lng: coord.lng + index * 0.004,
//     },
//     size: overrides.size ?? 2400,
//     beds: overrides.beds ?? 4,
//     baths: overrides.baths ?? 4,
//     kitchens: overrides.kitchens ?? 1,
//     attachedBathrooms:
//       overrides.attachedBathrooms ??
//       Math.min(overrides.beds ?? 4, overrides.baths ?? 4),
//     parking: overrides.parking ?? 2,
//     floors: overrides.floors ?? 2,
//     yearBuilt: overrides.yearBuilt || 2022,
//     images: imageSet,
//     amenities: overrides.amenities || [
//       "Parking",
//       "Security",
//       "CCTV",
//       "Backup Generator",
//       "Garden",
//     ],
//     views: overrides.views || 0,
//     inquiries: overrides.inquiries || 0,
//     ...overrides,
//   };
// }

// // ── Helper: featured-approved fields ─────────────────────────────────────────
// const featuredApproved = (superAdminId, daysAgo = 7, daysAhead = 20) => ({
//   status: "approved",
//   featuredApprovalStatus: "approved",
//   featuredRequested: true,
//   featuredRequestedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
//   featuredReviewedAt: new Date(
//     Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000,
//   ),
//   featuredReviewedBy: superAdminId,
//   featuredUntil: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
// });

// async function main() {
//   if (help) {
//     console.log("Usage:");
//     console.log("  npm run seed          Create or refresh demo seed data");
//     console.log(
//       "  npm run seed:reset    Remove old demo seed data first, then recreate",
//     );
//     console.log(
//       "  npm run seed:fresh    Clear all app collections, then recreate",
//     );
//     console.log("\nDemo password for all accounts: Demo12345");
//     return;
//   }

//   if (!MONGO_URL) throw new Error("MONGO_URL is missing in backend .env");
//   await mongoose.connect(MONGO_URL);
//   console.log("✅ Connected to MongoDB");

//   if (fresh) {
//     // Use dropCollection instead of deleteMany so missing collections are silently skipped
//     const db = mongoose.connection.db;
//     const safeDrops = [
//       "refreshtokens",
//       "availabilities",
//       "appointments",
//       "inquiries",
//       "properties",
//       "users",
//       "tenants",
//       "subscriptionplans",
//     ];
//     await Promise.all(
//       safeDrops.map((name) =>
//         db.dropCollection(name).catch((err) => {
//           // 26 = NamespaceNotFound — collection didn't exist yet, that's fine
//           if (err.code !== 26) throw err;
//         }),
//       ),
//     );
//     console.log("🗑  Fresh mode: cleared all app collections");
//   }

//   await seedDefaultPlans();
//   console.log("📋 Subscription plans synced");

//   if (reset) {
//     const demoUsers = await User.find({ email: { $in: demoEmails } }).select(
//       "_id",
//     );
//     const demoUserIds = demoUsers.map((u) => u._id);
//     await Promise.all([
//       Inquiry.deleteMany({
//         $or: [
//           { buyerId: { $in: demoUserIds } },
//           { agentId: { $in: demoUserIds } },
//         ],
//       }),
//       Appointment.deleteMany({
//         $or: [
//           { buyerId: { $in: demoUserIds } },
//           { agentId: { $in: demoUserIds } },
//         ],
//       }),
//       Availability.deleteMany({ agentId: { $in: demoUserIds } }),
//       Property.deleteMany({ agentId: { $in: demoUserIds } }),
//       User.deleteMany({ email: { $in: demoEmails } }),
//       Tenant.deleteMany({ email: "hello@demoagency.test" }),
//     ]);
//     console.log("🔄 Reset old demo data");
//   }

//   // ── Tenant ─────────────────────────────────────────────────────────────────
//   const agency = await upsertTenant({
//     name: "Demo Realty Group",
//     email: "hello@demoagency.test",
//     phone: "+92-300-1002003",
//     plan: "pro",
//   });

//   const agentPlan = await withPlanSettings("agent", "pro");
//   const freeAgentPlan = await withPlanSettings("agent", "free");

//   // ── Users ──────────────────────────────────────────────────────────────────
//   const [
//     superAdmin,
//     agencyAdmin,
//     agencyAgentOne,
//     agencyAgentTwo,
//     independentAgent,
//     buyerOne,
//     buyerTwo,
//   ] = await Promise.all([
//     upsertUser({
//       firstName: "Super",
//       lastName: "Admin",
//       email: "superadmin@luxestate.test",
//       phone: "+92-300-0000001",
//       role: "super_admin",
//       tenantId: null,
//     }),
//     upsertUser({
//       firstName: "Ayesha",
//       lastName: "Malik",
//       email: "agency.admin@luxestate.test",
//       phone: "+92-300-0000002",
//       role: "agency_admin",
//       tenantId: agency._id,
//       avatar: agentAvatars.ayeshaMalik,
//     }),
//     upsertUser({
//       firstName: "Hamza",
//       lastName: "Raza",
//       email: "agent.one@luxestate.test",
//       phone: "+92-300-0000003",
//       role: "agent",
//       tenantId: agency._id,
//       city: "Karachi",
//       bio: "Agency specialist for premium residential homes in DHA and Clifton. 6 years on the ground helping families find their perfect match.",
//       specialties: ["Luxury Homes", "Family Houses", "DHA Properties"],
//       languages: ["English", "Urdu"],
//       experience: 6,
//       responseTime: "< 2 hours",
//       avatar: agentAvatars.hamzaRaza,
//       ...freeAgentPlan,
//     }),
//     upsertUser({
//       firstName: "Sara",
//       lastName: "Khan",
//       email: "agent.two@luxestate.test",
//       phone: "+92-300-0000004",
//       role: "agent",
//       tenantId: agency._id,
//       city: "Lahore",
//       bio: "Focused on rentals and investment apartments across Gulberg and DHA Lahore. Making the rental process seamless for landlords and tenants.",
//       specialties: ["Apartments", "Rentals", "Investment Properties"],
//       languages: ["English", "Urdu", "Punjabi"],
//       experience: 4,
//       responseTime: "< 4 hours",
//       avatar: agentAvatars.saraKhan,
//       ...freeAgentPlan,
//     }),
//     upsertUser({
//       firstName: "Bilal",
//       lastName: "Ahmed",
//       email: "ind.agent@luxestate.test",
//       phone: "+92-300-0000005",
//       role: "agent",
//       tenantId: null,
//       city: "Islamabad",
//       bio: "Independent real estate consultant specialising in Islamabad plots and commercial spaces. 8 years of CDA-approved sector knowledge.",
//       specialties: ["Plots", "Commercial", "CDA Sectors"],
//       languages: ["English", "Urdu"],
//       experience: 8,
//       responseTime: "< 1 hour",
//       avatar: agentAvatars.bilalAhmed,
//       ...agentPlan,
//     }),
//     upsertUser({
//       firstName: "Maham",
//       lastName: "Ali",
//       email: "buyer.one@luxestate.test",
//       phone: "+92-300-0000006",
//       role: "buyer",
//       tenantId: null,
//     }),
//     upsertUser({
//       firstName: "Usman",
//       lastName: "Sheikh",
//       email: "buyer.two@luxestate.test",
//       phone: "+92-300-0000007",
//       role: "buyer",
//       tenantId: null,
//     }),
//   ]);

//   // ── Clean old demo interactions ────────────────────────────────────────────
//   const agentIds = [
//     agencyAgentOne._id,
//     agencyAgentTwo._id,
//     independentAgent._id,
//   ];
//   const buyerIds = [buyerOne._id, buyerTwo._id];
//   await Promise.all([
//     Inquiry.deleteMany({
//       $or: [{ agentId: { $in: agentIds } }, { buyerId: { $in: buyerIds } }],
//     }),
//     Appointment.deleteMany({
//       $or: [{ agentId: { $in: agentIds } }, { buyerId: { $in: buyerIds } }],
//     }),
//     Availability.deleteMany({ agentId: { $in: agentIds } }),
//     Property.deleteMany({ agentId: { $in: agentIds } }),
//   ]);

//   // ── Availability ──────────────────────────────────────────────────────────
//   const availabilityDocs = [
//     agencyAgentOne,
//     agencyAgentTwo,
//     independentAgent,
//   ].flatMap((agent) =>
//     [1, 2, 3, 4, 5].map((dayOfWeek) => ({
//       agentId: agent._id,
//       tenantId: agent.tenantId || null,
//       dayOfWeek,
//       slots:
//         dayOfWeek === 5
//           ? ["10:00 AM", "12:00 PM"]
//           : ["10:00 AM", "02:00 PM", "04:00 PM"],
//       isActive: true,
//     })),
//   );
//   await Availability.insertMany(availabilityDocs);

//   // ── 30 Properties (10 featured-approved, rest mix of approved/other) ───────
//   const propertyPayloads = [
//     // ═══════════════════════════════════════════════════════════════════════
//     // FEATURED — 10 properties (featuredApprovalStatus: "approved")
//     // ═══════════════════════════════════════════════════════════════════════

//     // [0] Featured House — Karachi, DHA Phase 6
//     makeProperty(
//       0,
//       {
//         title: "Modern 5-Bed Family House in DHA Phase 6, Karachi",
//         description:
//           "Spacious 5-bedroom home featuring Italian marble flooring, a landscaped garden, solar panels, and a double-height entrance lobby. Ideal for large families seeking luxury and security in DHA's most prestigious phase.",
//         city: "Karachi",
//         area: "DHA Phase 6",
//         price: 68500000,
//         beds: 5,
//         baths: 5,
//         size: 4200,
//         floors: 2,
//         yearBuilt: 2021,
//         amenities: [
//           "Swimming Pool",
//           "Backup Generator",
//           "CCTV",
//           "Garden",
//           "Servant Quarter",
//           "Solar Panels",
//           "Parking",
//         ],
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 312,
//         inquiries: 18,
//         ...featuredApproved(superAdmin._id, 10, 20),
//       },
//       IMG.house[0],
//     ),

//     // [1] Featured Villa — Lahore, DHA Phase 5
//     makeProperty(
//       1,
//       {
//         title: "Resort-Style Villa with Private Pool — DHA Lahore",
//         description:
//           "Stunning 5,200 sq ft villa on a corner plot with a heated pool, lush garden, home gym, and dedicated staff quarters. Contemporary Mediterranean architectural styling with premium imported fixtures throughout.",
//         city: "Lahore",
//         area: "DHA Phase 5",
//         category: "villa",
//         price: 98000000,
//         beds: 5,
//         baths: 6,
//         size: 5200,
//         floors: 2,
//         yearBuilt: 2020,
//         amenities: [
//           "Swimming Pool",
//           "Gym",
//           "Garden",
//           "Servant Quarter",
//           "Solar Panels",
//           "Smart Home",
//           "Parking",
//           "CCTV",
//         ],
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 278,
//         inquiries: 12,
//         ...featuredApproved(superAdmin._id, 8, 22),
//       },
//       IMG.villa[1],
//     ),

//     // [2] Featured Penthouse — Islamabad, F-7
//     makeProperty(
//       2,
//       {
//         title: "Sky-High Penthouse with 360° Views — F-7, Islamabad",
//         description:
//           "Exclusive 3,200 sq ft penthouse on the 20th floor of Islamabad's tallest residential tower. Two wraparound terraces, a private jacuzzi, smart home automation, and panoramic Margalla Hills views.",
//         city: "Islamabad",
//         area: "F-7",
//         category: "penthouse",
//         price: 95000000,
//         beds: 4,
//         baths: 4,
//         size: 3200,
//         floors: 1,
//         yearBuilt: 2022,
//         amenities: [
//           "Jacuzzi",
//           "Smart Home",
//           "Elevator",
//           "Gym",
//           "CCTV",
//           "Central AC",
//           "Parking",
//           "Balcony",
//         ],
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 199,
//         inquiries: 9,
//         ...featuredApproved(superAdmin._id, 5, 25),
//       },
//       IMG.penthouse[1],
//     ),

//     // [3] Featured Apartment — Lahore, Gulberg III (for rent)
//     makeProperty(
//       3,
//       {
//         title: "Luxury 3-Bed Apartment Near Gulberg Main Boulevard",
//         description:
//           "Modern apartment with floor-to-ceiling windows overlooking Gulberg's main boulevard. Rooftop gym, concierge service, and covered parking. Perfect for professionals and small families.",
//         city: "Lahore",
//         area: "Gulberg III",
//         category: "apartment",
//         listingType: "for_rent",
//         price: 185000,
//         beds: 3,
//         baths: 3,
//         size: 1850,
//         floors: 1,
//         yearBuilt: 2020,
//         amenities: [
//           "Gym",
//           "Elevator",
//           "CCTV",
//           "Intercom",
//           "Parking",
//           "Balcony",
//           "Central AC",
//         ],
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 245,
//         inquiries: 14,
//         ...featuredApproved(superAdmin._id, 6, 18),
//       },
//       IMG.apartment[0],
//     ),

//     // [4] Featured House — Islamabad, F-10 (for rent)
//     makeProperty(
//       4,
//       {
//         title: "Elegant 4-Bed House in F-10, Islamabad — For Rent",
//         description:
//           "Well-maintained double-storey home in Islamabad's most sought-after residential sector. Large drawing room, separate dining, modular kitchen, and a beautiful front lawn. Available immediately.",
//         city: "Islamabad",
//         area: "F-10",
//         listingType: "for_rent",
//         price: 250000,
//         beds: 4,
//         baths: 4,
//         size: 3500,
//         floors: 2,
//         yearBuilt: 2018,
//         amenities: [
//           "Garden",
//           "Backup Generator",
//           "CCTV",
//           "Servant Quarter",
//           "Parking",
//           "Security",
//         ],
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 188,
//         inquiries: 11,
//         ...featuredApproved(superAdmin._id, 4, 26),
//       },
//       IMG.house[2],
//     ),

//     // [5] Featured Commercial — Lahore, Gulberg III
//     makeProperty(
//       5,
//       {
//         title: "Prime Office Space in Gulberg III Corporate Tower",
//         description:
//           "1,800 sq ft turnkey office on the 4th floor of a Grade-A corporate tower. Open-plan layout, server room, 2 executive cabins, and 24/7 security. Ideal for tech firms or professional services.",
//         city: "Lahore",
//         area: "Gulberg III",
//         category: "commercial",
//         price: 32000000,
//         beds: 0,
//         baths: 2,
//         size: 1800,
//         floors: 1,
//         yearBuilt: 2017,
//         amenities: [
//           "Elevator",
//           "Backup Generator",
//           "CCTV",
//           "Central AC",
//           "Parking",
//           "Intercom",
//         ],
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 167,
//         inquiries: 8,
//         ...featuredApproved(superAdmin._id, 9, 21),
//       },
//       IMG.commercial[0],
//     ),

//     // [6] Featured Villa — Karachi, Clifton Block 4
//     makeProperty(
//       6,
//       {
//         title: "Palatial Corner Villa in Clifton Block 4, Karachi",
//         description:
//           "Grand 6,500 sq ft villa on a prime corner plot in Clifton's most prestigious block. Marble-clad interiors, private heated pool, home cinema, wine cellar, and a triple-car garage. Ownership fully verified.",
//         city: "Karachi",
//         area: "Clifton Block 4",
//         category: "villa",
//         price: 135000000,
//         beds: 6,
//         baths: 7,
//         size: 6500,
//         floors: 3,
//         yearBuilt: 2023,
//         amenities: [
//           "Swimming Pool",
//           "Home Theater",
//           "Smart Home",
//           "Garden",
//           "Servant Quarter",
//           "Jacuzzi",
//           "Parking",
//           "CCTV",
//         ],
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 421,
//         inquiries: 22,
//         ...featuredApproved(superAdmin._id, 12, 18),
//       },
//       IMG.villa[0],
//     ),

//     // [7] Featured Apartment — Rawalpindi, Bahria Town (for rent)
//     makeProperty(
//       7,
//       {
//         title: "Modern 2-Bed Apartment in Bahria Town, Rawalpindi",
//         description:
//           "Contemporary apartment in a premium Bahria Town tower with covered parking, a fitness centre, and 24/7 concierge. South-facing balcony with great natural light. Ready to move in.",
//         city: "Rawalpindi",
//         area: "Bahria Town",
//         category: "apartment",
//         listingType: "for_rent",
//         price: 85000,
//         beds: 2,
//         baths: 2,
//         size: 1200,
//         floors: 1,
//         yearBuilt: 2021,
//         amenities: [
//           "Gym",
//           "Elevator",
//           "CCTV",
//           "Intercom",
//           "Parking",
//           "Balcony",
//           "Central AC",
//         ],
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 134,
//         inquiries: 7,
//         ...featuredApproved(superAdmin._id, 3, 27),
//       },
//       IMG.apartment[2],
//     ),

//     // [8] Featured House — Lahore, Model Town
//     makeProperty(
//       8,
//       {
//         title: "Classic 4-Bed Bungalow in Model Town, Lahore",
//         description:
//           "Timeless double-storey bungalow in Lahore's iconic Model Town society. Teak wood flooring, original mosaic tilework, wide verandah, and a well-matured garden. A rare find in this area.",
//         city: "Lahore",
//         area: "Model Town",
//         price: 55000000,
//         beds: 4,
//         baths: 4,
//         size: 3800,
//         floors: 2,
//         yearBuilt: 2005,
//         amenities: [
//           "Garden",
//           "Backup Generator",
//           "CCTV",
//           "Servant Quarter",
//           "Parking",
//           "Prayer Room",
//         ],
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 203,
//         inquiries: 15,
//         ...featuredApproved(superAdmin._id, 7, 23),
//       },
//       IMG.house[3],
//     ),

//     // [9] Featured Penthouse — Lahore, DHA Phase 6
//     makeProperty(
//       9,
//       {
//         title: "Ultra-Luxury Penthouse — DHA Phase 6, Lahore",
//         description:
//           "Sky-level 4,000 sq ft penthouse spanning the top two floors of an iconic DHA tower. Private rooftop terrace with a plunge pool, a cinema room, and a fully equipped smart kitchen. Views to die for.",
//         city: "Lahore",
//         area: "DHA Phase 6",
//         category: "penthouse",
//         price: 110000000,
//         beds: 4,
//         baths: 5,
//         size: 4000,
//         floors: 2,
//         yearBuilt: 2023,
//         amenities: [
//           "Jacuzzi",
//           "Smart Home",
//           "Elevator",
//           "Home Theater",
//           "CCTV",
//           "Central AC",
//           "Parking",
//           "Balcony",
//         ],
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 356,
//         inquiries: 19,
//         ...featuredApproved(superAdmin._id, 11, 19),
//       },
//       IMG.penthouse[2],
//     ),

//     // ═══════════════════════════════════════════════════════════════════════
//     // NON-FEATURED — 20 properties (various statuses)
//     // ═══════════════════════════════════════════════════════════════════════

//     // [10] Approved House — Karachi, Gulshan-e-Iqbal
//     makeProperty(
//       10,
//       {
//         title: "Spacious Family House in Gulshan-e-Iqbal, Karachi",
//         description:
//           "Well-maintained 4-bed house on a 300 sq yd plot in Block 13-D. Tiled throughout, a covered parking porch, and a rooftop terrace perfect for evenings.",
//         city: "Karachi",
//         area: "Gulshan-e-Iqbal",
//         price: 38000000,
//         beds: 4,
//         baths: 4,
//         size: 2700,
//         floors: 2,
//         yearBuilt: 2015,
//         amenities: ["Parking", "CCTV", "Backup Generator", "Rooftop Terrace"],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 88,
//         inquiries: 5,
//       },
//       IMG.house[1],
//     ),

//     // [11] Approved Apartment — Islamabad, G-11 (for rent)
//     makeProperty(
//       11,
//       {
//         title: "Contemporary 2-Bed Flat in G-11 Markaz, Islamabad",
//         description:
//           "Bright south-facing apartment in G-11 Markaz walking distance to major restaurants and Jinnah Super Market. Modular kitchen, dedicated car parking. Available next month.",
//         city: "Islamabad",
//         area: "G-11",
//         category: "apartment",
//         listingType: "for_rent",
//         price: 95000,
//         beds: 2,
//         baths: 2,
//         size: 1350,
//         floors: 1,
//         yearBuilt: 2018,
//         amenities: [
//           "Elevator",
//           "CCTV",
//           "Intercom",
//           "Parking",
//           "Backup Generator",
//           "Balcony",
//         ],
//         status: "approved",
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 72,
//         inquiries: 6,
//       },
//       IMG.apartment[1],
//     ),

//     // [12] Approved Plot — Islamabad, G-11
//     makeProperty(
//       12,
//       {
//         title: "CDA-Approved Commercial Plot in G-11 Markaz",
//         description:
//           "Prime 3,600 sq ft commercial plot in Islamabad's highest-traffic commercial hub. All utilities available on-plot. Excellent for a retail complex, office tower, or mixed-use development.",
//         city: "Islamabad",
//         area: "G-11",
//         category: "plot",
//         price: 42000000,
//         beds: 0,
//         baths: 0,
//         size: 3600,
//         amenities: ["Electricity", "Gas", "Water Connection", "Sui Gas"],
//         status: "approved",
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 113,
//         inquiries: 7,
//       },
//       IMG.plot[0],
//     ),

//     // [13] Approved House — Rawalpindi, Bahria Town (for rent)
//     makeProperty(
//       13,
//       {
//         title: "4-Bed Rental House Near Bahria Town, Rawalpindi",
//         description:
//           "Well-maintained double-storey house in a gated community near Bahria Town Phase 8. Marble flooring, modular kitchen, servant quarter, and a roomy driveway. Ready to move in.",
//         city: "Rawalpindi",
//         area: "Bahria Town",
//         listingType: "for_rent",
//         price: 125000,
//         beds: 4,
//         baths: 4,
//         size: 3000,
//         floors: 2,
//         yearBuilt: 2019,
//         amenities: [
//           "Backup Generator",
//           "Security",
//           "CCTV",
//           "Garden",
//           "Servant Quarter",
//           "Parking",
//         ],
//         status: "approved",
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 66,
//         inquiries: 3,
//       },
//       IMG.house[4],
//     ),

//     // [14] Approved Commercial — Islamabad, Blue Area
//     makeProperty(
//       14,
//       {
//         title: "Blue Area Corporate Office — Islamabad",
//         description:
//           "2,200 sq ft fully fitted office on the 6th floor of a premium Blue Area tower. Open floor plan, 3 executive cabins, reception, pantry, and dedicated parking. 24/7 security and CCTV.",
//         city: "Islamabad",
//         area: "Blue Area",
//         category: "commercial",
//         price: 48000000,
//         beds: 0,
//         baths: 2,
//         size: 2200,
//         floors: 1,
//         yearBuilt: 2016,
//         amenities: [
//           "Elevator",
//           "Backup Generator",
//           "CCTV",
//           "Central AC",
//           "Parking",
//           "Intercom",
//         ],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 55,
//         inquiries: 4,
//       },
//       IMG.commercial[1],
//     ),

//     // [15] Approved Apartment — Lahore, DHA Phase 5 (for sale)
//     makeProperty(
//       15,
//       {
//         title: "Brand New 3-Bed Apartment in DHA Phase 5, Lahore",
//         description:
//           "Freshly built apartment in a boutique DHA Phase 5 tower. Quartz countertops, engineered wood flooring, and a private gym on the rooftop. Builder offers easy 2-year installments.",
//         city: "Lahore",
//         area: "DHA Phase 5",
//         category: "apartment",
//         price: 28500000,
//         beds: 3,
//         baths: 3,
//         size: 1600,
//         floors: 1,
//         yearBuilt: 2024,
//         amenities: [
//           "Gym",
//           "Elevator",
//           "CCTV",
//           "Parking",
//           "Balcony",
//           "Central AC",
//         ],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 97,
//         inquiries: 8,
//       },
//       IMG.apartment[3],
//     ),

//     // [16] Approved House — Faisalabad, Canal Road
//     makeProperty(
//       16,
//       {
//         title: "Corner House on Canal Road, Faisalabad",
//         description:
//           "5-marla corner house on Canal Road with a front-facing view of the canal. Renovated bathrooms, new electrical wiring, and a small rooftop garden. Great connectivity to the city centre.",
//         city: "Faisalabad",
//         area: "Canal Road",
//         price: 18000000,
//         beds: 3,
//         baths: 3,
//         size: 1375,
//         floors: 2,
//         yearBuilt: 2012,
//         amenities: ["Parking", "CCTV", "Backup Generator", "Rooftop Garden"],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 44,
//         inquiries: 2,
//       },
//       IMG.house[0],
//     ),

//     // [17] Approved Villa — Multan, DHA
//     makeProperty(
//       17,
//       {
//         title: "Contemporary Villa in DHA Multan — Corner Plot",
//         description:
//           "4,500 sq ft modern villa on a coveted corner plot in DHA Multan. Features a heated swimming pool, landscaped garden, 5 en-suite bedrooms, and a double garage. Gated community with round-the-clock security.",
//         city: "Multan",
//         area: "DHA",
//         category: "villa",
//         price: 62000000,
//         beds: 5,
//         baths: 5,
//         size: 4500,
//         floors: 2,
//         yearBuilt: 2021,
//         amenities: [
//           "Swimming Pool",
//           "Garden",
//           "Servant Quarter",
//           "CCTV",
//           "Backup Generator",
//           "Parking",
//           "Security",
//         ],
//         status: "approved",
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 81,
//         inquiries: 5,
//       },
//       IMG.villa[2],
//     ),

//     // [18] Approved Plot — Lahore, Bahria Town (residential)
//     makeProperty(
//       18,
//       {
//         title: "10-Marla Residential Plot in Bahria Town, Lahore",
//         description:
//           "Ideally located 10-marla plot in Bahria Town Sector C. Utilities available, possession in hand, and surrounded by constructed houses. Perfect for your dream home build.",
//         city: "Lahore",
//         area: "Bahria Town",
//         category: "plot",
//         price: 22000000,
//         beds: 0,
//         baths: 0,
//         size: 2250,
//         amenities: [
//           "Electricity",
//           "Gas",
//           "Water Connection",
//           "Gated Community",
//         ],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 62,
//         inquiries: 3,
//       },
//       IMG.plot[1],
//     ),

//     // [19] Approved Apartment — Karachi, Clifton (for rent)
//     makeProperty(
//       19,
//       {
//         title: "Sea-Facing 3-Bed Apartment in Clifton, Karachi",
//         description:
//           "Rare sea-facing flat on the 8th floor of a premium Clifton tower. Partial sea view from the living room and master bedroom. Building has a gym, rooftop terrace, and underground parking.",
//         city: "Karachi",
//         area: "Clifton Block 5",
//         category: "apartment",
//         listingType: "for_rent",
//         price: 220000,
//         beds: 3,
//         baths: 3,
//         size: 2100,
//         floors: 1,
//         yearBuilt: 2019,
//         amenities: [
//           "Gym",
//           "Elevator",
//           "CCTV",
//           "Intercom",
//           "Parking",
//           "Balcony",
//           "Central AC",
//         ],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 159,
//         inquiries: 12,
//       },
//       IMG.apartment[0],
//     ),

//     // [20] Submitted — Villa, Karachi, Clifton Block 2 (awaiting review)
//     makeProperty(
//       20,
//       {
//         title: "Ultra-Luxury Villa in Clifton Block 2 — Awaiting Review",
//         description:
//           "Palatial 7,000 sq ft villa in Karachi's most prestigious enclave. Private pool, home cinema, 6 en-suite bedrooms, smart home automation, and a triple-car garage. Ownership documents verified.",
//         city: "Karachi",
//         area: "Clifton Block 2",
//         category: "villa",
//         price: 125000000,
//         beds: 6,
//         baths: 7,
//         size: 7000,
//         floors: 3,
//         yearBuilt: 2023,
//         amenities: [
//           "Swimming Pool",
//           "Home Theater",
//           "Smart Home",
//           "Garden",
//           "Servant Quarter",
//           "Jacuzzi",
//           "Parking",
//           "CCTV",
//         ],
//         status: "submitted",
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 14,
//         inquiries: 1,
//       },
//       IMG.villa[0],
//     ),

//     // [21] Rejected — Penthouse, Lahore (incomplete docs)
//     makeProperty(
//       21,
//       {
//         title: "Penthouse with Panoramic Views — DHA Phase 5 (Rejected)",
//         description:
//           "Sky-high 3,600 sq ft penthouse on the 18th floor. Two private terraces, a jacuzzi, and premium imported fittings. Listing was rejected due to incomplete ownership documents.",
//         city: "Lahore",
//         area: "DHA Phase 5",
//         category: "penthouse",
//         price: 78000000,
//         beds: 4,
//         baths: 4,
//         size: 3600,
//         floors: 1,
//         yearBuilt: 2022,
//         amenities: [
//           "Jacuzzi",
//           "Balcony",
//           "Elevator",
//           "Gym",
//           "CCTV",
//           "Central AC",
//           "Parking",
//         ],
//         status: "rejected",
//         rejectionReason:
//           "Ownership document verification is incomplete. Please resubmit with a verified NOC from DHA Lahore and a registered title deed copy.",
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 31,
//         inquiries: 0,
//       },
//       IMG.penthouse[0],
//     ),

//     // [22] Draft — House, Lahore, Johar Town
//     makeProperty(
//       22,
//       {
//         title: "Double-Storey House in Johar Town, Lahore — Draft",
//         description:
//           "5-marla double-storey house in Johar Town Phase 2 near main boulevard. Recently renovated kitchen and bathrooms. Draft listing — agent completing photos before submission.",
//         city: "Lahore",
//         area: "Johar Town",
//         price: 19500000,
//         beds: 3,
//         baths: 3,
//         size: 1125,
//         floors: 2,
//         yearBuilt: 2010,
//         amenities: ["Parking", "CCTV", "Backup Generator"],
//         status: "draft",
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 0,
//         inquiries: 0,
//       },
//       IMG.house[1],
//     ),

//     // [23] Approved House — Islamabad, DHA Phase 2
//     makeProperty(
//       23,
//       {
//         title: "Brand New 5-Bed House in DHA Islamabad Phase 2",
//         description:
//           "Freshly constructed home in DHA Islamabad Phase 2 with imported kitchen cabinets, underfloor heating in bathrooms, and a beautifully landscaped garden. Ready for immediate possession.",
//         city: "Islamabad",
//         area: "DHA Phase 2",
//         price: 85000000,
//         beds: 5,
//         baths: 5,
//         size: 4000,
//         floors: 2,
//         yearBuilt: 2024,
//         amenities: [
//           "Garden",
//           "CCTV",
//           "Backup Generator",
//           "Servant Quarter",
//           "Solar Panels",
//           "Parking",
//         ],
//         status: "approved",
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 103,
//         inquiries: 7,
//       },
//       IMG.house[2],
//     ),

//     // [24] Approved Apartment — Karachi, North Nazimabad (for sale)
//     makeProperty(
//       24,
//       {
//         title: "2-Bed Apartment in North Nazimabad, Karachi",
//         description:
//           "Affordable yet modern 2-bed apartment on the 5th floor in North Nazimabad Block H. Newly painted, fresh fixtures, and a dedicated parking spot in the basement.",
//         city: "Karachi",
//         area: "North Nazimabad",
//         category: "apartment",
//         price: 12800000,
//         beds: 2,
//         baths: 2,
//         size: 1100,
//         floors: 1,
//         yearBuilt: 2016,
//         amenities: ["Elevator", "Parking", "CCTV", "Intercom"],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 47,
//         inquiries: 4,
//       },
//       IMG.apartment[2],
//     ),

//     // [25] Approved Commercial — Lahore, MM Alam Road (for rent)
//     makeProperty(
//       25,
//       {
//         title: "Restaurant / Retail Space on MM Alam Road, Lahore",
//         description:
//           "High-visibility 2,500 sq ft ground-floor commercial space on Lahore's most lucrative retail strip. Full glass frontage, 15 ft ceiling height, and 3-phase power supply. Ideal for a restaurant or flagship store.",
//         city: "Lahore",
//         area: "Gulberg III",
//         category: "commercial",
//         listingType: "for_rent",
//         price: 600000,
//         beds: 0,
//         baths: 2,
//         size: 2500,
//         floors: 1,
//         yearBuilt: 2014,
//         amenities: ["CCTV", "Central AC", "Backup Generator", "Parking"],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 88,
//         inquiries: 9,
//       },
//       IMG.commercial[2],
//     ),

//     // [26] Approved Plot — Islamabad, Bahria Town (for sale)
//     makeProperty(
//       26,
//       {
//         title: "1-Kanal Residential Plot in Bahria Town, Islamabad",
//         description:
//           "Premium 1-kanal plot in Bahria Town Islamabad Phase 7 with clear title and possession. Corner-adjacent, all utilities on-street, and surrounded by park. Ideal for building a custom family home.",
//         city: "Islamabad",
//         area: "Bahria Town",
//         category: "plot",
//         price: 55000000,
//         beds: 0,
//         baths: 0,
//         size: 4500,
//         amenities: [
//           "Electricity",
//           "Gas",
//           "Water Connection",
//           "Gated Community",
//           "Park Nearby",
//         ],
//         status: "approved",
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 74,
//         inquiries: 5,
//       },
//       IMG.plot[2],
//     ),

//     // [27] Approved House — Multan, Cantt (for rent)
//     makeProperty(
//       27,
//       {
//         title: "Furnished House in Multan Cantt — Available Immediately",
//         description:
//           "3-bed fully furnished house in the serene Multan Cantt area. All furniture included, AC in every room, and a beautiful garden maintained by the owner. Long-term tenants preferred.",
//         city: "Multan",
//         area: "Cantt",
//         listingType: "for_rent",
//         price: 90000,
//         beds: 3,
//         baths: 3,
//         size: 2200,
//         floors: 1,
//         yearBuilt: 2014,
//         amenities: [
//           "Garden",
//           "Parking",
//           "CCTV",
//           "Backup Generator",
//           "Furnished",
//         ],
//         status: "approved",
//         tenantId: null,
//         agentId: independentAgent._id,
//         views: 53,
//         inquiries: 4,
//       },
//       IMG.house[3],
//     ),

//     // [28] Pending Featured Approval — House, Karachi, Bahria Town
//     makeProperty(
//       28,
//       {
//         title: "Luxury House in Bahria Town Karachi — Featured Pending",
//         description:
//           "Stunning 4,000 sq ft home in Bahria Town Karachi's Precinct 1. Contemporary design with a designer kitchen, walk-in wardrobes, home automation, and a private garden. Featured approval in progress.",
//         city: "Karachi",
//         area: "Bahria Town",
//         price: 72000000,
//         beds: 5,
//         baths: 5,
//         size: 4000,
//         floors: 2,
//         yearBuilt: 2022,
//         amenities: [
//           "Smart Home",
//           "Garden",
//           "Swimming Pool",
//           "CCTV",
//           "Servant Quarter",
//           "Solar Panels",
//           "Parking",
//         ],
//         status: "pending_featured_approval",
//         featuredApprovalStatus: "pending",
//         featuredRequested: true,
//         featuredPreviousStatus: "approved",
//         featuredRequestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
//         tenantId: agency._id,
//         agentId: agencyAgentOne._id,
//         views: 92,
//         inquiries: 6,
//       },
//       IMG.house[4],
//     ),

//     // [29] Approved Apartment — Faisalabad, Peoples Colony (for rent)
//     makeProperty(
//       29,
//       {
//         title: "Affordable 2-Bed Flat in Peoples Colony, Faisalabad",
//         description:
//           "Clean and well-maintained apartment in a 6-storey building in Peoples Colony. Split AC units in all rooms, tiled flooring, and a covered parking spot. Utilities billed separately.",
//         city: "Faisalabad",
//         area: "Peoples Colony",
//         category: "apartment",
//         listingType: "for_rent",
//         price: 45000,
//         beds: 2,
//         baths: 2,
//         size: 950,
//         floors: 1,
//         yearBuilt: 2015,
//         amenities: ["Parking", "CCTV", "Backup Generator", "Central AC"],
//         status: "approved",
//         tenantId: agency._id,
//         agentId: agencyAgentTwo._id,
//         views: 38,
//         inquiries: 3,
//       },
//       IMG.apartment[3],
//     ),
//   ];

//   const properties = await Property.insertMany(propertyPayloads);
//   console.log(
//     `🏘  Inserted ${properties.length} properties (10 featured-approved)`,
//   );

//   // ── Inquiries ──────────────────────────────────────────────────────────────
//   await Inquiry.insertMany([
//     {
//       propertyId: properties[0]._id,
//       tenantId: agency._id,
//       agentId: agencyAgentOne._id,
//       buyerId: buyerOne._id,
//       message:
//         "I'd love to visit this weekend with my family. Can we schedule Saturday afternoon?",
//       status: "agent_replied",
//       lastReplyByRole: "agent",
//       lastReplyAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
//       replies: [
//         {
//           senderId: agencyAgentOne._id,
//           senderRole: "agent",
//           message:
//             "Absolutely! Saturday 3 PM works great. I'll be on-site to walk you through.",
//           createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
//         },
//       ],
//     },
//     {
//       propertyId: properties[3]._id,
//       tenantId: agency._id,
//       agentId: agencyAgentTwo._id,
//       buyerId: buyerTwo._id,
//       message:
//         "Is this apartment still available? We'd like to book for next month. Are utilities included?",
//       status: "agent_replied",
//       lastReplyByRole: "agent",
//       lastReplyAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
//       replies: [
//         {
//           senderId: agencyAgentTwo._id,
//           senderRole: "agent",
//           message:
//             "Yes! Utilities are separate, typically PKR 8–12k/month. Happy to arrange a viewing.",
//           createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
//         },
//       ],
//     },
//     {
//       propertyId: properties[12]._id,
//       tenantId: null,
//       agentId: independentAgent._id,
//       buyerId: buyerTwo._id,
//       message:
//         "Please share the expected rental yield, transfer timeline, and whether the plot is corner or mid-block.",
//       status: "open",
//     },
//     {
//       propertyId: properties[5]._id,
//       tenantId: agency._id,
//       agentId: agencyAgentTwo._id,
//       buyerId: buyerOne._id,
//       message:
//         "We're looking to relocate our 30-person team. Does this space support a server room fit-out?",
//       status: "open",
//     },
//     {
//       propertyId: properties[19]._id,
//       tenantId: agency._id,
//       agentId: agencyAgentOne._id,
//       buyerId: buyerTwo._id,
//       message:
//         "Is the sea view really visible from inside? We'd love a viewing on a weekend morning.",
//       status: "agent_replied",
//       lastReplyByRole: "agent",
//       lastReplyAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
//       replies: [
//         {
//           senderId: agencyAgentOne._id,
//           senderRole: "agent",
//           message:
//             "Yes, on a clear day you get a partial sea view from the living room. Saturday morning works great!",
//           createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
//         },
//       ],
//     },
//   ]);

//   // ── Appointments ──────────────────────────────────────────────────────────
//   await Appointment.insertMany([
//     {
//       propertyId: properties[0]._id,
//       tenantId: agency._id,
//       agentId: agencyAgentOne._id,
//       buyerId: buyerOne._id,
//       date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//       timeSlot: "03:00 PM",
//       message: "Family visit — wife and parents joining.",
//       status: "approved",
//     },
//     {
//       propertyId: properties[13]._id,
//       tenantId: null,
//       agentId: independentAgent._id,
//       buyerId: buyerTwo._id,
//       date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
//       timeSlot: "11:00 AM",
//       message: "Would prefer a virtual tour first, then in-person.",
//       status: "pending",
//     },
//     {
//       propertyId: properties[11]._id,
//       tenantId: null,
//       agentId: independentAgent._id,
//       buyerId: buyerOne._id,
//       date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
//       timeSlot: "10:00 AM",
//       message: "Morning visit to check natural light.",
//       status: "approved",
//     },
//     {
//       propertyId: properties[19]._id,
//       tenantId: agency._id,
//       agentId: agencyAgentOne._id,
//       buyerId: buyerTwo._id,
//       date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
//       timeSlot: "09:00 AM",
//       message: "Early morning sea-view check.",
//       status: "pending",
//     },
//   ]);

//   console.log("\n✅  Demo seed complete");
//   console.log(`🔑  Password for all demo accounts: ${DEFAULT_PASSWORD}`);
//   console.log("\nAccounts:");
//   demoEmails.forEach((e) => console.log(`   - ${e}`));
//   console.log(`\nProperties:    ${properties.length} total`);
//   console.log(`               10 featured-approved`);
//   console.log(`               12 approved (non-featured)`);
//   console.log(`               1  pending_featured_approval`);
//   console.log(`               1  submitted`);
//   console.log(`               1  rejected`);
//   console.log(`               1  draft`);
//   console.log(`Availability:  ${availabilityDocs.length} rows`);
// }

// main()
//   .catch((err) => {
//     console.error("Seed failed:", err);
//     process.exitCode = 1;
//   })
//   .finally(async () => {
//     await mongoose.connection.close();
//   });
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

const MONGO_URL =
  "mongodb+srv://adeelimran467:admin1122@cluster0.guns5nz.mongodb.net/";
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

// ── Unsplash image sets per category (cover first, isCover:true) ──────────────
const IMG = {
  house: [
    [
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
    [
      {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      {
        url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=1200&q=80",
        isCover: false,
      },
    ],
  ],
  apartment: [
    [
      {
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
        isCover: false,
      },
    ],
    [
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
    [
      {
        url: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      {
        url: "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1512916194211-3f2b7f5f7de3?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
        isCover: false,
      },
    ],
  ],
  villa: [
    [
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
    [
      {
        url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=1200&q=80",
        isCover: false,
      },
    ],
  ],
  penthouse: [
    [
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
    [
      {
        url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1512916194211-3f2b7f5f7de3?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
        isCover: false,
      },
    ],
  ],
  plot: [
    [
      {
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      {
        url: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
        isCover: false,
      },
    ],
    [
      {
        url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1200&q=80",
        isCover: false,
      },
    ],
  ],
  commercial: [
    [
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
    [
      {
        url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
        isCover: false,
      },
    ],
  ],
};

// ── Agent avatars ─────────────────────────────────────────────────────────────
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

const slugify = (v) =>
  v
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
    Object.assign(tenant, {
      name,
      slug: slugify(name),
      phone,
      status,
      ...planSettings,
    });
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
      lat: coord.lat + index * 0.004,
      lng: coord.lng + index * 0.004,
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

// ── Helper: featured-approved fields ─────────────────────────────────────────
const featuredApproved = (superAdminId, daysAgo = 7, daysAhead = 20) => ({
  status: "approved",
  featuredApprovalStatus: "approved",
  featuredRequested: true,
  featuredRequestedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  featuredReviewedAt: new Date(
    Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000,
  ),
  featuredReviewedBy: superAdminId,
  featuredUntil: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
});

async function main() {
  if (help) {
    console.log("Usage:");
    console.log("  npm run seed          Create or refresh demo seed data");
    console.log(
      "  npm run seed:reset    Remove old demo seed data first, then recreate",
    );
    console.log(
      "  npm run seed:fresh    Clear all app collections, then recreate",
    );
    console.log("\nDemo password for all accounts: Demo12345");
    return;
  }

  if (!MONGO_URL) throw new Error("MONGO_URL is missing in backend .env");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to MongoDB");

  if (fresh) {
    // Use dropCollection instead of deleteMany so missing collections are silently skipped
    const db = mongoose.connection.db;
    const safeDrops = [
      "refreshtokens",
      "availabilities",
      "appointments",
      "inquiries",
      "properties",
      "users",
      "tenants",
      "subscriptionplans",
    ];
    await Promise.all(
      safeDrops.map((name) =>
        db.dropCollection(name).catch((err) => {
          // 26 = NamespaceNotFound — collection didn't exist yet, that's fine
          if (err.code !== 26) throw err;
        }),
      ),
    );
    console.log("🗑  Fresh mode: cleared all app collections");
  }

  await seedDefaultPlans();
  console.log("📋 Subscription plans synced");

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
      Tenant.deleteMany({ email: "hello@demoagency.test" }),
    ]);
    console.log("🔄 Reset old demo data");
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
      bio: "Agency specialist for premium residential homes in DHA and Clifton. 6 years on the ground helping families find their perfect match.",
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
      bio: "Focused on rentals and investment apartments across Gulberg and DHA Lahore. Making the rental process seamless for landlords and tenants.",
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
      bio: "Independent real estate consultant specialising in Islamabad plots and commercial spaces. 8 years of CDA-approved sector knowledge.",
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

  // ── Clean old demo interactions ────────────────────────────────────────────
  const agentIds = [
    agencyAgentOne._id,
    agencyAgentTwo._id,
    independentAgent._id,
  ];
  const buyerIds = [buyerOne._id, buyerTwo._id];
  await Promise.all([
    Inquiry.deleteMany({
      $or: [{ agentId: { $in: agentIds } }, { buyerId: { $in: buyerIds } }],
    }),
    Appointment.deleteMany({
      $or: [{ agentId: { $in: agentIds } }, { buyerId: { $in: buyerIds } }],
    }),
    Availability.deleteMany({ agentId: { $in: agentIds } }),
    Property.deleteMany({ agentId: { $in: agentIds } }),
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

  // ── 30 Properties (10 featured-approved, rest mix of approved/other) ───────
  const propertyPayloads = [
    // ═══════════════════════════════════════════════════════════════════════
    // FEATURED — 10 properties (featuredApprovalStatus: "approved")
    // ═══════════════════════════════════════════════════════════════════════

    // [0] Featured House — Karachi, DHA Phase 6
    makeProperty(
      0,
      {
        title: "Modern 5-Bed Family House in DHA Phase 6, Karachi",
        description:
          "Spacious 5-bedroom home featuring Italian marble flooring, a landscaped garden, solar panels, and a double-height entrance lobby. Ideal for large families seeking luxury and security in DHA's most prestigious phase.",
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
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 312,
        inquiries: 18,
        ...featuredApproved(superAdmin._id, 10, 20),
      },
      IMG.house[0],
    ),

    // [1] Featured Villa — Lahore, DHA Phase 5
    makeProperty(
      1,
      {
        title: "Resort-Style Villa with Private Pool — DHA Lahore",
        description:
          "Stunning 5,200 sq ft villa on a corner plot with a heated pool, lush garden, home gym, and dedicated staff quarters. Contemporary Mediterranean architectural styling with premium imported fixtures throughout.",
        city: "Lahore",
        area: "DHA Phase 5",
        category: "villa",
        price: 98000000,
        beds: 5,
        baths: 6,
        size: 5200,
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
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 278,
        inquiries: 12,
        ...featuredApproved(superAdmin._id, 8, 22),
      },
      IMG.villa[1],
    ),

    // [2] Featured Penthouse — Islamabad, F-7
    makeProperty(
      2,
      {
        title: "Sky-High Penthouse with 360° Views — F-7, Islamabad",
        description:
          "Exclusive 3,200 sq ft penthouse on the 20th floor of Islamabad's tallest residential tower. Two wraparound terraces, a private jacuzzi, smart home automation, and panoramic Margalla Hills views.",
        city: "Islamabad",
        area: "F-7",
        category: "penthouse",
        price: 95000000,
        beds: 4,
        baths: 4,
        size: 3200,
        floors: 1,
        yearBuilt: 2022,
        amenities: [
          "Jacuzzi",
          "Smart Home",
          "Elevator",
          "Gym",
          "CCTV",
          "Central AC",
          "Parking",
          "Balcony",
        ],
        tenantId: null,
        agentId: independentAgent._id,
        views: 199,
        inquiries: 9,
        ...featuredApproved(superAdmin._id, 5, 25),
      },
      IMG.penthouse[1],
    ),

    // [3] Featured Apartment — Lahore, Gulberg III (for rent)
    makeProperty(
      3,
      {
        title: "Luxury 3-Bed Apartment Near Gulberg Main Boulevard",
        description:
          "Modern apartment with floor-to-ceiling windows overlooking Gulberg's main boulevard. Rooftop gym, concierge service, and covered parking. Perfect for professionals and small families.",
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
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 245,
        inquiries: 14,
        ...featuredApproved(superAdmin._id, 6, 18),
      },
      IMG.apartment[0],
    ),

    // [4] Featured House — Islamabad, F-10 (for rent)
    makeProperty(
      4,
      {
        title: "Elegant 4-Bed House in F-10, Islamabad — For Rent",
        description:
          "Well-maintained double-storey home in Islamabad's most sought-after residential sector. Large drawing room, separate dining, modular kitchen, and a beautiful front lawn. Available immediately.",
        city: "Islamabad",
        area: "F-10",
        listingType: "for_rent",
        price: 250000,
        beds: 4,
        baths: 4,
        size: 3500,
        floors: 2,
        yearBuilt: 2018,
        amenities: [
          "Garden",
          "Backup Generator",
          "CCTV",
          "Servant Quarter",
          "Parking",
          "Security",
        ],
        tenantId: null,
        agentId: independentAgent._id,
        views: 188,
        inquiries: 11,
        ...featuredApproved(superAdmin._id, 4, 26),
      },
      IMG.house[2],
    ),

    // [5] Featured Commercial — Lahore, Gulberg III
    makeProperty(
      5,
      {
        title: "Prime Office Space in Gulberg III Corporate Tower",
        description:
          "1,800 sq ft turnkey office on the 4th floor of a Grade-A corporate tower. Open-plan layout, server room, 2 executive cabins, and 24/7 security. Ideal for tech firms or professional services.",
        city: "Lahore",
        area: "Gulberg III",
        category: "commercial",
        price: 32000000,
        beds: 0,
        baths: 2,
        size: 1800,
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
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 167,
        inquiries: 8,
        ...featuredApproved(superAdmin._id, 9, 21),
      },
      IMG.commercial[0],
    ),

    // [6] Featured Villa — Karachi, Clifton Block 4
    makeProperty(
      6,
      {
        title: "Palatial Corner Villa in Clifton Block 4, Karachi",
        description:
          "Grand 6,500 sq ft villa on a prime corner plot in Clifton's most prestigious block. Marble-clad interiors, private heated pool, home cinema, wine cellar, and a triple-car garage. Ownership fully verified.",
        city: "Karachi",
        area: "Clifton Block 4",
        category: "villa",
        price: 135000000,
        beds: 6,
        baths: 7,
        size: 6500,
        floors: 3,
        yearBuilt: 2023,
        amenities: [
          "Swimming Pool",
          "Home Theater",
          "Smart Home",
          "Garden",
          "Servant Quarter",
          "Jacuzzi",
          "Parking",
          "CCTV",
        ],
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 421,
        inquiries: 22,
        ...featuredApproved(superAdmin._id, 12, 18),
      },
      IMG.villa[0],
    ),

    // [7] Featured Apartment — Rawalpindi, Bahria Town (for rent)
    makeProperty(
      7,
      {
        title: "Modern 2-Bed Apartment in Bahria Town, Rawalpindi",
        description:
          "Contemporary apartment in a premium Bahria Town tower with covered parking, a fitness centre, and 24/7 concierge. South-facing balcony with great natural light. Ready to move in.",
        city: "Rawalpindi",
        area: "Bahria Town",
        category: "apartment",
        listingType: "for_rent",
        price: 85000,
        beds: 2,
        baths: 2,
        size: 1200,
        floors: 1,
        yearBuilt: 2021,
        amenities: [
          "Gym",
          "Elevator",
          "CCTV",
          "Intercom",
          "Parking",
          "Balcony",
          "Central AC",
        ],
        tenantId: null,
        agentId: independentAgent._id,
        views: 134,
        inquiries: 7,
        ...featuredApproved(superAdmin._id, 3, 27),
      },
      IMG.apartment[2],
    ),

    // [8] Featured House — Lahore, Model Town
    makeProperty(
      8,
      {
        title: "Classic 4-Bed Bungalow in Model Town, Lahore",
        description:
          "Timeless double-storey bungalow in Lahore's iconic Model Town society. Teak wood flooring, original mosaic tilework, wide verandah, and a well-matured garden. A rare find in this area.",
        city: "Lahore",
        area: "Model Town",
        price: 55000000,
        beds: 4,
        baths: 4,
        size: 3800,
        floors: 2,
        yearBuilt: 2005,
        amenities: [
          "Garden",
          "Backup Generator",
          "CCTV",
          "Servant Quarter",
          "Parking",
          "Prayer Room",
        ],
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 203,
        inquiries: 15,
        ...featuredApproved(superAdmin._id, 7, 23),
      },
      IMG.house[3],
    ),

    // [9] Featured Penthouse — Lahore, DHA Phase 6
    makeProperty(
      9,
      {
        title: "Ultra-Luxury Penthouse — DHA Phase 6, Lahore",
        description:
          "Sky-level 4,000 sq ft penthouse spanning the top two floors of an iconic DHA tower. Private rooftop terrace with a plunge pool, a cinema room, and a fully equipped smart kitchen. Views to die for.",
        city: "Lahore",
        area: "DHA Phase 6",
        category: "penthouse",
        price: 110000000,
        beds: 4,
        baths: 5,
        size: 4000,
        floors: 2,
        yearBuilt: 2023,
        amenities: [
          "Jacuzzi",
          "Smart Home",
          "Elevator",
          "Home Theater",
          "CCTV",
          "Central AC",
          "Parking",
          "Balcony",
        ],
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 356,
        inquiries: 19,
        ...featuredApproved(superAdmin._id, 11, 19),
      },
      IMG.penthouse[2],
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // NON-FEATURED — 20 properties (various statuses)
    // ═══════════════════════════════════════════════════════════════════════

    // [10] Approved House — Karachi, Gulshan-e-Iqbal
    makeProperty(
      10,
      {
        title: "Spacious Family House in Gulshan-e-Iqbal, Karachi",
        description:
          "Well-maintained 4-bed house on a 300 sq yd plot in Block 13-D. Tiled throughout, a covered parking porch, and a rooftop terrace perfect for evenings.",
        city: "Karachi",
        area: "Gulshan-e-Iqbal",
        price: 38000000,
        beds: 4,
        baths: 4,
        size: 2700,
        floors: 2,
        yearBuilt: 2015,
        amenities: ["Parking", "CCTV", "Backup Generator", "Rooftop Terrace"],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 88,
        inquiries: 5,
      },
      IMG.house[1],
    ),

    // [11] Approved Apartment — Islamabad, G-11 (for rent)
    makeProperty(
      11,
      {
        title: "Contemporary 2-Bed Flat in G-11 Markaz, Islamabad",
        description:
          "Bright south-facing apartment in G-11 Markaz walking distance to major restaurants and Jinnah Super Market. Modular kitchen, dedicated car parking. Available next month.",
        city: "Islamabad",
        area: "G-11",
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
        views: 72,
        inquiries: 6,
      },
      IMG.apartment[1],
    ),

    // [12] Approved Plot — Islamabad, G-11
    makeProperty(
      12,
      {
        title: "CDA-Approved Commercial Plot in G-11 Markaz",
        description:
          "Prime 3,600 sq ft commercial plot in Islamabad's highest-traffic commercial hub. All utilities available on-plot. Excellent for a retail complex, office tower, or mixed-use development.",
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
        views: 113,
        inquiries: 7,
      },
      IMG.plot[0],
    ),

    // [13] Approved House — Rawalpindi, Bahria Town (for rent)
    makeProperty(
      13,
      {
        title: "4-Bed Rental House Near Bahria Town, Rawalpindi",
        description:
          "Well-maintained double-storey house in a gated community near Bahria Town Phase 8. Marble flooring, modular kitchen, servant quarter, and a roomy driveway. Ready to move in.",
        city: "Rawalpindi",
        area: "Bahria Town",
        listingType: "for_rent",
        price: 125000,
        beds: 4,
        baths: 4,
        size: 3000,
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
        inquiries: 3,
      },
      IMG.house[4],
    ),

    // [14] Approved Commercial — Islamabad, Blue Area
    makeProperty(
      14,
      {
        title: "Blue Area Corporate Office — Islamabad",
        description:
          "2,200 sq ft fully fitted office on the 6th floor of a premium Blue Area tower. Open floor plan, 3 executive cabins, reception, pantry, and dedicated parking. 24/7 security and CCTV.",
        city: "Islamabad",
        area: "Blue Area",
        category: "commercial",
        price: 48000000,
        beds: 0,
        baths: 2,
        size: 2200,
        floors: 1,
        yearBuilt: 2016,
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
        inquiries: 4,
      },
      IMG.commercial[1],
    ),

    // [15] Approved Apartment — Lahore, DHA Phase 5 (for sale)
    makeProperty(
      15,
      {
        title: "Brand New 3-Bed Apartment in DHA Phase 5, Lahore",
        description:
          "Freshly built apartment in a boutique DHA Phase 5 tower. Quartz countertops, engineered wood flooring, and a private gym on the rooftop. Builder offers easy 2-year installments.",
        city: "Lahore",
        area: "DHA Phase 5",
        category: "apartment",
        price: 28500000,
        beds: 3,
        baths: 3,
        size: 1600,
        floors: 1,
        yearBuilt: 2024,
        amenities: [
          "Gym",
          "Elevator",
          "CCTV",
          "Parking",
          "Balcony",
          "Central AC",
        ],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 97,
        inquiries: 8,
      },
      IMG.apartment[3],
    ),

    // [16] Approved House — Faisalabad, Canal Road
    makeProperty(
      16,
      {
        title: "Corner House on Canal Road, Faisalabad",
        description:
          "5-marla corner house on Canal Road with a front-facing view of the canal. Renovated bathrooms, new electrical wiring, and a small rooftop garden. Great connectivity to the city centre.",
        city: "Faisalabad",
        area: "Canal Road",
        price: 18000000,
        beds: 3,
        baths: 3,
        size: 1375,
        floors: 2,
        yearBuilt: 2012,
        amenities: ["Parking", "CCTV", "Backup Generator", "Rooftop Garden"],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 44,
        inquiries: 2,
      },
      IMG.house[0],
    ),

    // [17] Approved Villa — Multan, DHA
    makeProperty(
      17,
      {
        title: "Contemporary Villa in DHA Multan — Corner Plot",
        description:
          "4,500 sq ft modern villa on a coveted corner plot in DHA Multan. Features a heated swimming pool, landscaped garden, 5 en-suite bedrooms, and a double garage. Gated community with round-the-clock security.",
        city: "Multan",
        area: "DHA",
        category: "villa",
        price: 62000000,
        beds: 5,
        baths: 5,
        size: 4500,
        floors: 2,
        yearBuilt: 2021,
        amenities: [
          "Swimming Pool",
          "Garden",
          "Servant Quarter",
          "CCTV",
          "Backup Generator",
          "Parking",
          "Security",
        ],
        status: "approved",
        tenantId: null,
        agentId: independentAgent._id,
        views: 81,
        inquiries: 5,
      },
      IMG.villa[2],
    ),

    // [18] Approved Plot — Lahore, Bahria Town (residential)
    makeProperty(
      18,
      {
        title: "10-Marla Residential Plot in Bahria Town, Lahore",
        description:
          "Ideally located 10-marla plot in Bahria Town Sector C. Utilities available, possession in hand, and surrounded by constructed houses. Perfect for your dream home build.",
        city: "Lahore",
        area: "Bahria Town",
        category: "plot",
        price: 22000000,
        beds: 0,
        baths: 0,
        size: 2250,
        amenities: [
          "Electricity",
          "Gas",
          "Water Connection",
          "Gated Community",
        ],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 62,
        inquiries: 3,
      },
      IMG.plot[1],
    ),

    // [19] Approved Apartment — Karachi, Clifton (for rent)
    makeProperty(
      19,
      {
        title: "Sea-Facing 3-Bed Apartment in Clifton, Karachi",
        description:
          "Rare sea-facing flat on the 8th floor of a premium Clifton tower. Partial sea view from the living room and master bedroom. Building has a gym, rooftop terrace, and underground parking.",
        city: "Karachi",
        area: "Clifton Block 5",
        category: "apartment",
        listingType: "for_rent",
        price: 220000,
        beds: 3,
        baths: 3,
        size: 2100,
        floors: 1,
        yearBuilt: 2019,
        amenities: [
          "Gym",
          "Elevator",
          "CCTV",
          "Intercom",
          "Parking",
          "Balcony",
          "Central AC",
        ],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 159,
        inquiries: 12,
      },
      IMG.apartment[0],
    ),

    // [20] Submitted — Villa, Karachi, Clifton Block 2 (awaiting review)
    makeProperty(
      20,
      {
        title: "Ultra-Luxury Villa in Clifton Block 2 — Awaiting Review",
        description:
          "Palatial 7,000 sq ft villa in Karachi's most prestigious enclave. Private pool, home cinema, 6 en-suite bedrooms, smart home automation, and a triple-car garage. Ownership documents verified.",
        city: "Karachi",
        area: "Clifton Block 2",
        category: "villa",
        price: 125000000,
        beds: 6,
        baths: 7,
        size: 7000,
        floors: 3,
        yearBuilt: 2023,
        amenities: [
          "Swimming Pool",
          "Home Theater",
          "Smart Home",
          "Garden",
          "Servant Quarter",
          "Jacuzzi",
          "Parking",
          "CCTV",
        ],
        status: "submitted",
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 14,
        inquiries: 1,
      },
      IMG.villa[0],
    ),

    // [21] Rejected — Penthouse, Lahore (incomplete docs)
    makeProperty(
      21,
      {
        title: "Penthouse with Panoramic Views — DHA Phase 5 (Rejected)",
        description:
          "Sky-high 3,600 sq ft penthouse on the 18th floor. Two private terraces, a jacuzzi, and premium imported fittings. Listing was rejected due to incomplete ownership documents.",
        city: "Lahore",
        area: "DHA Phase 5",
        category: "penthouse",
        price: 78000000,
        beds: 4,
        baths: 4,
        size: 3600,
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
          "Ownership document verification is incomplete. Please resubmit with a verified NOC from DHA Lahore and a registered title deed copy.",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 31,
        inquiries: 0,
      },
      IMG.penthouse[0],
    ),

    // [22] Draft — House, Lahore, Johar Town
    makeProperty(
      22,
      {
        title: "Double-Storey House in Johar Town, Lahore — Draft",
        description:
          "5-marla double-storey house in Johar Town Phase 2 near main boulevard. Recently renovated kitchen and bathrooms. Draft listing — agent completing photos before submission.",
        city: "Lahore",
        area: "Johar Town",
        price: 19500000,
        beds: 3,
        baths: 3,
        size: 1125,
        floors: 2,
        yearBuilt: 2010,
        amenities: ["Parking", "CCTV", "Backup Generator"],
        status: "draft",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 0,
        inquiries: 0,
      },
      IMG.house[1],
    ),

    // [23] Approved House — Islamabad, DHA Phase 2
    makeProperty(
      23,
      {
        title: "Brand New 5-Bed House in DHA Islamabad Phase 2",
        description:
          "Freshly constructed home in DHA Islamabad Phase 2 with imported kitchen cabinets, underfloor heating in bathrooms, and a beautifully landscaped garden. Ready for immediate possession.",
        city: "Islamabad",
        area: "DHA Phase 2",
        price: 85000000,
        beds: 5,
        baths: 5,
        size: 4000,
        floors: 2,
        yearBuilt: 2024,
        amenities: [
          "Garden",
          "CCTV",
          "Backup Generator",
          "Servant Quarter",
          "Solar Panels",
          "Parking",
        ],
        status: "approved",
        tenantId: null,
        agentId: independentAgent._id,
        views: 103,
        inquiries: 7,
      },
      IMG.house[2],
    ),

    // [24] Approved Apartment — Karachi, North Nazimabad (for sale)
    makeProperty(
      24,
      {
        title: "2-Bed Apartment in North Nazimabad, Karachi",
        description:
          "Affordable yet modern 2-bed apartment on the 5th floor in North Nazimabad Block H. Newly painted, fresh fixtures, and a dedicated parking spot in the basement.",
        city: "Karachi",
        area: "North Nazimabad",
        category: "apartment",
        price: 12800000,
        beds: 2,
        baths: 2,
        size: 1100,
        floors: 1,
        yearBuilt: 2016,
        amenities: ["Elevator", "Parking", "CCTV", "Intercom"],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 47,
        inquiries: 4,
      },
      IMG.apartment[2],
    ),

    // [25] Approved Commercial — Lahore, MM Alam Road (for rent)
    makeProperty(
      25,
      {
        title: "Restaurant / Retail Space on MM Alam Road, Lahore",
        description:
          "High-visibility 2,500 sq ft ground-floor commercial space on Lahore's most lucrative retail strip. Full glass frontage, 15 ft ceiling height, and 3-phase power supply. Ideal for a restaurant or flagship store.",
        city: "Lahore",
        area: "Gulberg III",
        category: "commercial",
        listingType: "for_rent",
        price: 600000,
        beds: 0,
        baths: 2,
        size: 2500,
        floors: 1,
        yearBuilt: 2014,
        amenities: ["CCTV", "Central AC", "Backup Generator", "Parking"],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 88,
        inquiries: 9,
      },
      IMG.commercial[2],
    ),

    // [26] Approved Plot — Islamabad, Bahria Town (for sale)
    makeProperty(
      26,
      {
        title: "1-Kanal Residential Plot in Bahria Town, Islamabad",
        description:
          "Premium 1-kanal plot in Bahria Town Islamabad Phase 7 with clear title and possession. Corner-adjacent, all utilities on-street, and surrounded by park. Ideal for building a custom family home.",
        city: "Islamabad",
        area: "Bahria Town",
        category: "plot",
        price: 55000000,
        beds: 0,
        baths: 0,
        size: 4500,
        amenities: [
          "Electricity",
          "Gas",
          "Water Connection",
          "Gated Community",
          "Park Nearby",
        ],
        status: "approved",
        tenantId: null,
        agentId: independentAgent._id,
        views: 74,
        inquiries: 5,
      },
      IMG.plot[2],
    ),

    // [27] Approved House — Multan, Cantt (for rent)
    makeProperty(
      27,
      {
        title: "Furnished House in Multan Cantt — Available Immediately",
        description:
          "3-bed fully furnished house in the serene Multan Cantt area. All furniture included, AC in every room, and a beautiful garden maintained by the owner. Long-term tenants preferred.",
        city: "Multan",
        area: "Cantt",
        listingType: "for_rent",
        price: 90000,
        beds: 3,
        baths: 3,
        size: 2200,
        floors: 1,
        yearBuilt: 2014,
        amenities: [
          "Garden",
          "Parking",
          "CCTV",
          "Backup Generator",
          "Furnished",
        ],
        status: "approved",
        tenantId: null,
        agentId: independentAgent._id,
        views: 53,
        inquiries: 4,
      },
      IMG.house[3],
    ),

    // [28] Pending Featured Approval — House, Karachi, Bahria Town
    makeProperty(
      28,
      {
        title: "Luxury House in Bahria Town Karachi — Featured Pending",
        description:
          "Stunning 4,000 sq ft home in Bahria Town Karachi's Precinct 1. Contemporary design with a designer kitchen, walk-in wardrobes, home automation, and a private garden. Featured approval in progress.",
        city: "Karachi",
        area: "Bahria Town",
        price: 72000000,
        beds: 5,
        baths: 5,
        size: 4000,
        floors: 2,
        yearBuilt: 2022,
        amenities: [
          "Smart Home",
          "Garden",
          "Swimming Pool",
          "CCTV",
          "Servant Quarter",
          "Solar Panels",
          "Parking",
        ],
        status: "pending_featured_approval",
        featuredApprovalStatus: "pending",
        featuredRequested: true,
        featuredPreviousStatus: "approved",
        featuredRequestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tenantId: agency._id,
        agentId: agencyAgentOne._id,
        views: 92,
        inquiries: 6,
      },
      IMG.house[4],
    ),

    // [29] Approved Apartment — Faisalabad, Peoples Colony (for rent)
    makeProperty(
      29,
      {
        title: "Affordable 2-Bed Flat in Peoples Colony, Faisalabad",
        description:
          "Clean and well-maintained apartment in a 6-storey building in Peoples Colony. Split AC units in all rooms, tiled flooring, and a covered parking spot. Utilities billed separately.",
        city: "Faisalabad",
        area: "Peoples Colony",
        category: "apartment",
        listingType: "for_rent",
        price: 45000,
        beds: 2,
        baths: 2,
        size: 950,
        floors: 1,
        yearBuilt: 2015,
        amenities: ["Parking", "CCTV", "Backup Generator", "Central AC"],
        status: "approved",
        tenantId: agency._id,
        agentId: agencyAgentTwo._id,
        views: 38,
        inquiries: 3,
      },
      IMG.apartment[3],
    ),
  ];

  const properties = await Property.insertMany(propertyPayloads);
  console.log(
    `🏘  Inserted ${properties.length} properties (10 featured-approved)`,
  );

  // ── Inquiries ──────────────────────────────────────────────────────────────
  await Inquiry.insertMany([
    {
      propertyId: properties[0]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerOne._id,
      message:
        "I'd love to visit this weekend with my family. Can we schedule Saturday afternoon?",
      status: "agent_replied",
      lastReplyByRole: "agent",
      lastReplyAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      replies: [
        {
          senderId: agencyAgentOne._id,
          senderRole: "agent",
          message:
            "Absolutely! Saturday 3 PM works great. I'll be on-site to walk you through.",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ],
    },
    {
      propertyId: properties[3]._id,
      tenantId: agency._id,
      agentId: agencyAgentTwo._id,
      buyerId: buyerTwo._id,
      message:
        "Is this apartment still available? We'd like to book for next month. Are utilities included?",
      status: "agent_replied",
      lastReplyByRole: "agent",
      lastReplyAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      replies: [
        {
          senderId: agencyAgentTwo._id,
          senderRole: "agent",
          message:
            "Yes! Utilities are separate, typically PKR 8–12k/month. Happy to arrange a viewing.",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      ],
    },
    {
      propertyId: properties[12]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerTwo._id,
      message:
        "Please share the expected rental yield, transfer timeline, and whether the plot is corner or mid-block.",
      status: "open",
    },
    {
      propertyId: properties[5]._id,
      tenantId: agency._id,
      agentId: agencyAgentTwo._id,
      buyerId: buyerOne._id,
      message:
        "We're looking to relocate our 30-person team. Does this space support a server room fit-out?",
      status: "open",
    },
    {
      propertyId: properties[19]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerTwo._id,
      message:
        "Is the sea view really visible from inside? We'd love a viewing on a weekend morning.",
      status: "agent_replied",
      lastReplyByRole: "agent",
      lastReplyAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      replies: [
        {
          senderId: agencyAgentOne._id,
          senderRole: "agent",
          message:
            "Yes, on a clear day you get a partial sea view from the living room. Saturday morning works great!",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      ],
    },
  ]);

  // ── Appointments ──────────────────────────────────────────────────────────
  await Appointment.insertMany([
    {
      propertyId: properties[0]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerOne._id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      timeSlot: "03:00 PM",
      message: "Family visit — wife and parents joining.",
      status: "approved",
    },
    {
      propertyId: properties[13]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerTwo._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      timeSlot: "11:00 AM",
      message: "Would prefer a virtual tour first, then in-person.",
      status: "pending",
    },
    {
      propertyId: properties[11]._id,
      tenantId: null,
      agentId: independentAgent._id,
      buyerId: buyerOne._id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      timeSlot: "10:00 AM",
      message: "Morning visit to check natural light.",
      status: "approved",
    },
    {
      propertyId: properties[19]._id,
      tenantId: agency._id,
      agentId: agencyAgentOne._id,
      buyerId: buyerTwo._id,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      timeSlot: "09:00 AM",
      message: "Early morning sea-view check.",
      status: "pending",
    },
  ]);

  console.log("\n✅  Demo seed complete");
  console.log(`🔑  Password for all demo accounts: ${DEFAULT_PASSWORD}`);
  console.log("\nAccounts:");
  demoEmails.forEach((e) => console.log(`   - ${e}`));
  console.log(`\nProperties:    ${properties.length} total`);
  console.log(`               10 featured-approved`);
  console.log(`               12 approved (non-featured)`);
  console.log(`               1  pending_featured_approval`);
  console.log(`               1  submitted`);
  console.log(`               1  rejected`);
  console.log(`               1  draft`);
  console.log(`Availability:  ${availabilityDocs.length} rows`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
