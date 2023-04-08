const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/users", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});

app.get("/api/admins", (req, res) => {
  res.json({ admins: ["Serhat", "Özgür"] });
});

app.listen(8080, () => console.log("Server started on port 5000"));
