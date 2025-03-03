import express from 'express';
import { createMessage, deleteAllMessages, getAllMessages } from '../controller/message.controller.js';

const route = express.Router();

route.get('/all', getAllMessages);
route.post('/send', createMessage);
route.delete('/delete', deleteAllMessages);

export default route;