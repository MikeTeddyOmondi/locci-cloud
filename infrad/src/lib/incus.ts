// import https, { Agent } from 'https';
// import { spawn } from "child_process";
// import fetch from 'node:fetch';

// class IncusClient {
//   private agent: Agent;
//   private baseUrl: string;
//   // private trustToken: string;

//   constructor(options) {
//     this.baseUrl = options.baseUrl || "https://192.168.0.1:8443";
//     this.agent = new https.Agent({
//       cert: Buffer.from(options.certPath).toString(),
//       key: Buffer.from(options.keyPath).toString(),
//       rejectUnauthorized: false, // Only use this in development!
//     });
//     // this.trustToken = options.trustToken;
//     console.log({
//       cert: Buffer.from(options.certPath).toString(),
//       key: Buffer.from(options.keyPath).toString(),
//       rejectUnauthorized: false, // Only use this in development!
//     });
//   }

//   async request(method: string, path: string, body: Object | null = null) {
//     const url = `${this.baseUrl}${path}`;
//     const options = {
//       method,
//       agent: this.agent,
//       headers: {
//         "Content-Type": "application/json",
//         // Authorization: `Bearer ${this.trustToken}`,
//       },
//     };

//     if (body) {
//       // @ts-ignore
//       options.body = JSON.stringify(body);
//     }

//     const response = await fetch(url, options);
//     console.log({ response });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return response.json();
//   }

//   async listCerts() {
//     return this.request("GET", "/1.0/certificates");
//   }

//   async createContainer(name, config) {
//     return this.request("POST", "/1.0/containers", { name, ...config });
//   }

//   async startContainer(name) {
//     return this.request("PUT", `/1.0/containers/${name}/state`, {
//       action: "start",
//     });
//   }

//   async stopContainer(name) {
//     return this.request("PUT", `/1.0/containers/${name}/state`, {
//       action: "stop",
//     });
//   }

//   async deleteContainer(name) {
//     return this.request("DELETE", `/1.0/containers/${name}`);
//   }
// }

// export default IncusClient;

// --------- USING UNIX SOCKET --------------
import { spawn } from 'child_process';

class IncusSocketAPI {
  private baseCommand: string;

  constructor() {
    this.baseCommand = 'incus';
  }

  async execute(args: any) {
    return new Promise((resolve, reject) => {
      console.log(args)
      const command = spawn(this.baseCommand, args);
      console.log({ command });
      let stdout = '';
      let stderr = '';

      command.stdout.on('data', (data: string) => {
        console.log({ stdout: data })
        stdout += data.toString();
      });

      command.stderr.on('data', (data: string) => {
        console.log({ stderr: data })
        stderr += data.toString();
      });

      command.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(`Incus command failed with code ${code}: ${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async listContainers() {
    return this.execute(['list', '--format', 'json']);
  }

  async createContainer(image: string, name: string) {
    return this.execute(['launch', image, name, '--force-local']);
  }

  async startContainer(name: string) {
    return this.execute(['start', name]);
  }

  async stopContainer(name: string) {
    return this.execute(['stop', name]);
  }

  async deleteContainer(name: string) {
    return this.execute(['delete', name]);
  }

  async getContainerInfo(name: string) {
    return this.execute(['info', name, '--format', 'json']);
  }

  async executeInContainer(name: string, command: string[]) {
    return this.execute(['exec', name, '--', ...command]);
  }

  async createSnapshot(containerName: string, snapshotName: string) {
    return this.execute(['snapshot', containerName, snapshotName]);
  }

  async restoreSnapshot(containerName: string, snapshotName: string) {
    return this.execute(['restore', containerName, snapshotName]);
  }

  async listNetworks() {
    return this.execute(['network', 'list', '--format', 'json']);
  }

  async createNetwork(name: string, config = {}) {
    const args = ['network', 'create', name];
    Object.entries(config).forEach(([key, value]) => {
      args.push(`${key}=${value}`);
    });
    return this.execute(args);
  }

  // Add more methods as needed...
}

export default IncusSocketAPI;
