import { Task } from "./model.js";



const CreateTodo = async(req,res) => {

    const {task} = req.body;
    try {
        if(!task){
            return res.status(400).json({
                msg: "Title is required"
            })
        }
        const newtask = await Task({
            task
        })
        await newtask.save()
        return res.status(200).json({
            msg: "Task Created",
            task: newtask
        })
    } catch (error) {
        console.log("error",error)
        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
}

const deleteTodo = async(req,res) => {

    try {
        await Task.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            msg: "Task Deleted"
        })
    } catch (error) {
        console.log("error",error)
        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
}

const GetTodo = async(req,res) => {
    try {
        const tasks = await Task.find()
        return res.status(200).json({
            msg: "Tasks Fetched",
            tasks
        })
    } catch (error) {
        console.log("error",error)
        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
}

export {
    CreateTodo,
    GetTodo,
    deleteTodo
}