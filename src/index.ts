import express from "express";

const port = 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ name: "john doe" });
});
app.post("/");

app.listen(port);

export default app;
