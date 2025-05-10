import mongoose, { model, Schema } from "mongoose";

const TaskSchema = new Schema({
    task : { type: String, required: true },
})

const Task = model("Task",TaskSchema)

export {
    Task
}