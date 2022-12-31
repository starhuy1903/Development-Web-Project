const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Category = require("../models/category");
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
connectDB();

const seedDB = async () => {
  const seedCateg = async (titleStr) => {
    try {
      const categ = await new Category({ title: titleStr });
      await categ.save();
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const closeDB = async () => {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  };
  await seedCateg("Backpacks");
  await seedCateg("Briefcases");
  await seedCateg("Mini Bags");
  await seedCateg("Large Handbags");
  await seedCateg("Travel");
  await seedCateg("Totes");
  await seedCateg("Purses");
  await closeDB();
};

seedDB();
