const { Sequelize } = require("sequelize");
const config = require("config");

const connectionString = "postgresql://postgres:Sgovi@5697@db.stoodyrzrqsehmhrkuzj.supabase.co:5432/postgres";

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',      
  logging: false,         
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();  
    console.log("PostgreSQL Connected to Supabase");  
  } catch (error) {
    console.error("PostgreSQL Connection error:", error.message); 
    process.exit(1);  
  }
};

module.exports = { sequelize, connectDB };
