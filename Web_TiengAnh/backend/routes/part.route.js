// const router = require("express").Router();
// const Part = require("../models/part.model");

// router.get("/", async (req, res) => {
//   try {
//     const parts = await Part.find();
//     res.json({ data: parts });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     const part = await Part.create(req.body);
//     res.status(201).json(part);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;
const router = require("express").Router();
const Part = require("../models/part.model");
const auth = require("../middlewares/auth");

router.get("/", async (req, res) => {
  try {
    const parts = await Part.find();
    res.json({ data: parts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const part = await Part.create(req.body);
    res.status(201).json({ data: part });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
