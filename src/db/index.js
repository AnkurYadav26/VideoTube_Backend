import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connect_db = async () => {
    try {
        const connect_instance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n mongoDB connected DB HOST  ${connect_instance.connection.host}`);

    } catch (error) {
        console.log('error in connecting', error);
        process.exit(1);
    }
}

export default connect_db;