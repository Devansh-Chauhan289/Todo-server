import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Task } from './src/model.js';
import { Server } from 'socket.io';
import redis, { createClient } from 'redis';
import { TaskRouter } from './src/route.js';
import cors from 'cors';





const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors : {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
})

io.on("connection", (socket) => {
    console.log("Connected to client",socket.id);   
    socket.on("add-task", async (data) => {
    try {
            await new Task({
                task: data,
            }).save();

            const updatedTasks = await Task.find();

            io.emit("task-added", updatedTasks);
        } catch (error) {
            console.log("error", error);
        }
    });

    socket.on("get-tasks", async () => {
        try {
            let data = await Task.find();
            socket.emit("tasks-fetched", data ? data : []);
        } catch (error) {
            console.log("error", error);
        }
    });
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST","DELETE"],
    credentials: true,
}))
app.use("/task",TaskRouter)



httpServer.listen(3000, () => {
    try {
        mongoose.connect("mongodb+srv://devanshchauhan2306:devansh289@todo-task.005ewlx.mongodb.net/assignment?retryWrites=true&w=majority&appName=Todo-Task")
        console.log("database connected");
    } catch (error) {
        return console.log("database not connected");
    }

    console.log("server is live");
})
  






