# Bundler

Source code - example
```rust
/// Bundler Service
///
/// Build from git source
/// Build & test the git project
/// Create an image of the build and push to OCI registry
use dagger_sdk::HostDirectoryOpts;

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let client = dagger_sdk::connect().await?;

    let host_source_dir = client.host().directory_opts(
        "./downloads/react-app",
        HostDirectoryOpts {
            exclude: Some(vec!["node_modules".into(), "ci/".into()]),
            include: None,
        },
    );

    // Caching Directories e.g node_modules
    // _____________________________
    // let host_source_dir = client.host().directory_opts(
    //     "./examples/caching/app",
    //     dagger_sdk::HostDirectoryOptsBuilder::default()
    //         .exclude(vec!["node_modules/", "ci/"])
    //         .build()?,
    // );
    // let node_cache = client.cache_volume("node");
    // let source = client
    //     .container()
    //     .from("node:18.18.2-alpine")
    //     .with_mounted_directory("/src", host_source_dir)
    //     .with_mounted_cache("/src/node_modules", node_cache);

    // let source = client
    //     .container()
    //     .from("node:18.18.2-alpine")
    //     .with_mounted_directory("/src", host_source_dir);

    // Build a React App using the dist folder
    let build = client
        // .git("https://github.com/MikeTeddyOmondi/bun-next-app")
        // .id()
        .container()
        .from("lipanski/docker-static-website:2.3.0")
        .build(host_source_dir.clone())
        // .with_mounted_cache("/src/node_modules", node_cache);
        .publish("docker.io/ranckosolutionsinc/pipeline-build") // oci.rancko.labs // docker-registry-host/build
        .await?;
    // .export("./build")
    // .as_service()
    // .endpoint_opts(dagger_sdk::ServiceEndpointOpts {
    //     port: Some(32323),
    //     scheme: Some("http"),
    // })
    // .await?;

    println!("Built/published image: {:#?}", build);

    // let runner = source
    //     .with_workdir("/src")
    //     .with_exec(vec!["npm", "install"]);

    //  let test = runner.with_exec(vec!["npm", "test", "--", "--watchAll=false"]);

    // let build_dir = test
    //     .with_exec(vec!["npm", "run", "build"])
    //     .directory("./build");

    // let _ = build_dir.export("./build");

    // let entries = build_dir.entries().await;

    // println!("build dir contents: \n {:?}", entries);

    // Publishing to OCI Registry
    // _____________________________
    // let ref_ = client
    //     .container()
    //     .from("nginx")
    //     .with_directory("/usr/share/nginx/html", build_dir)
    //     .publish(format!("ttl.sh/hello-dagger-sdk-{}:1h", rng.gen::<u64>()))
    //     .await?;

    // println!("published image to: {}", ref_);

    Ok(())
}
```