// import { User } from "../models/userModel.js";

// export const register = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password } = req.body;
//         if (!firstName || !lastName || !email || !password) {
//             res.status(400).json({
//                 success: false,
//                 message: "All Field are required"
//             })
//         }
//         const user = await User.findOne({ email })
//         if (user) {
//             res.status(400).json({
//                 success: false,
//                 message: "User already Exists"
//             })
//         }
//         const newUser = await User.create({
//             firstName,
//             lastName,
//             email,
//             password
//         })
//         await newUser.save()
//         return res.status(201).json({
//             success: success,
//             message: "User register Successfully",
//             user: newUser
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,

//         })
//     }
// }

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        firstName,
        lastName,
        email
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
