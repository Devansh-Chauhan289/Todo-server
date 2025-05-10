import express from 'express';
import { CreateTodo, deleteTodo, GetTodo } from './controller.js';

const TaskRouter = express.Router();

TaskRouter.post("/create",CreateTodo)
TaskRouter.get("/get",GetTodo)
TaskRouter.delete("/delete/:id",deleteTodo)

export {
    TaskRouter
}