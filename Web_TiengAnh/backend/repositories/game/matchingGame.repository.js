// const MatchingGame = require("../../models/game/matchingGame.model");
// const mongoose = require("mongoose");
// class MatchingGameRepository {
//   async create(data) {
//     return await MatchingGame.create(data);
//   }

//   async findAll() {
//     return await MatchingGame.find()
//       .populate('category', 'name description')
//       .sort({ createdAt: -1 });
//   }

//   async findById(id) {
//     return await MatchingGame.findById(id)
//       .populate('category', 'name description');
//   }

//   async findByCategory(categoryId) {
//     return await MatchingGame.find({ 
//       category: categoryId,
//       status: 'active' 
//     }).populate('category', 'name');
//   }

//   async findActiveByCategory(categoryId) {
//   return await MatchingGame.find({ 
//     category: new mongoose.Types.ObjectId(categoryId),  // ĐÚNG: convert sang ObjectId
//     status: 'active' 
//   }).lean();  // .lean() để trả về plain object
// }


//   async updateById(id, data) {
//     return await MatchingGame.findByIdAndUpdate(id, data, { 
//       new: true,
//       runValidators: true 
//     }).populate('category', 'name description');
//   }

//   async deleteById(id) {
//     return await MatchingGame.findByIdAndDelete(id);
//   }

//   async countByCategory(categoryId) {
//     return await MatchingGame.countDocuments({ 
//       category: categoryId,
//       status: 'active' 
//     });
//   }
// }

// module.exports = new MatchingGameRepository();
const MatchingGame = require("../../models/game/matchingGame.model");
const mongoose = require("mongoose"); // ← THÊM DÒNG NÀY

class MatchingGameRepository {
  async create(data) {
    return await MatchingGame.create(data);
  }

  async findAll() {
    return await MatchingGame.find()
      .populate('category', 'name description')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await MatchingGame.findById(id)
      .populate('category', 'name description');
  }

  async findByCategory(categoryId) {
    return await MatchingGame.find({ 
      category: categoryId,
      status: 'active' 
    }).populate('category', 'name');
  }

  async findActiveByCategory(categoryId) {
    return await MatchingGame.find({ 
      category: categoryId,  // ← BỎ new mongoose.Types.ObjectId() đi
      status: 'active' 
    }).populate('category', 'name').lean();
  }

  async updateById(id, data) {
    return await MatchingGame.findByIdAndUpdate(id, data, { 
      new: true,
      runValidators: true 
    }).populate('category', 'name description');
  }

  async deleteById(id) {
    return await MatchingGame.findByIdAndDelete(id);
  }

  async countByCategory(categoryId) {
    return await MatchingGame.countDocuments({ 
      category: categoryId,
      status: 'active' 
    });
  }
}

module.exports = new MatchingGameRepository();