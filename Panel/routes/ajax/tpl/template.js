/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkWIN/blob/main/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkWIN
 * *******************************************************************************************
 */

const express           = require('express')
const router            = express.Router()

router.route('/')

    .post((req,res)=>{
        let POST        = req.body;
    })

    .get((req,res)=>{
        // DEFAULT AJAX
        let GET         = req.query;
    })

module.exports = router;