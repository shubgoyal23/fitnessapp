import {app} from './app.js'
import connectDb from './db/connectDb.js'
import dotenv from 'dotenv'

dotenv.config()
const port = process.env.PORT

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`server Started at http://localhost:${port}`)
    })
}).catch((error) => {
    console.log('Error:: ', error)
})

