import {asyncHandler} from "../utils/asyncHandler.js";
const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
    res.status(200).json({
        message: "OK - User registered successfully"
    })
})

export {registerUser};