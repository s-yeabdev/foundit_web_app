const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');
const upload = require('../config/multer');
const { authenticate } = require('../middleware/auth'); // Added authentication guard
const { validateItem } = require('../middleware/validation');


router.get('/', ItemController.getAll);


router.get('/my-items', authenticate, ItemController.getUserItems);


router.get('/:id', ItemController.getById);




router.post('/', authenticate, upload.single('image'), validateItem, ItemController.create);


router.put('/:id', authenticate, upload.single('image'), validateItem, ItemController.update);


router.delete('/:id', authenticate, ItemController.delete);

module.exports = router;