/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/ArkadminWIN/blob/main/LICENSE)
 * Github: https://github.com/Kyri123/ArkadminWIN
 * *******************************************************************************************
 */

const express       = require('express')
const router        = express.Router()
const globalinfos   = require('./../../app/src/global_infos');
const helper_user   = require('./../../app/src/sessions/helper');

router.route('/')

    .all((req,res)=>{
        global.user         = helper_user.getinfos(req.session.uid);
        let resp        = "";

        res.render('pages/servercontrolcenter', {
            icon            : "fas fa-server",
            pagename        : PANEL_LANG.pagename.usersettings,
            page            : "servercontrolcenter",
            resp            : resp,
            perm            : helper_user.permissions(req.session.uid),
            sinfos          : globalinfos.get(),
            new_email       : false,
            new_username    : false
        });
    })

module.exports = router;