require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

const MONGO_URL = process.env.MONGO_URL;

const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];
const categories = ["house", "apartment", "villa", "plot", "commercial", "penthouse"];
const listingTypes = ["for_sale", "for_rent"];

const locations = {
  Karachi: ["DHA Phase 6", "Clifton Block 2", "Gulshan-e-Iqbal", "Bahria Town", "North Nazimabad"],
  Lahore: ["DHA Phase 5", "Bahria Town", "Gulberg III", "Model Town", "Johar Town"],
  Islamabad: ["F-7", "F-10", "G-11", "Bahria Town", "DHA Phase 2"],
  Rawalpindi: ["Bahria Town", "DHA Phase 2", "Satellite Town", "PWD Housing", "Askari 11"],
  Faisalabad: ["Eden Gardens", "Canal Road", "Peoples Colony", "Gulberg", "Model Town"],
  Multan: ["DHA", "Bahria Town", "Cantt", "Gulgasht Colony", "Model Town"],
  Peshawar: ["Hayatabad", "University Town", "DHA", "Regi Model Town", "Warsak Road"],
  Quetta: ["Satellite Town", "Jinnah Town", "Samungli Road", "Brewery Road", "Zarghoon Road"],
};

const amenitiesList = [
  "Swimming Pool", "Gym", "Garden", "Parking", "Security", "Elevator",
  "Backup Generator", "CCTV", "Intercom", "Servant Quarter", "Study Room",
  "Prayer Room", "Balcony", "Central Heating", "Central AC", "Jacuzzi",
  "Steam Room", "Sauna", "Home Theater", "Smart Home", "Solar Panels"
];

const descriptions = [
  "Luxurious property with modern amenities and stunning architecture. Perfect for families looking for comfort and style.",
  "Spacious and well-maintained property in a prime location. Close to schools, hospitals, and shopping centers.",
  "Brand new construction with high-quality finishes. Ideal investment opportunity in a rapidly developing area.",
  "Elegant design with attention to detail. Features include marble flooring, wooden cabinets, and premium fixtures.",
  "Prime location property with excellent connectivity. Walking distance to main boulevard and public transport.",
  "Peaceful residential area with 24/7 security. Perfect for those seeking a quiet and safe neighborhood.",
  "Modern architecture with open floor plan. Large windows provide natural light throughout the day.",
  "Investment opportunity in a high-demand area. Rental yield potential is excellent.",
  "Family-friendly community with parks and recreational facilities nearby. Great for children.",
  "Newly renovated property with contemporary design. Move-in ready with all modern conveniences.",
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePrice(listingType, category) {
  if (listingType === "for_rent") {
    if (category === "apartment") return randomNumber(25000, 150000);
    if (category === "house") return randomNumber(50000, 300000);
    if (category === "villa") return randomNumber(150000, 500000);
    if (category === "commercial") return randomNumber(40000, 400000);
    return randomNumber(30000, 200000);
  } else {
    if (category === "apartment") return randomNumber(5000000, 25000000);
    if (category === "house") return randomNumber(10000000, 80000000);
    if (category === "villa") return randomNumber(30000000, 150000000);
    if (category === "plot") return randomNumber(3000000, 50000000);
    if (category === "commercial") return randomNumber(15000000, 200000000);
    if (category === "penthouse") return randomNumber(40000000, 120000000);
    return randomNumber(8000000, 60000000);
  }
}

function generateArea(category) {
  if (category === "apartment") return randomNumber(800, 2500);
  if (category === "house") return randomNumber(1500, 5000);
  if (category === "villa") return randomNumber(4000, 10000);
  if (category === "plot") return randomNumber(2000, 20000);
  if (category === "commercial") return randomNumber(1000, 8000);
  if (category === "penthouse") return randomNumber(3000, 8000);
  return randomNumber(1200, 4000);
}

function generateTitle(category, city, location) {
  const adjectives = ["Luxurious", "Modern", "Spacious", "Beautiful", "Elegant", "Premium", "Brand New", "Stunning"];
  const types = {
    house: "House",
    apartment: "Apartment",
    villa: "Villa",
    plot: "Plot",
    commercial: "Commercial Property",
    penthouse: "Penthouse"
  };
  return `${randomElement(adjectives)} ${types[category]} in ${location}, ${city}`;
}

async function seedProperties() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    let tenant = await Tenant.findOne();
    if (!tenant) {
      tenant = await Tenant.create({
        name: "Prime Realty Group",
        slug: "prime-realty-group",
        email: "info@primerealty.com",
        phone: "+92-300-1234567",
        status: "active",
      });
      console.log("✅ Created tenant:", tenant.name);
    }

    let agent = await User.findOne({ role: "agent" });
    if (!agent) {
      agent = await User.create({
        firstName: "Ahmed",
        lastName: "Khan",
        email: "agent@luxestate.com",
        phone: "+92-321-9876543",
        password: "Agent123",
        role: "agent",
        tenantId: tenant._id,
        status: "active",
        isVerified: true,
      });
      console.log("✅ Created agent:", agent.firstName, agent.lastName);
    }

    await Property.deleteMany({});
    console.log("✅ Cleared existing properties");

    const properties = [];

    for (let i = 0; i < 20; i++) {
      const city = randomElement(cities);
      const location = randomElement(locations[city]);
      const category = randomElement(categories);
      const listingType = randomElement(listingTypes);
      const price = generatePrice(listingType, category);
      const area = generateArea(category);
      const bedrooms = category === "plot" || category === "commercial" ? undefined : randomNumber(2, 6);
      const bathrooms = category === "plot" || category === "commercial" ? undefined : randomNumber(1, bedrooms || 3);
      const parking = randomNumber(1, 4);
      const yearBuilt = category === "plot" ? undefined : randomNumber(2015, 2024);
      const floors = category === "apartment" ? undefined : randomNumber(1, 3);
      
      const selectedAmenities = [];
      const amenityCount = randomNumber(5, 12);
      const shuffled = [...amenitiesList].sort(() => 0.5 - Math.random());
      for (let j = 0; j < amenityCount; j++) {
        selectedAmenities.push(shuffled[j]);
      }

      const title = generateTitle(category, city, location);
      const description = randomElement(descriptions);

      const coordinates = {
        lat: 24.8607 + (Math.random() - 0.5) * 0.5,
        lng: 67.0011 + (Math.random() - 0.5) * 0.5,
      };

      const property = {
        title,
        description,
        category,
        listingType,
        price,
        city,
        area: location,
        address: `${randomNumber(1, 999)}, Street ${randomNumber(1, 50)}, ${location}, ${city}`,
        size: area,
        beds: bedrooms,
        baths: bathrooms,
        parking,
        yearBuilt,
        floors,
        amenities: selectedAmenities,
        images: [
          { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", isCover: true },
          { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800" },
          { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" },
        ],
        coordinates,
        featuredUntil: Math.random() > 0.7 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        status: "approved",
        tenantId: tenant._id,
        agentId: agent._id,
      };

      properties.push(property);
    }

    await Property.insertMany(properties);
    console.log(`✅ Successfully seeded ${properties.length} properties`);

    const summary = await Property.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    console.log("\n📊 Properties by category:");
    summary.forEach(s => console.log(`   ${s._id}: ${s.count}`));

    const byCity = await Property.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    console.log("\n📍 Properties by city:");
    byCity.forEach(s => console.log(`   ${s._id}: ${s.count}`));

    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding properties:", error);
    process.exit(1);
  }
}

seedProperties();
