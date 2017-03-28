const express = require("express");
const app = express();
const path = require("path");

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
app.use(express.static(path.join(__dirname, "build")));
app.listen(9000, () => console.log("started"));
