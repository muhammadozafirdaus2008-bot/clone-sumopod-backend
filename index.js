app.post("/deploy", async (req, res) => {
  const { service_name, port, cpu, memory } = req.body;

  console.log("DEPLOY REQUEST:", req.body);

  return res.json({
    success: true,
    message: "Deploy success (dummy dulu)",
  });
});