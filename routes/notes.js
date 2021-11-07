const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const { check, validationResult } = require("express-validator");

//create note/notes
router.post(
  "/notes",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { title, description, dueDate, completed } = req.body;

    let newNote = {
      user: req.user.id,
      notes: [{ title, description, dueDate, completed }],
    };

    try {
      let note = await Note.findOne({ user: req.user.id });

      if (note) {
        note.notes.unshift(newNote.notes[0]);
      } else {
        note = new Note(newNote);
      }

      await note.save();
      res.json(note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error here");
    }
  }
);

//get all notes of a user
router.get("/notes", auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      user: req.user.id,
    });

    return res.status(200).json({ success: true, notes: note.notes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// get note by id
router.get("/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.find(
      { "notes._id": req.params.id },
      { "notes.$": 1 }
    );

    return res.status(200).json({ success: true, note: note[0].notes[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Modify note
router.put("/notes/:id", auth, async (req, res) => {
  const { title, description, completed } = req.body;

  if (title === "" || description === "") {
    return res.status(200).json({ success: false, note: {} });
  }

  try {
    const note = await Note.findOne({
      user: req.user.id,
    });

    if (note.notes.filter((note) => note.id === req.params.id).length === 0) {
      return res.status(401).json({ msg: "Note doesn't exist" });
    }

    note.notes.filter((n) => n.id === req.params.id)[0].title = title;
    note.notes.filter((n) => n.id === req.params.id)[0].description =
      description;
    note.notes.filter((n) => n.id === req.params.id)[0].completed = completed;

    const response = await note.save();

    const updatedNote = response.notes.filter(
      (note) => note.id === req.params.id
    )[0];

    return res.status(200).json({ success: true, note: updatedNote });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//delete note
router.delete("/notes/:id", auth, async (req, res) => {
  try {
    await Note.updateOne(
      {},
      { $pull: { notes: { _id: req.params.id } } },
      { multi: true }
    );

    return res.status(200).json({ success: true, note: {} });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//Delete User account and the associated notes
router.delete("/notes", auth, async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.user.id });
    await Note.findOneAndDelete({ user: req.user.id });

    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }

    return res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
