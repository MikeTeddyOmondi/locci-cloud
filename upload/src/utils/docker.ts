import Docker from "dockerode";

// // Docker instance
// const docker = new Docker({
//     // socketPath: '/var/run/docker.sock'
// });

// docker.buildImage('./app-release.tar', {
//     t: 'locci-build'
// }, function (err, stream) {
//     if (err) return;

//     stream?.pipe(process.stdout, {
//         end: true
//     });

//     stream?.on('end', function () {
//         // done();
//         console.log('Build stream ended');
//     });
// });


// // Run container
// docker.createContainer({
//     Image: '',
//     Cmd: [],
//     HostConfig: {
//         Privileged: false
//     }
// }, function (err, container) {
//     container?.attach({
//         stream: true,
//         stdout: true,
//         stderr: true,
//         // tty: true
//     }, function (err, stream) {
//         if (err) return;

//         stream?.pipe(process.stdout);

//         container?.start(function (err, data) {
//             if (err) return;
//             console.log({ data });
//         });
//     });
// });

// Define the image name and tag
const imageName = "locci-build";
const imageTag = "latest";
const fullImageName = `${imageName}:${imageTag}`;

// port mapping
const portMapping = {
    "3000/tcp": [{ HostPort: "3838" }],
};

// docker.buildImage(
//     // { context: __dirname, src: ["Dockerfile", "index.js", "package.json"] },
//     './app-release.tar',
//     { t: fullImageName },
//     (err, stream) => {
//         if (err) {
//             console.error(err);
//             return;
//         }

//         docker.modem.followProgress(stream!, onFinished, onProgress);

//         // @ts-ignore
//         function onFinished(err, output) {
//             if (err) {
//                 console.error(err);
//             } else {
//                 console.log("Image built successfully:", output);

//                 // Run a container from the built image
//                 docker.createContainer(
//                     {
//                         Image: fullImageName,
//                         // Container name
//                         name: "locci-app-container",
//                         HostConfig: {
//                             PortBindings: portMapping,
//                         },
//                     },

//                     (err, container) => {
//                         if (err) {
//                             console.error(err);
//                             return;
//                         }

//                         container!.start((err, data) => {
//                             if (err) {
//                                 console.error(err);
//                             } else {
//                                 console.log("Container started successfully:", data);
//                             }
//                         });
//                     }
//                 );
//             }
//         }

//         function onProgress(event: any) {
//             console.log(event);
//         }
//     }
// );

import nodeDockerApi from 'node-docker-api'

const docker = new nodeDockerApi.Docker({ socketPath: '/var/run/docker.sock' })

// port mapping
const hostConfig = {
    // "3000/tcp": [{ HostPort: "3838" }],
    "PortBindings": { "3000/tcp": 3838 }
}; // "ExposedPorts": { "<port>/<tcp|udp>: {}" }

docker.container.create({
    Image: 'greenhouse-project-app',
    name: 'gap',
    Labels: {
        "labs.rancko.tenantId": "tenantId",
        "com.example.version": "1.0",
        "traefik.backend": "gap",
        "traefik.frontend.rule": "Host: gap.cloud.rancko.labs",
        "traefik.docker.network": "public",
        "traefik.port": "80"
    },
    ExposedPorts: { "3000/tcp": {} }, // { "<port>/<tcp|udp>: {}" } 
    // HostConfig: hostConfig, // { <port>/<protocol>: [{ "HostPort": "<port>" }] } // "PortBindings": { "22/tcp": [{ "HostPort": "11022" }] }
})
    .then((container) => container.start())
    // .then((container) => container.stop())
    // .then((container) => container.restart())
    // .then((container) => container.delete({ force: true }))
    .catch((error) => console.log(error.message))
