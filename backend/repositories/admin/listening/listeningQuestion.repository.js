
const Listening = require("../../../models/listeningQuestion.model");

exports.getAll = async () => await Listening.find().populate("section");

exports.getById = async (id) =>
  await Listening.findById(id).populate("section");

exports.create = async (data) => await Listening.create(data);

exports.update = async (id, data) =>
  await Listening.findByIdAndUpdate(id, data, { new: true });

exports.remove = async (id) => await Listening.findByIdAndDelete(id);

exports.getPaginated = async (page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "section": { $regex: search, $options: "i" } } // Also search section maybe?
    ];
  }

  const [data, total] = await Promise.all([
    Listening.find(query)
      .populate("section", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listening.countDocuments(query),
  ]);

  return { data, total };
};

exports.countTotal = async () => await Listening.countDocuments();

exports.getBySectionId = async (sectionId) =>
  await Listening.find({ section: sectionId }).populate("section", "name");
