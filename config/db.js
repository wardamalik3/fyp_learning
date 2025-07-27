import mongoose from 'mongoose'

///If I already connected to MongoDB before, use that."
// If not, create a new "cache" to remember the connection for next time.

let cached =global.mongoose
if(!cached)
{
  cached=global.mongoose={conn:null,promise:null}
}


//This is the function you’ll call every time you want to connect to the database.
async function connectDB() {
  if(cached.conn) //Hey, if I'm already connected — don’t connect again. Just use the existing one."
  {
    return cached.conn
  }
  

  ////"If I’m not already trying to connect, start the connection and save the promise (in-progress connection)."bufferCommands: false disables command queuing (recommended for serverless).It connects to: your-mongodb-uri/quickcart
  
  if(!cached.promise)
  {
    const opts=
    {
      bufferCommands:false
    }
    cached.promise=(await mongoose.connect(`${process.env.MONGODB_URI}/quickcart`,opts)).then(mongoose=>{return mongoose})

  }
  cached.conn=await cached.promise
  return cached.conn
}
export default connectDB



{/***When writing backend code in Next.js (like inside /api routes), the code can be run many times, especially during:

Development (because of hot reload)

Serverless deployments (e.g., Vercel runs it per request)

Shared environments (multi-request concurrency)

That’s why we:

Use global.mongoose to cache the connection

Use cached.promise to prevent multiple connects

This keeps things:

Efficient  (no repeated connections)

Safe  (no memory leaks or errors) 


MAJOR THINGSS:
The API routes in Next.js are not persistent by default

Each request can spin up a new instance of the handler (especially in dev or in serverless)

That means mongoose.connect(...) could be called multiple times — which MongoDB doesn’t like ❌




let cached = global.mongoose
What this does:
On the first request, it creates a single DB connection

Stores it in global.mongoose

On future requests, it just reuses the same connection

✅ Works great in:

Serverless functions (like on Vercel, Netlify)

Hot-reloading environments (like during npm run dev)

Shared hosting or dynamic server environments






*/
}