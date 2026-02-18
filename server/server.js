import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"; 

dotenv.config();

const app = express();

/* ================= CORS CONFIG ================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

/* ================= MONGODB CONNECTION ================= */
mongoose
  .connect("mongodb+srv://forprojectwork001:projectwork001@faceverification.b19uz89.mongodb.net/faceVerification")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });

mongoose.connection.on("error", (err) => {
  console.log("MongoDB Runtime Error:", err);
});

/* ================= SCHEMA ================= */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  descriptor: {
    type: [Number],
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🚀 Face Auth Backend Running Successfully");
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  try {
    const { name, descriptor } = req.body;

    if (!name || !descriptor) {
      return res.status(400).json({ msg: "Missing name or descriptor" });
    }

    const user = new User({ name, descriptor });
    await user.save();

    res.status(200).json({ msg: "✅ Registered Successfully" });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ msg: "Register Error" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor) {
      return res.status(400).json({ msg: "Descriptor missing" });
    }

    const users = await User.find();

    for (let user of users) {
      if (!user.descriptor) continue;

      const dist = euclidean(user.descriptor, descriptor);

      if (dist < 0.5) {
        return res.json({ msg: "✅ Login Success: " + user.name });
      }
    }

    res.json({ msg: "❌ Face Not Matched" });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= DISTANCE FUNCTION ================= */
function euclidean(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;

  return Math.sqrt(
    d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0)
  );
}

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
