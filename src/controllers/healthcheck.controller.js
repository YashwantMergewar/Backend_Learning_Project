import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
   return res
   .status(200)
   .json(new ApiResponse(200, null, {
    success: true,
    message: "The server is healthy and in running condition...!"
   }))
})

export {
    healthcheck
    }