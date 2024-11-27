const express=require('express');

const { handleReport } = require('../controllers/report1');

const router=express.Router();

router.get('/',handleReport);


module.exports=router;