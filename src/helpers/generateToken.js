import jwt from 'jsonwebtoken'

const generateToken = (userEmail) => {
    const token = jwt.sign({ email: userEmail }, 'bluepixel', { expiresIn: '0.5h' })
    return token
}

export default generateToken