const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const WordCategory = require('../models/vocabulary/WordCategory.model');

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/DACN_Web_TiengAnh', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const categories = await WordCategory.find({}, 'name level wordCount words');
    categories.forEach(c => {
      console.log(`- ${c.name} (${c.level}): array_length=${c.words.length}, wordCount_field=${c.wordCount}`);
      if (c.words.length > 0) {
        console.log(`  Sample: ${c.words.slice(0, 5).join(', ')}...`);
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
checkDB();
