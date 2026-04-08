#!/usr/bin/env node

/**
 * Seed Test Data Script
 * Adds sample wishes to test the application
 * Run: node scripts/seed-test-data.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'wishes.json');

const sampleWishes = [
  {
    name: "Alice Chen",
    message: "It's been amazing working with you! Your positive energy and technical skills have made such a difference to our team. Wishing you all the best in your next adventure! 🚀",
  },
  {
    name: "Bob Martinez",
    message: "Thank you for all the late-night debugging sessions and your patience with my questions. You've been an incredible mentor. Good luck!",
  },
  {
    name: "Carol Johnson",
    message: "Going to miss our coffee chats and your hilarious Jira ticket comments. Keep being awesome! 😄",
  },
  {
    name: "David Kim",
    message: "Your attention to detail and commitment to quality has raised the bar for all of us. Best wishes for your new role!",
  },
  {
    name: "Emma Wilson",
    message: "It's rare to find someone who is both technically brilliant and such a great team player. You'll be missed!",
  },
  {
    name: "Frank Rodriguez",
    message: "Thanks for always being willing to help and share your knowledge. The team won't be the same without you. All the best! 🎉",
  },
  {
    name: "Grace Lee",
    message: "Your leadership on the service collection project was inspiring. Excited to see what you do next!",
  },
  {
    name: "Henry Brown",
    message: "From one spacemonkey to another - thanks for the memories and the laughs. Stay in touch!",
  },
];

function generateTestData() {
  const dataDir = path.dirname(DATA_FILE);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let data = {
    wishes: [],
    config: {
      farewellDate: process.env.NEXT_PUBLIC_FAREWELL_DATE || "2026-03-15T18:00:00Z",
      teamMemberName: process.env.NEXT_PUBLIC_TEAM_MEMBER_NAME || "Team Member",
    }
  };

  if (fs.existsSync(DATA_FILE)) {
    const existing = fs.readFileSync(DATA_FILE, 'utf-8');
    data = JSON.parse(existing);
  }

  const baseTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  sampleWishes.forEach((wish, index) => {
    const timestamp = baseTimestamp + (index * 60 * 60 * 1000);
    const reactions = Math.floor(Math.random() * 15);
    
    data.wishes.push({
      id: crypto.randomUUID(),
      name: wish.name,
      message: wish.message,
      timestamp: timestamp,
      reactions: reactions,
    });
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log('✅ Test data seeded successfully!');
  console.log(`📝 Added ${sampleWishes.length} sample wishes`);
  console.log(`📁 File: ${DATA_FILE}`);
  console.log('');
  console.log('To view: npm run dev and open http://localhost:3000');
}

generateTestData();
