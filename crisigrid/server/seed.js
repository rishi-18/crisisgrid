const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User, Camp, Need, Volunteer, Alert, Assignment } = require('./models');

const seedData = async () => {
  try {
    console.log('🚀 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear Collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Camp.deleteMany({});
    await Need.deleteMany({});
    await Volunteer.deleteMany({});
    await Alert.deleteMany({});
    await Assignment.deleteMany({});
    console.log('✨ Database cleared.');

    // 2. Hash Password for all users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 3. Create Users
    console.log('👥 Creating users...');
    const users = await User.create([
      { name: 'Admin Coordinator 1', email: 'coord1@crisisgrid.com', passwordHash, role: 'coordinator' },
      { name: 'Admin Coordinator 2', email: 'coord2@crisisgrid.com', passwordHash, role: 'coordinator' },
      { name: 'Delhi Operator', email: 'op.delhi@crisisgrid.com', passwordHash, role: 'operator' },
      { name: 'Jaipur Operator', email: 'op.jaipur@crisisgrid.com', passwordHash, role: 'operator' },
      { name: 'Lucknow Operator', email: 'op.lucknow@crisisgrid.com', passwordHash, role: 'operator' },
      { name: 'Agra Operator', email: 'op.agra@crisisgrid.com', passwordHash, role: 'operator' },
    ]);
    console.log('✅ Users created.');

    const [c1, c2, opD, opJ, opL, opA] = users;

    // 4. Create Camps
    console.log('🏕️ Creating camps...');
    const camps = await Camp.create([
      {
        name: 'Delhi Northern Relief Center',
        zone: 'Zone-1',
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        status: 'stable',
        capacity: 1000,
        currentOccupancy: 450,
        operatorId: opD._id,
        inventory: [
          { resourceType: 'food', quantity: 5000, unit: 'kg', threshold: 1000 },
          { resourceType: 'water', quantity: 8000, unit: 'liters', threshold: 2000 },
          { resourceType: 'medicine', quantity: 50, unit: 'kits', threshold: 100 }, // LOW STOCK!
          { resourceType: 'shelter', quantity: 200, unit: 'tents', threshold: 50 }
        ]
      },
      {
        name: 'Jaipur Western Hub',
        zone: 'Zone-2',
        location: { type: 'Point', coordinates: [75.7873, 26.9124] },
        status: 'strained',
        capacity: 800,
        currentOccupancy: 750,
        operatorId: opJ._id,
        inventory: [
          { resourceType: 'food', quantity: 800, unit: 'kg', threshold: 1000 }, // LOW STOCK!
          { resourceType: 'water', quantity: 5000, unit: 'liters', threshold: 2000 },
          { resourceType: 'medicine', quantity: 150, unit: 'kits', threshold: 100 },
          { resourceType: 'shelter', quantity: 40, unit: 'tents', threshold: 50 } // LOW STOCK!
        ]
      },
      {
        name: 'Lucknow Central Support',
        zone: 'Zone-3',
        location: { type: 'Point', coordinates: [80.9462, 26.8467] },
        status: 'critical',
        capacity: 500,
        currentOccupancy: 490,
        operatorId: opL._id,
        inventory: [
          { resourceType: 'food', quantity: 200, unit: 'kg', threshold: 500 }, // CRITICAL!
          { resourceType: 'water', quantity: 500, unit: 'liters', threshold: 1000 }, // CRITICAL!
          { resourceType: 'medicine', quantity: 20, unit: 'kits', threshold: 50 },
          { resourceType: 'shelter', quantity: 10, unit: 'tents', threshold: 20 }
        ]
      },
      {
        name: 'Agra Heritage Zone Camp',
        zone: 'Zone-4',
        location: { type: 'Point', coordinates: [78.0081, 27.1767] },
        status: 'stable',
        capacity: 600,
        currentOccupancy: 200,
        operatorId: opA._id,
        inventory: [
          { resourceType: 'food', quantity: 3000, unit: 'kg', threshold: 1000 },
          { resourceType: 'water', quantity: 4000, unit: 'liters', threshold: 2000 },
          { resourceType: 'medicine', quantity: 200, unit: 'kits', threshold: 100 },
          { resourceType: 'shelter', quantity: 100, unit: 'tents', threshold: 50 }
        ]
      }
    ]);
    console.log('✅ Camps created.');

    const [campD, campJ, campL, campA] = camps;

    // Update operators with their assigned camps
    await User.findByIdAndUpdate(opD._id, { assignedCampId: campD._id });
    await User.findByIdAndUpdate(opJ._id, { assignedCampId: campJ._id });
    await User.findByIdAndUpdate(opL._id, { assignedCampId: campL._id });
    await User.findByIdAndUpdate(opA._id, { assignedCampId: campA._id });

    // 5. Create Volunteers
    console.log('🤝 Seeding volunteers...');
    await Volunteer.create([
      { name: 'Rajesh Kumar', skills: ['medical', 'rescue'], status: 'deployed', currentCampId: campD._id, location: { type: 'Point', coordinates: [77.2, 28.6] } },
      { name: 'Priya Sharma', skills: ['logistics'], status: 'unassigned', location: { type: 'Point', coordinates: [77.1, 28.5] } },
      { name: 'Amit Singh', skills: ['rescue'], status: 'in_transit', assignedCampId: campJ._id },
      { name: 'Sonal Verma', skills: ['medical'], status: 'deployed', currentCampId: campL._id },
      { name: 'Vikram Seth', skills: ['cooking', 'logistics'], status: 'unassigned', location: { type: 'Point', coordinates: [80.9, 26.8] } },
      { name: 'Anjali Gupta', skills: ['medical'], status: 'deployed', currentCampId: campJ._id },
      { name: 'Rahul Dev', skills: ['rescue'], status: 'unassigned', location: { type: 'Point', coordinates: [78.0, 27.1] } },
      { name: 'Meera Das', skills: ['logistics'], status: 'deployed', currentCampId: campA._id }
    ]);

    // 6. Create Needs
    console.log('🆘 Seeding needs...');
    await Need.create([
      { campId: campL._id, zone: 'Zone-3', resourceType: 'food', quantityNeeded: 500, urgency: 'critical', status: 'open', raisedBy: opL._id },
      { campId: campL._id, zone: 'Zone-3', resourceType: 'water', quantityNeeded: 1000, urgency: 'critical', status: 'open', raisedBy: opL._id },
      { campId: campJ._id, zone: 'Zone-2', resourceType: 'food', quantityNeeded: 200, urgency: 'medium', status: 'partial', raisedBy: opJ._id },
      { campId: campD._id, zone: 'Zone-1', resourceType: 'medicine', quantityNeeded: 50, urgency: 'medium', status: 'open', raisedBy: opD._id },
      { campId: campJ._id, zone: 'Zone-2', resourceType: 'shelter', quantityNeeded: 20, urgency: 'low', status: 'open', raisedBy: opJ._id },
      { campId: campA._id, zone: 'Zone-4', resourceType: 'water', quantityNeeded: 500, urgency: 'low', status: 'fulfilled', raisedBy: opA._id }
    ]);

    // 7. Create Alerts
    console.log('🚨 Seeding alerts...');
    await Alert.create([
      { campId: campL._id, zone: 'Zone-3', type: 'low_stock', resourceType: 'food', message: 'CRITICAL: Food running out in Lucknow!', severity: 'critical', resolved: false },
      { campId: campD._id, zone: 'Zone-1', type: 'low_stock', resourceType: 'medicine', message: 'Warning: Medicine kits below threshold in Delhi.', severity: 'warning', resolved: false },
      { campId: campJ._id, zone: 'Zone-2', type: 'overcapacity', message: 'Jaipur camp is approaching maximum capacity.', severity: 'critical', resolved: true },
      { campId: campA._id, zone: 'Zone-4', type: 'no_volunteers', message: 'Agra camp has no medical specialists assigned.', severity: 'warning', resolved: true }
    ]);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
