import ProductService from "../services/product.service";
import ProductUtils from "../utils/product.util";
import Cloudinary from "../configs/cloudinary.config";
import ProductFactory from "../factory/product.factory";
import AuctionLogModel from "../models/auctionlog.model";
import AuctionLogService from "../services/aution.service";
import UserServices from "../services/user.service";

import PRODUCT_CONSTANTS from "../constants/product.constant";
import { UserNotFoundException, NotHavePermissionException } from "../exceptions/user.exception";



/**
 * controller home page
 */
const ProductController = {};

let { categories, priceMethod, productStatus } = PRODUCT_CONSTANTS;

/**
 * 
 */
ProductController.getProducts = async (req, res) => {
    let {category, price, userId} = req.query;
    let name = req.query.q;
    let categoryCode = ProductUtils.retrieveCatByCode(category);
    let criteria = ProductFactory.create(
        name,
        categoryCode,
        price,
        userId
    );
    let products = [];
    let numberBiddingProd = 0;
    
    if(!req.user){
        return res.render('main/products/products', {
            products,
            categories,
            numberBiddingProd,
            data: req.flash("data"),
            user: req.user,
            title: 'SOAS. - List Products'
        });
    }

    numberBiddingProd = await AuctionLogService.countNumberOfAuctions(req.user._id);

    let phone = req.user.phone;
    let city = req.user.personalInfo.address.city;
    let district = req.user.personalInfo.address.district;

    if(!phone || !city || !district){
        let arrErr = ["You must input important information"];
        req.flash("must-enter", arrErr);
        return res.render("main/profile/profile",{
            data: req.flash("data"),
            user: req.user,
            categories,
            numberBiddingProd,
            errors: req.flash("must-enter"),
            title: "profile"
        })
    }

    products = await ProductService.find(criteria);
   

    return res.render('main/products/products', {
        products,
        categories,
        data: req.flash("data"),
        user: req.user,
        numberBiddingProd,
        title: 'SOAS. - List Products'
    });
}

ProductController.getAddProduct = async (req, res) => {
    return res.render("main/products/addProduct", {
        categories,
        data: req.flash("data"),
        numberBiddingProd: await AuctionLogService.countNumberOfAuctions(req.user._id),
        user: req.user,
        title: 'SOAS. - Winning Products'
    });
}

/**
 * Adding new product
 *
 * @todo set default value for each attribute of req.body
 * @todo validate date time
 * @todo save categories and bidding methods into database
 *       instead hard-code by constants
 */
ProductController.postProduct = async (req, res) => {
    try {
        let image = "" || process.env.PRODUCT_DEFAULT_IMG;
        if (req.file) {
            await Cloudinary.uploadSingle(req.file.path)
            .then(data => {
                image = data.url;
            });
        }

        let product = {
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            aucStartTime: req.body.startTime || Date.now,
            aucEndTime: req.body.endTime,
            price: req.body.price,
            image: image,
            categories: {
                name: ProductUtils.retrieveCatByCode(req.body.category)
            },
            tags: null,
            priceStep: req.body.priceStep,
            priceMethod: ProductUtils.retrievePriceMethod(req.body.priceMethod) || "INCR",
            status: 1,
            nextPrice: parseInt(req.body.price) + parseInt(req.body.priceStep),
            userId: req.user._id
        }

        await ProductService.save(product);
    } catch (error) {
        console.log(error);
    }

    return res.redirect("/products");
}

/**
 * get detail of product
 */
ProductController.getDetail = async (req, res) => {
    const { id } = req.params;
    let product = await ProductService.findProductById(id);
    let seller = await UserServices.findUserById(product.userId);
    let currentHighestPriceProduct  = await AuctionLogService.findHighestPrice(product._id);
    return res.render("main/products/details", {
        categories,
        product,
        seller: seller[0].username,
        data: req.flash("data"),
        user: req.user,
        userWithHighestPrice: currentHighestPriceProduct[0].userId,
        numberBiddingProd: await AuctionLogService.countNumberOfAuctions(req.user._id),
        title: 'SOAS. - '+product.name + ' 😍'
    })
}

/**
 * bidding managements
 * Selecting all products have userId == current userId
 * show All products
 */
ProductController.getManage = async (req, res) => {
    let currentUser = req.user._id;
    let numberBiddingProd = await AuctionLogService.countNumberOfAuctions(req.user._id);
    let products = await AuctionLogService.findNewestBiddingProducts(currentUser);
    
    return res.render("main/products/manage", {
        products,
        categories,
        data: req.flash("data"),
        numberBiddingProd,
        user: req.user,
        title: "auctions | 😎"
    })
}

ProductController.productManegements = async (req, res) => {
    let sellerId = req.user._id;
    let products = await ProductService.findProductsByUserId(sellerId);
    return res.render("main/products/productsManagement", {
        products,
        categories,
        data: req.flash("data"),
        numberBiddingProd: await AuctionLogService.countNumberOfAuctions(sellerId),
        user: req.user,
        title: "manage products| 🤑"
    })
}

/**
 * Update product
 */
ProductController.updateProducts = async (req, res) => {
    let prodductId = req.params.id;
    let product = await ProductService.findProductById(prodductId);
    if(product.userId != req.user._id)
        throw new NotHavePermissionException('You have no permission for this operation');
    
    return res.render('main/products/update', {
        product,
        categories,
        data: req.flash("data"),
        numberBiddingProd: await AuctionLogService.countNumberOfAuctions(req.user._id),
        user: req.user,
        title: 'Edit |'+product.name
    })
}

/**
 * 
 */
ProductController.postUpdateProducts = async (req, res) => {
    try {
        let image = "" || process.env.PRODUCT_DEFAULT_IMG;
        if (req.file) {
            await Cloudinary.uploadSingle(req.file.path)
            .then(data => {
                image = data.url;
            });
        }

        let product = {
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            aucStartTime: req.body.startTime || Date.now,
            aucEndTime: req.body.endTime,
            price: req.body.price,
            image: image,
            categories: {
                name: ProductUtils.retrieveCatByCode(req.body.category)
            },
            tags: null,
            priceStep: req.body.priceStep,
            priceMethod: ProductUtils.retrievePriceMethod(req.body.priceMethod) || "INCR",
            status: 1,
            nextPrice: parseInt(req.body.price) + parseInt(req.body.priceStep),
            userId: req.user._id
        }

        await ProductService.save(product);
    } catch (error) {
        console.log(error);
    }

    return res.redirect("/products");
}

export default ProductController;
