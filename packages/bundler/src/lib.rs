#![allow(unused_imports)]
#![allow(dead_code)]
#![allow(unused)]

use dagger_sdk::HostDirectoryOpts;
use dotenv::dotenv;
use node_bindgen::core::JSValue;
use node_bindgen::core::{
    val::{JsEnv, JsObject},
    NjError, TryIntoJs,
};
use node_bindgen::derive::node_bindgen;
use node_bindgen::sys::napi_value;
use std::env;

#[node_bindgen]
struct Bundler {
    project_id: String,
    // client:
}

#[node_bindgen]
impl Bundler {
    #[node_bindgen(constructor)]
    fn new(project_id: String) -> Self {
        Self {
            project_id: "".to_string(),
        }
    }

    // Get repoUrl & repoBranch
    // Get host dir path / github repo
    // get dagger client
    // run pipeline
    #[node_bindgen]
    async fn build_pipeline(repo_url: String, repo_branch: String) -> std::io::Result<()> {
        let client = dagger_sdk::connect()
            .await
            .expect("Failed to connect to Dagger engine!");

        // get host path
        let host_source_dir = client.host().directory_opts(
            "./downloads/react-app",
            HostDirectoryOpts {
                exclude: Some(vec!["node_modules".into(), "ci/".into()]),
                include: None,
            },
        );

        // "https://github.com/MikeTeddyOmondi/bun-next-app"
        let git_source_dir = client.host().directory_opts(
            repo_url,
            HostDirectoryOpts {
                exclude: None,
                include: None,
            },
        );

        // build project
        let repo = client
            .git("https://github.com/MikeTeddyOmondi/bun-next-app")
            .branch(repo_branch);

        // const project = client.git("https://github.com/MikeTeddyOmondi/bun-next-app").branch("main").tree()
        // const runner = await client.container()
        // .from("node:20")
        // .withDirectory("/src", project)
        // .withWorkdir("/src")
        // .withExec(["npm", "install"])

        let runner = client.container().from("node:20");

        runner
            .with_directory("/app", git_source_dir)
            .with_exec(vec!["npm", "run", "build"])
            .directory("./build");

        let build = client
            .container()
            .from("lipanski/docker-static-website:2.3.0");
        // .build(host_source_dir.clone());
        // .with_directory("/usr/share/nginx/html", repo);
        // .with_mounted_cache("/src/node_modules", node_cache)
        // .publish("docker.io/ranckosolutionsinc/pipeline-build") // oci.rancko.labs // docker-registry-host/build
        // .await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    // use super::*;

    use crate::Bundler;

    #[test]
    fn it_works() {
        // let result = sum(2, 2);
        // assert_eq!(result, 4);
        let bundler = Bundler::new("new_project".to_string());

        Bundler::build_pipeline("https://github.com/MikeTeddyOmondi/bun-next-app".to_string(), "main".to_string());
    }
}
