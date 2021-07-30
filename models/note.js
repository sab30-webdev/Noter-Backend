const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  notes: [
    {
      title: {
        type: String,
        required: [true, "Please add a title"],
      },
      description: {
        type: String,
        required: [true, "Please add a description"],
      },
    },
  ],
});

module.exports = mongoose.model("note", NoteSchema);
