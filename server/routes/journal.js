const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// Helper function to calculate level from XP
const calculateLevel = (xp) => {
  // Level progression: Level 1 = 0-99 XP, Level 2 = 100-199 XP, etc.
  return Math.floor(xp / 100) + 1;
};

// GET /api/journals - Get all journal entries for authenticated user
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('journals');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Sort journals by creation date (newest first)
    const sortedJournals = user.journals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(sortedJournals);
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/journals - Create a new journal entry
router.post("/", verifyToken, async (req, res) => {
  try {
    const { content, date } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ msg: "Content is required" });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Create new journal entry
    const newJournal = {
      content: content.trim(),
      date: date ? new Date(date) : new Date()
    };

    // Add to user's journals array
    user.journals.push(newJournal);

    // Award XP for journal entry
    const oldXp = user.xp;
    const oldLevel = user.level;
    user.xp += 50;
    
    // Calculate new level
    const newLevel = calculateLevel(user.xp);
    user.level = newLevel;
    
    // Check for level up
    const leveledUp = newLevel > oldLevel;
    
    console.log(`Journal XP Reward: User ${user.username} earned +50 XP (${oldXp} -> ${user.xp})`);
    if (leveledUp) {
      console.log(`Level Up! User ${user.username} leveled up from ${oldLevel} to ${newLevel}`);
    }

    await user.save();

    // Get the newly created journal entry (last one added)
    const createdJournal = user.journals[user.journals.length - 1];
    
    // Return journal entry with XP reward info
    res.status(201).json({
      ...createdJournal.toObject(),
      xpReward: {
        earned: 50,
        totalXp: user.xp,
        oldLevel: oldLevel,
        newLevel: newLevel,
        leveledUp: leveledUp
      }
    });
  } catch (error) {
    console.error("Error creating journal:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/journals/:id - Update a journal entry
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ msg: "Content is required" });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Find the journal entry by ID
    const journalEntry = user.journals.id(id);
    
    if (!journalEntry) {
      return res.status(404).json({ msg: "Journal entry not found" });
    }

    // Update the journal entry
    journalEntry.content = content.trim();
    await user.save();

    res.json(journalEntry);
  } catch (error) {
    console.error("Error updating journal:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/journals/:id - Delete a journal entry
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Find the journal entry by ID
    const journalEntry = user.journals.id(id);
    
    if (!journalEntry) {
      return res.status(404).json({ msg: "Journal entry not found" });
    }

    // Remove the journal entry
    user.journals.pull(id);
    await user.save();

    res.json({ msg: "Journal entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting journal:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/journals/:id - Get a specific journal entry
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id).select('journals');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Find the journal entry by ID
    const journalEntry = user.journals.id(id);
    
    if (!journalEntry) {
      return res.status(404).json({ msg: "Journal entry not found" });
    }

    res.json(journalEntry);
  } catch (error) {
    console.error("Error fetching journal:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router; 