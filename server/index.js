// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");

// dotenv.config();

// const authRoutes = require("./routes/auth");
// const eventRoutes = require("./routes/events");
// const bookingRoutes = require("./routes/bookings");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/events", eventRoutes);
// app.use("/api/bookings", bookingRoutes);

// // Database Connection
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://localhost:27017/evora")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error("MongoDB Connection Error:", err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

// Serve React/Vite frontend
const frontendPath = path.join(__dirname, "../client/dist");

app.use(express.static(frontendPath));

// Handle frontend routes (Express 5 compatible)
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      console.error("Frontend index.html not found:", err.message);
      res.status(404).send("Frontend build not found. Please build the client.");
    }
  });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/evora")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
