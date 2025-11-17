// Import required modules
import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
//import fetch from "node-fetch";
import morgan from "morgan";

// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json()); // allows JSON request bodies

// HTTP request logger
app.use(morgan("dev"));

// Enable CORS for all routes
app.use(cors());

//initialize fetch for environments that don't have it natively
//const response = await fetch("http://localhost:8000/analyze/123");
//const result = await response.json();

// Connect to Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Basic test route
app.get("/", (req, res) => {
  res.send("✅ Smart Order API is running");
});

// Example GET route: Fetch all orders
app.get("/api/orders", async (req, res) => {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Example POST route: Create a new order
app.post("/api/orders", async (req, res) => {
  const { customer_name, order_text } = req.body;

  // Insert new order into Supabase table 'orders'
  const { data, error } = await supabase
    .from("orders")
    .insert([{ customer_name, order_text }])
    .select();

  if (error) {
    console.error("❌ Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  res
    .status(201)
    .json({ message: "Order created successfully", order: data[0] });
});

// Example Delete route: Delete an order by ID
app.delete("/api/orders/:id", async (req, res) => {
  //console.log("DELETE route hit:", req.params.id);
  const { id } = req.params;

  const { data, error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    console.error("❌ Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: `Order ${id} deleted successfully` });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Smart Order API running on port ${PORT}`);
});
