import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/history/:user1Id/:user2Id", async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    const query = `
      SELECT id, sender_id, receiver_id, content, timestamp
      FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC;
    `;
    const [rows] = await db.execute(query, [user1Id, user2Id, user2Id, user1Id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    res.status(500).json({ message: "Failed to fetch chat history." });
  }
});

export { router };