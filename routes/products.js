const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
let moment = require("moment");

router.get("/api/search", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const min = req.query.min || 0
  const max = req.query.max || 1000000
  const query = `max=${max}&min=${min}`

  try {
    const products = await Product.find({
      title: { $regex: req.query.search, $options: "i" },
      price: {$lte: max, $gte: min}
    })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category")
      .exec();
    const count = await Product.count({
      title: { $regex: req.query.search, $options: "i" },
      price: {$lte: max, $gte: min}
    });
    res.json({allProducts: products, count: count, pages: Math.ceil(count / perPage), current: page})
    
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


router.get("/api/:slug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const min = req.query.min || 0
  const max = req.query.max || 1000000
  const query = `max=${max}&min=${min}`
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allProducts = await Product.find({ 
      category: foundCategory.id,
      price: {$lte: max, $gte: min}
     })
     .sort({[req.query.column]: req.query.sort})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Product.count({ category: foundCategory.id , price: {$lte: max, $gte: min}});
    res.json({allProducts: allProducts, count: count, pages: Math.ceil(count / perPage), current: page})
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});



router.get("/api/", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const min = req.query.min || 0
  const max = req.query.max || 1000000
  const query = `max=${max}&min=${min}`
  try {
    const products = await Product.find({price: {$lte: max, $gte: min}})
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Product.count({price: {$lte: max, $gte: min}});
    res.json({allProducts: products, count: count, pages: Math.ceil(count / perPage), current: page})
    
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


// GET: display all products
router.get("/", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const min = req.query.min || 0
  const max = req.query.max || 1000000
  const query = `max=${max}&min=${min}`
  try {
    const products = await Product.find({price: {$lte: max, $gte: min}})
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Product.count({price: {$lte: max, $gte: min}});

    res.render("shop/index", {
      pageName: "All Products",
      products,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/products/api?",
      pages: Math.ceil(count / perPage),
      slug: "All Products",
      query: query,
      search: req.query.search,
      max: max, 
      min: min
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


// GET: search box
router.get("/search", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const min = req.query.min || 0
  const max = req.query.max || 1000000
  const query = `max=${max}&min=${min}`

  try {
    const products = await Product.find({
      title: { $regex: req.query.search, $options: "i" },
      price: {$lte: max, $gte: min}
    })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category")
      .exec();
    const count = await Product.count({
      title: { $regex: req.query.search, $options: "i" },
      price: {$lte: max, $gte: min}
    });
    res.render("shop/index", {
      pageName: "Search Results",
      products,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/products/api/search?search=" + req.query.search+"&",
      slug: "Search Results",
      pages: Math.ceil(count / perPage),
      query: query,
      search: req.query.search,
      max: max, 
      min: min
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//GET: get a certain category by its slug (this is used for the categories navbar)
router.get("/:slug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const min = req.query.min || 0
  const max = req.query.max || 1000000
  const query = `max=${max}&min=${min}`
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allProducts = await Product.find({ 
      category: foundCategory.id,
      price: {$lte: max, $gte: min}
     })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Product.count({ category: foundCategory.id , price: {$lte: max, $gte: min}});

    res.render("shop/index", {
      pageName: foundCategory.title,
      currentCategory: foundCategory,
      products: allProducts,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/products/api/" + req.params.slug.toString()+"?",
      slug: req.params.slug.toString(),
      pages: Math.ceil(count / perPage),
      query: query,
      search: req.query.search,
      max: max, 
      min: min
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

// GET: display a certain product by its id
router.get("/:slug/:id", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  try {
    const product = await Product.findById(req.params.id).populate("category");
    res.render("shop/product", {
      pageName: product.title,
      product,
      successMsg,
      errorMsg,
      moment: moment,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});


module.exports = router;
