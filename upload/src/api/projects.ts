// @ts-ignore
import { connect, Client } from "@dagger.io/dagger";
import { v4 as uuidv4 } from "uuid";
import express from "express";
// import fs from "node:fs/promises";
// import path from "node:path";
import { createTempBuildDir } from "../utils/folders.js";

const router = express.Router();

type ProjectsResponse = Object;

router.post<{}, ProjectsResponse>("/react", async (req, res) => {
  let { repoUrl, repoBranch } = req.body;
  console.log({ repoUrl });

  // React app build pipeline
  // import dagger
  // get repo branch "main"
  // get repo url "https://github.com/MikeTeddyOmondi/bun-next-app"

  // base Images "node:20"
  const nodeBaseImage = "node:20";

  try {
    connect(
      async (client: Client) => {
        const project = client.git(repoUrl).branch(repoBranch).tree();

        const runner = client
          .container()
          .from(nodeBaseImage)
          .withDirectory("/src", project)
          .withWorkdir("/src")
          .withExec(["npm", "install"]);

        // create temp directory
        const { tempDir } = await createTempBuildDir();

        await runner
          .withExec(["npm", "run", "build"])
          .directory("dist/")
          .export(tempDir);

        const distFolder = client.host().directory(tempDir);

        const prodImage = client
          .container()
          .from("docker.io/lipanski/docker-static-website:2.4.0")
          .withDirectory("/", distFolder)

        await prodImage.export("./app-release.tar");

        const id = uuidv4();
        // const tag = `ttl.sh/locci-${tempDir}-${id}:1h`;
        const tag = `ttl.sh/locci-${id}:1h`;

        await prodImage.publish(tag)
        console.log({ imageTag: tag })

        // // get reference to the local project
        // const source = client.host().directory(".", { exclude: ["node_modules/"] })

        // const nodeVersion = "16"
        // // mount cloned repository into Node image
        // const runner = client
        //     .container().from(`node:${nodeVersion}`)
        //     .withDirectory("/src", source)
        //     .withWorkdir("/src")
        //     .withExec(["npm", "install"])

        // // run tests
        // await runner.withExec(["npm", "test", "--", "--watchAll=false"]).sync()

        // // build application using specified Node version
        // // write the build output to the host
        // await runner
        //     .withExec(["npm", "run", "build"])
        //     .directory("build/")
        //     .export(`./build-node-${nodeVersion}`)
      },
      { LogOutput: process.stdout }
    );

    // return res.json({ array: ["😀", "😳", "🙄"], imageTag: tag });
    return res.json({ success: "😀", message: "pipeline initiated" });
  } catch (error: any) {
    console.log({ pipelineBuildError: error.message })
    return res.status(500).json({ pipelineBuildError: "😀" });
  }
});

export default router;
