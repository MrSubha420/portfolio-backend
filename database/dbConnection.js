import mongoose from "mongoose";

const dbConnection = ()=> {
   mongoose.connect(process.env.MONGO_URI ,
      {dbName:"MYPORTFOLIO"
}).then(()=> {
   console.log("connected to database.")
}).catch((error)=> {
   console.log(`ERROR Occour when connected to database : ${error}`)
});
};


export default dbConnection;