// const Word = require("../../models/game/word.model");

// class WordRepository {
//   async create(data) {
//     return await Word.create(data);
//   }

//   async findAll() {
//     return await Word.find().populate('category').sort({ createdAt: -1 });
//   }

//   async findById(id) {
//     return await Word.findById(id).populate('category');
//   }

//   async findByCategory(categoryId) {
//     return await Word.find({ category: categoryId }).populate('category');
//   }

//   async findByWord(word) {
//     return await Word.findOne({ word: new RegExp('^' + word + '$', 'i') }).populate('category');
//   }

//   async updateById(id, data) {
//     return await Word.findByIdAndUpdate(id, data, { new: true }).populate('category');
//   }

//   async deleteById(id) {
//     return await Word.findByIdAndDelete(id);
//   }

//   async getRandomWordByCategory(categoryId) {
//     const words = await Word.find({ category: categoryId });
//     if (words.length === 0) return null;
//     const randomIndex = Math.floor(Math.random() * words.length);
//     return words[randomIndex];
//   }
// }

// module.exports = new WordRepository();
const Word = require("../../models/game/word.model");

class WordRepository {
  async create(data) {
    return await Word.create(data);
  }

  async findAll() {
    return await Word.find().populate('category').sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Word.findById(id).populate('category');
  }

  async findByCategory(categoryId) {
    return await Word.find({ category: categoryId }).populate('category');
  }

  async findByWord(word) {
    return await Word.findOne({ word: new RegExp('^' + word + '$', 'i') }).populate('category');
  }

  async updateById(id, data) {
    return await Word.findByIdAndUpdate(id, data, { new: true }).populate('category');
  }

  async deleteById(id) {
    return await Word.findByIdAndDelete(id);
  }

  async getRandomWordByCategory(categoryId) {
    const words = await Word.find({ category: categoryId }).populate('category');
    if (words.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }
}

module.exports = new WordRepository();