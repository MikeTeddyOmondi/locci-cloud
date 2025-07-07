import { Etcd3 } from "etcd3";
import config from "../config/config";

class EtcdService {
  protected etcd: Etcd3;

  constructor() {
    this.etcd = new Etcd3({
      hosts: config.etcd.hosts,
      auth: config.etcd.auth,
    });
  }

  async get(key: string) {
    const value = await this.etcd.get(key);
    return value ? JSON.parse(value) : null;
  }

  async put(key: string, value: {}) {
    await this.etcd.put(key).value(JSON.stringify(value));
  }

  async delete(key: string) {
    await this.etcd.delete().key(key);
  }

  async list(prefix: string) {
    const result = await this.etcd.getAll().prefix(prefix);
    const items = {};

    for (const [key, value] of Object.entries(result)) {
      items[key] = JSON.parse(value);
    }

    return items;
  }

  async watch(prefix: string, callback) {
    const watcher = await this.etcd.watch().prefix(prefix).create();

    watcher.on("put", (event) => {
      const key = event.key.toString();
      const value = JSON.parse(event.value.toString());
      callback("put", key, value);
    });

    watcher.on("delete", (event) => {
      const key = event.key.toString();
      callback("delete", key, null);
    });

    return watcher;
  }

  async transaction(operations) {
    const tx = this.etcd.if("key", "Value", "===", operations);

    operations.success.forEach((op) => {
      if (op.type === "put") {
        tx.then(this.etcd.put(op.key).value(JSON.stringify(op.value)));
      } else if (op.type === "delete") {
        tx.then(this.etcd.delete().key(op.key));
      }
    });

    return await tx.commit();
  }
}

export default new EtcdService();
