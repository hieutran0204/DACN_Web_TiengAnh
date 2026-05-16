const WordCategory = require("../../models/vocabulary/WordCategory.model");
const axios = require("axios");

// GET ALL CATEGORIES
// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [categories, total] = await Promise.all([
      WordCategory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WordCategory.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ONE CATEGORY
exports.getCategoryById = async (req, res) => {
  try {
    const category = await WordCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE CATEGORY (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, level, description, image } = req.body;
    const newCategory = new WordCategory({ name, level, description, image });
    await newCategory.save();
    res.json({ success: true, data: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE CATEGORY (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const { name, level, description, image } = req.body;
    const updatedCategory = await WordCategory.findByIdAndUpdate(
      req.params.id,
      { name, level, description, image },
      { new: true }
    );
    res.json({ success: true, data: updatedCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE CATEGORY (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    await WordCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ADD/REMOVE WORDS (Admin)
exports.updateWords = async (req, res) => {
  try {
    const { words, action } = req.body; // action: 'add' or 'remove'
    const category = await WordCategory.findById(req.params.id);
    
    if (!category) return res.status(404).json({ error: "Category not found" });

    if (action === 'add') {
      // Add only unique words
      const newWords = words.filter(w => !category.words.includes(w));
      category.words.push(...newWords);
    } else if (action === 'remove') {
      category.words = category.words.filter(w => !words.includes(w));
    }

    category.wordCount = category.words.length;
    await category.save();
    
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DICTIONARY LOOKUP PROXY
exports.lookupWord = async (req, res) => {
  try {
    const word = req.params.word;
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    res.json({ success: true, data: response.data });
  } catch (err) {
    if (err.response && err.response.status === 404) {
         return res.status(404).json({ success: false, error: "Word not found in dictionary" });
    }
    console.error("Dictionary Proxy Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch word definition" });
  }
};

// SEED DATA
exports.seedCategories = async (req, res) => {
  try {
    // Check if data exists
    const count = await WordCategory.countDocuments();
    if (count > 0) return res.json({ message: "Data already exists" });

    const seedData = [
      {
        name: "Basic Conversational Words",
        level: "Beginner",
        wordCount: 200,
        words: ["hello", "goodbye", "please", "thank", "sorry", "yes", "no", "friend", "family", "food", "water", "help", "name", "home", "work"],
        description: "Essential vocabulary for everyday conversations",
        image: "https://cdn-icons-png.flaticon.com/512/2065/2065224.png" // Simple chat icon
      },
      {
        name: "Business English Vocabulary",
        level: "Intermediate",
        wordCount: 350,
        words: ["meeting", "presentation", "negotiation", "contract", "deadline", "budget", "client", "strategy", "marketing", "investment", "colleague", "proposal", "revenue", "agenda"],
        description: "Professional terms and corporate communication",
        image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Briefcase icon
      },
      {
        name: "Academic English",
        level: "Advanced",
        wordCount: 450,
        words: ["analyze", "hypothesis", "significant", "methodology", "theoretical", "empirical", "conclusion", "evaluate", "implication", "validity", "framework", "perspective"],
        description: "University-level vocabulary for essays and presentations",
        image: "https://cdn-icons-png.flaticon.com/512/3426/3426653.png" // Graduation cap icon
      },
      {
        name: "IELTS Vocabulary",
        level: "Advanced",
        wordCount: 500,
        words: ["detrimental", "inevitable", "ubiquitous", "mitigate", "exacerbate", "prominent", "fluctuate", "stabilize", "plunge", "soar", "correlation", "discrepancy"],
        description: "High-frequency words for IELTS exam preparation",
        image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png" // Book icon
      },
      {
        name: "Technology & Innovation",
        level: "Intermediate",
        wordCount: 300,
        words: ["algorithm", "database", "interface", "software", "hardware", "encryption", "bandwidth", "cybersecurity", "innovation", "digital", "virtual", "automation"],
        description: "Modern tech terms and concepts",
        image: "https://cdn-icons-png.flaticon.com/512/4257/4257483.png" // Chip/Tech icon
      }
    ];

    await WordCategory.insertMany(seedData);
    res.json({ success: true, message: "Seeded vocabulary categories" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
