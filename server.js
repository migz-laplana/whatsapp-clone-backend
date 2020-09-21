import dotenv from 'dotenv'
dotenv.config()


//IMPORTS---------------------
import express from "express" //change "type" to "modules" in package.json
import mongoose from "mongoose"
import Message from "./models/dbMessages.js"
import User from "./models/Users.js"
import Pusher from "pusher"
import cors from "cors"

//APP CONFIGURATION-----------
const app = express();
const port = process.env.PORT || 9000;
//Pusher!!
const pusher = new Pusher({
    appId: '1076183',
    key: '341d561a31269ac91d68',
    secret: '954e8bbfcc56e649b40c',
    cluster: 'ap1',
    encrypted: true
});

//MIDDLEWARE----------------------
app.use(express.json());
app.use(cors());

//---lmao using CORS so commenting this out
// app.use((req, res, next) => {
//     //NO SECURITY: allowing headers from any origin
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     next();
// })


//DB CONFIG----------------------
mongoose.connect(process.env.DATABASE_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection
db.once("open", () => {
    console.log("DB Connected")
    const msgCollection = db.collection("messages");
    const changeStream = msgCollection.watch();  //for listening to pusher & realtime stuff

    changeStream.on("change", (change) => {


        //if its a document addt, trigger pusher
        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {  //two params used in App.js!
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                sender: messageDetails.sender,
            })
        } else {
            console.log("Error triggering Pusher");
        }
    })
});


//API ROUTES------------------------
app.get("/", (req, res) => res.status(200).send("hello world"))

app.get("/api/v1/messages/sync", (req, res) => {
    Message.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post("/api/v1/messages/new", (req, res) => {
    const dbMessage = req.body

    Message.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.post("/api/v1/users/new", (req, res) => {
    const anonUser = req.body

    User.create(anonUser, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

// app.get("/api/v1/users/getuser", (req, res) => {
//     User.find()
// })

//LISTENER---------------------------
app.listen(port, () => console.log("Server started!"));