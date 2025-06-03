import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"})) // Limit the request body size to 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})) // Limit the URL-encoded data size to 16kb
app.use(express.static("public")) // Serve static files from the "public" directory
app.use(cookieParser())

export default {app}