import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "quickcart-next" });

// ✅ CREATE
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await step.run("connect-db", async () => {
      await connectDB();
    });

    await step.run("create-user", async () => {
      await User.create(userData);
    });
  }
);

// ✅ UPDATE
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await step.run("connect-db", async () => {
      await connectDB();
    });

    await step.run("update-user", async () => {
      await User.findByIdAndUpdate(id, userData);
    });
  }
);

// ✅ DELETE
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("connect-db", async () => {
      await connectDB();
    });

    await step.run("delete-user", async () => {
      await User.findByIdAndDelete(id);
    });
  }
);
