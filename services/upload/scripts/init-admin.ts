import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { Etcd3 } from "etcd3";

import config from "../src/config/config";

async function createAdminUser() {
  // @ts-ignore
  const etcd = new Etcd3({ hosts: config.etcd.hosts, auth: config.etcd.auth });

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@locci.cloud";
    const adminPassword = process.env.ADMIN_PASSWORD || "password";

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = {
      userId: uuidv4(),
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await etcd
      .put(`${config.etcdKeys.users}/${adminUser.userId}`)
      .value(JSON.stringify(adminUser));

    console.log("Admin user created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("Please change the password after first login.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    etcd.close();
  }
}

if (require.main === module) {
  createAdminUser();
}

export default createAdminUser;
