import { Sequelize } from "sequelize"

// conect to database using sequelize
const sequelize = new Sequelize('auction_db', 'dev', '31415',{
    host: '31.220.97.169',
    dialect: 'postgres',
    port: 5450,
})

// function to know if connection is established
export const getConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log('Connection has been established successfully.')
    }
    catch (err) {
        console.error('Unable to connect to the database:', err)
    }
}

// export sequelize by default
export default sequelize