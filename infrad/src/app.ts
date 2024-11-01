import express from "express";

import IncusSocketAPI from "./lib/incus.js";

const app = express()

const incus = new IncusSocketAPI();

app.get("/containers", async (req, res) => {
  try {
    const containers: string = await incus.listContainers() as unknown as string;
    res.status(200).json(JSON.parse(containers));
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post("/create-containers", async (req, res) => {
  try {
    const response = await incus.createContainer("images:ubuntu/22.04", "ubuntu-locci");
    console.log({ response })
    res.status(200).json("container created");
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

export default app;

