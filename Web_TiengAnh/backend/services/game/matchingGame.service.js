const mongoose = require("mongoose");
const matchingGameRepository = require("../../repositories/game/matchingGame.repository");
const categoryRepository = require("../../repositories/game/category.repository");

class MatchingGameService {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  // SỬA 1: DÙNG data.category, KHÔNG DÙNG categoryId
  async createMatchingGame(data) {
    if (!this.isValidObjectId(data.category)) {
      throw new Error("Category ID không hợp lệ");
    }

    const category = await categoryRepository.findById(data.category);
    if (!category) {
      throw new Error("Category không tồn tại");
    }

    if (data.words.length !== 4) {
      throw new Error("Phải có đúng 4 từ");
    }
    if (data.meanings.length !== 4) {
      throw new Error("Phải có đúng 4 nghĩa");
    }

    return await matchingGameRepository.create(data);
  }

  async getAllMatchingGames() {
    return await matchingGameRepository.findAll();
  }

  async getMatchingGameById(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }
    const game = await matchingGameRepository.findById(id);
    if (!game) throw new Error("Matching game không tồn tại");
    return game;
  }

  async getMatchingGamesByCategory(categoryId) {
    if (!this.isValidObjectId(categoryId)) {
      throw new Error("Category ID không hợp lệ");
    }
    return await matchingGameRepository.findByCategory(categoryId);
  }

  // SỬA 2: CONVERT categoryId → ObjectId TRƯỚC KHI TRUY VẤN
  async getRandomGameByCategory(categoryId) {
  console.log("Received categoryId:", categoryId); // Debug
  console.log("Is valid?", this.isValidObjectId(categoryId)); // Debug
  
  if (!this.isValidObjectId(categoryId)) {
    throw new Error("Category ID không hợp lệ");
  }

    // CHUYỂN ĐỔI THÀNH ObjectId
    // const objectId = new mongoose.Types.ObjectId(categoryId);

    // const games = await matchingGameRepository.findActiveByCategory(objectId);
      const games = await matchingGameRepository.findActiveByCategory(categoryId);

    
    if (games.length === 0) {
      throw new Error("Chưa có game nào cho category này");
    }

    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex];
  }

  async updateMatchingGame(id, data) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }

    if (data.category) {
      if (!this.isValidObjectId(data.category)) {
        throw new Error("Category ID không hợp lệ");
      }
      const category = await categoryRepository.findById(data.category);
      if (!category) throw new Error("Category không tồn tại");
    }

    if (data.words && data.words.length !== 4) {
      throw new Error("Phải có đúng 4 từ");
    }
    if (data.meanings && data.meanings.length !== 4) {
      throw new Error("Phải có đúng 4 nghĩa");
    }

    const game = await matchingGameRepository.updateById(id, data);
    if (!game) throw new Error("Matching game không tồn tại");
    return game;
  }

  async deleteMatchingGame(id) {
    if (!this.isValidObjectId(id)) {
      throw new Error("ID không hợp lệ");
    }
    
    const game = await matchingGameRepository.deleteById(id);
    if (!game) throw new Error("Matching game không tồn tại");
    return true;
  }
}

module.exports = new MatchingGameService();