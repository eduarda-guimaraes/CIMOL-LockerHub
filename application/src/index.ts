require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Locker = require('./models/Locker.model.ts');

const app = express();
app.use(express.json());
app.use(cors());

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Conectado ao MongoDB Atlas!')
    } catch (error) {
        console.error('Erro na conexão:', error)
    }
}

connectDB();

app.post('/armarios', async (req: any, res: any) => {
    try {
    const novoArmario = await Locker.create(req.body);
    res.json(novoArmario);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/armarios', async (req: any, res: any) => {
    try {
        const armario = await Locker.find();
        res.json(armario);
    } catch (error) {
        res.status(500).send(error);
    }
});
    
app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
