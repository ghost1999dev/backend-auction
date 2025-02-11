// import package to hash password
import crypto from "crypto"

// function to hash password
const hashPassword = (password) => {
    return crypto.createHash("sha256").update(password).digest("hex")
}

export default hashPassword