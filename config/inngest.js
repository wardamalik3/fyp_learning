import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  {
    id: 'sync-user-from-clerk'},
    
  {
    event: 'clerk/user.created',
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await connectDB();
    await User.create(userData) // User is actually a variable that refers to userecommerce model in user.js file 

  }
);


//Inngest function to update the user to the dataabse User updates their info (like name, email, or profile pic) from the frontend UI provided by Clerk (either hosted or embedded).Clerk detects the update and fires the event: → clerk/user.updatedClerk sends a POST request (webhook) to your configured URL (e.g., /api/inngest) with the entire updated user object — not just the changed field.Even if the user updated only their image, Clerk sends the whole user object again.Inngest picks up that event and runs your function

export const syncUserUpdation= inngest.createFunction(
  {id:'update-user-from-clerk'},
  {event:'clerk/user.updated'},
  async({event})=>
  {
      const { id, first_name, last_name, email_address, image_url } = event.data;

    const userData = {
      _id: id, //(varibale from event and left side is db variable)
      email: email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };
    await connectDB()
    await User.findByIdAndUpdate(id,userData)
  }
)


//innges function to delete the user from database

export const syncUserDeletion =inngest.createFunction(
  {id:'delete-user-with-clerk'},
  {event:'clerk/user.deleted'},
  async({event})=>
  {
    const {id}=event.data



    await connectDB()
    await User.findByIdAndDelete(id)
    

  }

)
