import UserService from "./services/userService.js";
import WaitlistService from "./services/waitlistService.js";

async function main() {
  const userService = new UserService();
  // Create users
  const user3 = await userService.createUser({
    name: "Foo",
    email: "foo@example.com",
  });
  const user4 = await userService.createUser({
    name: "Bar",
    email: "bar@example.com",
  });
  console.log("Users after creation:", await userService.getAllUsers());
  // Update a user
  await userService.updateUser(5, { name: "Mary", email: "mary@example.com" });
  console.log("User 5 after update:", await userService.getUserById(5));

  // Delete a user
  await userService.deleteUser(4);
  console.log("Users after deletion:", await userService.getAllUsers());

  const waitlistService = new WaitlistService();

  const newWaitlist = await waitlistService.createWaitlist({
    email: "alice@gmail.com",
  });
  
  console.log({newWaitlist})

}

main().catch(console.error);
