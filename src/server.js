const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const { sequelize } = require('./models');

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database connected!');
});
