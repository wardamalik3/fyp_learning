import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

export const inngest = new Inngest({ id: "quickcart-next" });

//  CREATE
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const {
      id,
      first_name,
      last_name,
      image_url,
      email_addresses,
      primary_email_address_id,
    } = event.data;

    const email = email_addresses.find(
      (e) => e.id === primary_email_address_id
    )?.email_address;

    if (!email) {
      throw new Error("Primary email address not found.");
    }

    const userData = {
      _id: id,
      email,
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

//  UPDATE
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

//  DELETE
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

//INNGEST FUNCTION TO CREATE USER'S ORDER IN DATAABSE USING BATCH CONCEPTTT

export const createUserOrder = inngest.createFunction(
  {
    id: 'create-user-order',
    batchEvents: {
      maxSize: 5,
      timeout: '5s',
    },
  },
  { event: 'order/created' },
  async ({ events }) => {
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date,
      };
    });

    await connectDB()
    await Order.insertMany(orders)
    return {success:true,processed:orders.length};
  }
);
