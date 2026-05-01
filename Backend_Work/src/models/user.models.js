import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // Searchable
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
            // type: String, // cloudnary url
            // public_id: String,  // i am using this for deleting old avatar from cloudinary
            // required: true,
        },
        coverImage: {
            url: {
                type: String
            },
            public_id: { 
                type: String
            }
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    }, { timestamps: true }
)


// its is mongoose middleware (Hook) runs before saving the user
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return //( ← guard clause)  // isModified is a mongoose Method for preventing rehashing
    this.password = await bcrypt.hash(this.password, 10)

}) // use Classic function only // hash round

// Custom method
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)  // this.password=> db hashed password and password=> internally before comparing this hashed with same salt so it compare
}

// Both Are JWT Token this are also method

userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
        {  //  Given Payloads
            _id: this._id,  // usually sends only id from here
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { //  payload
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




export const User = mongoose.model("User", userSchema)