const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

connectDB();

app.use(express.json({ extended: false }));
app.use(cors());

app.use("/register", require("./routes/user"));
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/notes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
