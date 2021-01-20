import Operator from './Operator';
import * as dotenv from 'dotenv';

dotenv.config();

new Operator(process.env.BOT_TOKEN);
