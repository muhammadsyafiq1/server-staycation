const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Image = require('../models/Image');
const Feature = require('../models/Feature');
const Item = require('../models/Item');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    // return view
    viewDashboard: (req, res) => {
        res.render('admin/dashboard/view_dashboard', {
            title: "Staycation | Dashboard"
        });
    },

    viewCategory: async (req, res) => {
        try{
            // ambil semua category dengan method find
            const categories = await Category.find();
            // deklarasikan flash message
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            // return view
            res.render('admin/dashboard/category/view_category', {
                categories,
                alert,
                title: "Staycation | Category"
            });
        // jika error
        }catch(error) {
            res.redirect('/admin/category');
        }
    },

    addCategory: async (req, res) => {
        try{
            // ambil value dari request
            const {name} = req.body;
            // masukan ke database
            await Category.create({name});
            // deklarasi flash
            req.flash('alertMessage','Success Add Category');
            req.flash('alertStatus','success');
            res.redirect('/admin/category');
        }catch(error) {
            // jika error deklarasikan flash error
            req.flash('alertMessage',`${error.message}`);
            req.flash('alertStatus','danger');
            res.redirect('/admin/category');
        }
    },

    editCategory: async (req, res) => {
        try{
            // ambil value dari req body
            const {id, name} = req.body;
            // ambil category berdasarkan id
            const category = await Category.findOne({_id: id});
            // edit name category
            category.name = name;
            // simpan category
            await category.save();
            // deklarasi flash
            req.flash('alertMessage','Success Update Category');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/category');
        }catch(error){
            // deklarasi flash jika error
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus','danger');
            res.redirect('/admin/category');
        }
    },

    deleteCategory: async (req, res) => {
        try{
            const {id} = req.params;
            const category = await Category.findOne({_id: id});
            await category.remove();
            req.flash('alertMessage','Success delete category');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/category');
        }catch(error){
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus','danger');
            res.redirect('/admin/category');
        }
    },

    viewBank: async (req, res) => {
       try{
            const banks = await Bank.find(); 
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/dashboard/bank/view_bank', {
                alert,
                title: "Staycation | Bank",
                banks
            });
       }catch(error){
            res.redirect('/admin/bank')
       }
    },

    addBank: async (req, res) => {
        try{
            const {name, nameBank, nomorRekening} = req.body;
            await Bank.create({
                name, 
                nameBank, 
                nomorRekening,
                imageUrl: `images/${req.file.filename}`
            });
            req.flash('alertMessage','Success Add Bank');
            req.flash('alertStatus','success');
            res.redirect('/admin/bank')
        }catch(error){
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus','danger');
            res.redirect('/admin/bank');
        }
    },

    editBank: async (req, res) => {
        try{
            const { id, name, nameBank, nomorRekening } = req.body;
            const bank = await Bank.findOne({_id: id});
            if(req.file == undefined) {
                bank.name = name;
                bank.nameBank = nameBank;
                bank.nomorRekening = nomorRekening;
                await bank.save();
                req.flash('alertMessage','Success update bank');
                req.flash('alertStatus','success');
                res.redirect('/admin/bank');
            } else {
                await fs.unlink(path.join(`public/${bank.imageUrl}`));
                bank.name = name;
                bank.nameBank = nameBank;
                bank.nomorRekening = nomorRekening;
                bank.imageUrl = `images/${req.file.filename}`;
                await bank.save();
                req.flash('alertMessage','Success update bank');
                req.flash('alertStatus','success');
                res.redirect('/admin/bank');
            }
        }catch(error){
            req.flash('alertMessage',`${error.message}`);
            req.flash('alertStatus',' danger');
            res.redirect('/admin/bank');
        }
    },

    deleteBank : async (req, res) => {
        try{
            const {id} = req.params;
            const bank = await Bank.findOne({_id: id});
            await fs.unlink(path.join(`public/${bank.imageUrl}`));
            await bank.remove();
            req.flash('alertMessage','Success delete bank');
            req.flash('alertStatus','success');
            res.redirect('/admin/bank');
        }catch(error){
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus','danger');
            res.redirect('/admin/bank');
        }
    },

    // items
   viewItem: async (req, res) => {
      try{
        const items = await Item.find()
        .populate({ path: 'imageId', select: 'id imageUrl' })
        .populate({ path: 'categoryId', select: 'id name' });
        const categories = await Category.find();
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/dashboard/item/view_item', {
            title: "Staycation | item",
            categories,
            alert,
            items,
            action : 'view',
        });
      }catch(error){
        req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus','danger');
        res.redirect('/admin/item');
      }
   },

   addItem : async (req, res) => {
        try{
            const {categoryId,price,title,city,description} = req.body;
            if(req.files.length > 0){
                const category = await Category.findOne({ _id : categoryId });
                const newItem = {
                    categoryId: category._id,
                    title,
                    price,
                    city,
                    description,
                }
                const item = await Item.create(newItem);
                category.itemId.push({ _id: item._id });
                await category.save();

                for( let i = 0; i < req.files.length; i++){
                    const imageSave = await Image.create({ imageUrl: `images/${req.files[i].filename}` });
                    item.imageId.push({ _id: imageSave._id });
                    await item.save();
                }

                req.flash('alertMessage','Success add item');
                req.flash('alertStatus','success');
                res.redirect('/admin/item');
            }
        }catch(error){
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus','danger');
            res.redirect('/admin/item');
        }
   },

   showImageItem : async (req, res) => {
       try {
        const { id } = req.params;
        const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' });
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/dashboard/item/view_item', {
            title: "Staycation | Show Image Item",
            alert,
            item,
            action: 'show image'
        });
       }catch(error){
        req.flash('alertMessage',`${error.message}`);
        req.flash('alertStatus', 'danger');
        res.redirect('/admin/item');
       }
   },

   showEditItem : async (req, res) => {
       try {
        const {id} = req.params;
        const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' })
            .populate({ path: 'categoryId', select: 'id name' });
        console.log(item);
        const categories = await Category.find();
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/dashboard/item/view_item', {
            title :'Staycation | edit item',
            alert,
            categories,
            item,
            action : 'edit'
        });
       }catch(error) {
        req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus', 'danger');
        res.redirect('/admin/item');
       }
   },

   editItem : async (req, res) => {
       try{
            const {id} = req.params;
            const {categoryId, title, price, city, description} = req.body;
            const item = await Item.findOne({_id: id})
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'});
            if(req.files.length > 0){
                for(let i = 0; i < item.imageId.length; i++){
                    const imageUpdate = await Image.findOne({_id: item.imageId[i]._id});
                    await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
                    imageUpdate.imageUrl = `images/${req.files[i].filename}`;
                    await imageUpdate.save();
                }
                item.title = title;
                item.price = price;
                item.city = city;
                item.categoryId = categoryId;
                item.description = description;
                await item.save();
                req.flash('alertMessage','Success update item');
                req.flash('alertStatus','success');
                res.redirect('/admin/item');
            }else{
                item.title = title;
                item.price = price;
                item.city = city;
                item.categoryId = categoryId;
                item.description = description;
                await item.save();
                req.flash('alertMessage','Success update item');
                req.flash('alertStatus','success');
                res.redirect('/admin/item');
            }
       }catch(error){
            req.flash('alertMessage',`${error.message}`);
            req.flash('alertStatus','danger');
            res.redirect('/admin/item');
       }
   },

   deleteItem : async (req, res) => {
       try{
        const {id} = req.params;
        const item = await Item.findOne({_id: id}).populate('imageId');
        for (let i = 0; i < item.imageId.length; i++){
            Image.findOne({_id: item.imageId[i]._id}).then((image) => {
                fs.unlink(path.join(`public/${image.imageUrl}`));
                image.remove();
            }).catch((error) => {
                req.flash('alertMessage',`${error.message}`);
                req.flash('alertStatus','danger');
                res.redirect('/admin/item');
            });
        }
        await item.remove();
        req.flash('alertMessage','Success delete item');
        req.flash('alertStatus','success');
        res.redirect('/admin/item');
       }catch(error){
        req.flash('alertMessage',`${error.message}`);
        req.flash('alertStatus','danger');
        res.redirect('/admin/item');
       }
   },

   viewDetailItem : async (req, res) => {
        const { itemId } = req.params;
        try{
        // feature berdsarkan item id
        const features = await Feature.find({itemId : itemId});
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/item/detail-item/view_detail_item',{
            title: 'Staycation | Detail',
            alert,
            itemId,
            features
        });
       }catch(error){
        req.flash('alertMessage',`${error.message}`);
        req.flash('alertStatus','danger');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
       }
   },

   addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body;
    console.log(req.body);
    try {
      if (!req.file) {
        req.flash('alertMessage', 'Image not found');
        req.flash('alertStatus', 'danger');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
      const feature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`
      });

      const item = await Item.findOne({ _id: itemId });
      item.featureId.push({ _id: feature._id });
      await item.save()
      req.flash('alertMessage', 'Success Add Feature');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },

  editFeature : async (req, res) => {
      try{
        const {id , name, qty, itemId} = req.body;
        const feature = await Feature.findOne({_id : id});
        if(req.file == undefined) {
            feature.name = name;
            feature.qty = qty
            await feature.save();
            req.flash('alertMessage','Success update bank');
            req.flash('alertStatus','success');
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } else {
            await fs.unlink(path.join(`public/${feature.imageUrl}`));
            feature.name = name;
            feature.qty = qty
            feature.imageUrl = `images/${req.file.filename}`;
            await feature.save();
            req.flash('alertMessage','Success update bank');
            req.flash('alertStatus','success');
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
      }catch(error){
        req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus', 'danger');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);  
      }
  },

  deleteFeature : async (req, res) => {
    const {id , itemId} = req.params;
    try{
        const feature = await Feature.findOne({ _id: id });

        // ambil itemnya juga karena ingin hapus featuredId dalam collection items
        const item = await Item.findOne({ _id: itemId }).populate('featureId');
        // cek featureId yang akan dihapus
        for(let i = 0; i < item.featureId.length; i++){
            if(item.featureId[i]._id.toString() ===  feature._id.toString()){
                item.featureId.pull({ _id: feature.id });
                await item.save();
            }
        }
        await fs.unlink(path.join(`public/${feature.imageUrl}`));
        await feature.remove();
        req.flash('alertMessage','Success delete feature');
        req.flash('alertStatus','success');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }catch(error){
        req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus', 'danger');
        res.redirect(`/admin/item/show-detail-item/${itemId}`); 
    }
  },


   viewBooking: (req, res) => {
       res.render('admin/dashboard/booking/view_booking', {
           title: "Staycation | booking"
       });
   }
}