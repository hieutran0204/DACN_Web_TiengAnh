// const mongoose = require("mongoose");
// const wordRepository = require("../../repositories/game/word.repository");

// class WordService {
//   isValidObjectId(id) {
//     return mongoose.Types.ObjectId.isValid(id);
//   }

//   shuffleWord(word) {
//     const arr = word.split('');
//     for (let i = arr.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [arr[i], arr[j]] = [arr[j], arr[i]];
//     }
//     return arr.join('');
//   }

//   async createWord(data) {
//     // Check if word already exists
//     const existingWord = await wordRepository.findByWord(data.word);
//     if (existingWord) {
//       throw new Error("Word already exists");
//     }
//      if (!data.category || !this.isValidObjectId(data.category)) {
//     throw new Error("Category ID không hợp lệ");
//   }
//     return await wordRepository.create(data);
//   }

//   async getAllWords() {
//     return await wordRepository.findAll();
//   }

//   async getWordById(id) {
//     if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
//     const word = await wordRepository.findById(id);
//     if (!word) throw new Error("Word not found");
//     return word;
//   }

//   async getWordsByCategory(categoryId) {
//     if (!this.isValidObjectId(categoryId)) throw new Error("Invalid Category ID");
//     return await wordRepository.findByCategory(categoryId);
//   }

//   async getRandomWordByCategory(categoryId) {
//     if (!this.isValidObjectId(categoryId)) throw new Error("Invalid Category ID");
//     const word = await wordRepository.getRandomWordByCategory(categoryId);
//     if (!word) throw new Error("No words found in this category");
    
//     return {
//       _id: word._id,
//       shuffledWord: this.shuffleWord(word.word),
//       hint: word.hint,
//       category: word.category
//     };
//   }

//   async updateWord(id, data) {
//     if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    
//     // Check if word is being updated and if it already exists
//     if (data.word) {
//       const existingWord = await wordRepository.findByWord(data.word);
//       if (existingWord && existingWord._id.toString() !== id) {
//         throw new Error("Word already exists");
//       }
//     }
    
//     const word = await wordRepository.updateById(id, data);
//     if (!word) throw new Error("Word not found");
//     return word;
//   }

//   async deleteWord(id) {
//     if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
//     const word = await wordRepository.deleteById(id);
//     if (!word) throw new Error("Word not found");
//     return true;
//   }
// }

// module.exports = new WordService();
const mongoose = require("mongoose");
const wordRepository = require("../../repositories/game/word.repository");

class WordService {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  shuffleWord(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  async createWord(data) {
    // Check if word already exists
    const existingWord = await wordRepository.findByWord(data.word);
    if (existingWord) {
      throw new Error("Word already exists");
    }
    
    // Check mảng category
    if (!Array.isArray(data.category) || data.category.length === 0) {
      throw new Error("Category không hợp lệ (phải là mảng ít nhất 1 ID)");
    }
    data.category.forEach(id => {
      if (!this.isValidObjectId(id)) throw new Error(`Category ID không hợp lệ: ${id}`);
    });

    return await wordRepository.create(data);
  }

  async getAllWords() {
    return await wordRepository.findAll();
  }

  async getWordById(id) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    const word = await wordRepository.findById(id);
    if (!word) throw new Error("Word not found");
    return word;
  }

  async getWordsByCategory(categoryId) {
    if (!this.isValidObjectId(categoryId)) throw new Error("Invalid Category ID");
    return await wordRepository.findByCategory(categoryId);
  }

  async getRandomWordByCategory(categoryId) {
    if (!this.isValidObjectId(categoryId)) throw new Error("Invalid Category ID");
    const word = await wordRepository.getRandomWordByCategory(categoryId);
    if (!word) throw new Error("No words found in this category");
    
    return {
      _id: word._id,
      shuffledWord: this.shuffleWord(word.word),
      hint: word.hint,
      originalWord: word.word,
      meaning: word.meaning,
      usage: word.usage,
      example: word.example,
      category: word.category
    };
  }

  async updateWord(id, data) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    
    // Check if word is being updated and if it already exists
    if (data.word) {
      const existingWord = await wordRepository.findByWord(data.word);
      if (existingWord && existingWord._id.toString() !== id) {
        throw new Error("Word already exists");
      }
    }

    // Check mảng category nếu có
    if (data.category) {
      if (!Array.isArray(data.category) || data.category.length === 0) {
        throw new Error("Category không hợp lệ (phải là mảng ít nhất 1 ID)");
      }
      data.category.forEach(id => {
        if (!this.isValidObjectId(id)) throw new Error(`Category ID không hợp lệ: ${id}`);
      });
    }

    const word = await wordRepository.updateById(id, data);
    if (!word) throw new Error("Word not found");
    return word;
  }

  async deleteWord(id) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid ID");
    const word = await wordRepository.deleteById(id);
    if (!word) throw new Error("Word not found");
    return true;
  }
}

module.exports = new WordService();