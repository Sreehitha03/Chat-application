import express from "express";
import db from "../db.js"; 

const router = express.Router();

// Get all registered users (excluding current user, filtered on frontend)
router.get("/", async (req, res) => {
  try {
    const query = "SELECT id, username, avatar FROM users ORDER BY username ASC";
    const [rows] = await db.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// router.get('/:id', async (req, res) => {
//   const userId = req.params.id;
//   try {
//       const [rows] = await pool.execute('SELECT id, username, email, avatar FROM users WHERE id = ?', [userId]);
//       if (rows.length > 0) {
//           res.json(rows[0]); 
//       } else {
//           res.status(404).json({ message: 'User not found' });
//       }
//   } catch (error) {
//       console.error('Error fetching single user:', error);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// });

export { router };