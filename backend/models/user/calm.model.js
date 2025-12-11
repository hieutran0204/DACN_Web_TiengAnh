const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const calmSchema = new Schema({
  roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  resource: { type: String, required: true },
  actions: [{ type: String }],
});

module.exports = mongoose.model("Calm", calmSchema);
