// using promise to handle async errors in express
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error)=> next(error));
    }
}

export {asyncHandler}

// By using try catch, we can handle errors in our async functions and pass them to the next middleware

// const asyncHandler= () => {}
// const asyncHandler = () => () => {}
// const asyncHandler = () => async () =>{}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message 
//         })
//     }
// }