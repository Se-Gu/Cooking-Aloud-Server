const express = require("express");
const app = express();

app.get("/api/users", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});

app.get("/api/admins", (req, res) => {
  res.json({ admins: ["Serhat", "Özgür"] });
});

app.listen(5000, () => console.log("Server started on port 5000"));
