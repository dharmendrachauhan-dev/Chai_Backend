export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

// This function automatically catches errors from async code so your app doesn’t crash.

































// const asia = () => {}
// const asiaHI = (fn) => () => {};
// function with in function
// High order function


// const asyncHandler = (fn) => async (err, req, res, next) => {
//     try {
//         await fn(err, req, res, next)    
//     } catch (error) {
//         res.status(err.code || 400).json({
//             success: false,
//             message: err.message
//         })
//     }
// }