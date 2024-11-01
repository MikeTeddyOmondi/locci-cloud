// @ts-ignore
import { connect, Client } from "@dagger.io/dagger"
import { v4 as uuidv4 } from "uuid";
import Docker from "dockerode";

// initialize Dagger client
connect(async (client: Client) => {
    const project = client.git("https://github.com/MikeTeddyOmondi/bun-next-app").branch("main").tree()

    const runner = await client.container()
        .from("node:20")
        .withDirectory("/src", project)
        .withWorkdir("/src")
        .withExec(["npm", "install"])


    await runner.withExec(["npm", "run", "build"])
        .directory("dist/")
        .export("./app-dist")

    const distFolder = client.host().directory("app-dist");

    const prodImage = await client.container()
        .from("docker.io/lipanski/docker-static-website:2.4.0")
        .withDirectory("/", distFolder)
        .export("./app-release.tar")

    const id = uuidv4()
    const tag = `ttl.sh/dagger-${id}:1h`

    // await prodImage.publish(tag)

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



}, { LogOutput: process.stdout })
