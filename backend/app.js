import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Task } from './src/model.js';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { TaskRouter } from './src/route.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const httpServer = createServer(app);

const client = createClient({
    url : process.env.REDIS_URL
});

client.on("error", (err) => {
    console.error("Redis error:", err);
});

const REDIS_KEY = "FULLSTACK_TASK_DEVANSH_CHAUHAN"; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:5173","https://todo-task-client-jet.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
}));


app.use("/task", TaskRouter);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});


io.on("connection", (socket) => {
    console.log("connected to client", socket.id);

    socket.on("add-task", async (data) => {
        try {
            let taskData = await client.get(REDIS_KEY);
            let tasks = taskData ? JSON.parse(taskData) : [];

            tasks.push(data);
            console.log("Tasks", tasks);

            if (tasks.length >= 50) {
                for (const t of tasks) {
                    await new Task({ task: t.task }).save();
                }

                await client.set(REDIS_KEY, JSON.stringify([]));
                console.log("Tasks moved");

                
                const mongoTasks = await Task.find().sort({ _id: -1 });
                io.emit("tasks-fetched", mongoTasks);
            } else {
                await client.set(REDIS_KEY, JSON.stringify(tasks));
                console.log("Task stored in Redis:", tasks);

                io.emit("task-added", tasks);
            }
        } catch (error) {
            console.log("Error adding task:", error);
        }
    });

    socket.on("get-tasks", async () => {
        try {
            let taskData = await client.get(REDIS_KEY);
            let mongotasks = await Task.find()
            if (taskData) {
                taskData = JSON.parse(taskData);
                taskData = [...taskData, ...mongotasks];
            } else {
                taskData = mongotasks;
            }
            
            socket.emit("tasks-fetched", taskData ? taskData : []);
        } catch (error) {
            console.log("Error getting tasks:", error);
        }
    });

});

(async () => {
    try {
        await client.connect();
        console.log("Redis connected");

        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");

        httpServer.listen(3000, () => {
            console.log("Server is live on http://localhost:3000");
        });
    } catch (error) {
        console.error("Error occurred", error);
    }
})();
