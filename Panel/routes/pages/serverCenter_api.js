/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/ArkadminWIN/blob/main/LICENSE)
 * Github: https://github.com/Kyri123/ArkadminWIN
 * *******************************************************************************************
 */

const express           = require('express')
const router            = express.Router()
const helper_user       = require('./../../app/src/sessions/helper');
const globalinfos       = require('./../../app/src/global_infos');
const serverUtilInfos   = require('./../../app/src/util_server/infos');


router.route('/')

    .all((req,res)=>{
        global.user         = helper_user.getinfos(req.session.uid);

        let sess = req.session;
        let serverName  = req.baseUrl;
        serverName      = serverName.replace('/servercenter/', '').replace('/api', '');
        let userPerm    = helper_user.permissions(sess.uid);
        console.log(helper_user.hasPermissions(sess.uid, "all/is_admin2"));

        // Leite zu 401 wenn Rechte nicht gesetzt sind
        if(
            userPerm.server[serverName].is_server_admin === 0 &&
            userPerm.server[serverName].show === 0 &&
            userPerm.all.is_admin === 0
        ) {
            res.redirect("/401");
        }

        // Die eigentl. Seite
        else {
            let resp    = "";
            let servCfg = serverUtilInfos.getConfig(serverName);

            // Render Seite
            res.render('pages/servercenter/serverCenter_backups', {
                icon                    : "fas fa-server",
                pagename                : servCfg.sessionName,
                page                    : "servercenter",
                subpage                 : "api",
                resp                    : resp,
                perm                    : userPerm,
                scfg                    : servCfg,
                servinfos               : serverUtilInfos.getServerInfos(serverName),
                sinfos                  : globalinfos.get(),
                sconfig                 : serverUtilInfos.getConfig(serverName),
                serverName              : serverName,
                sercerCenterAny         : globalUtil.safeFileReadSync([mainDir, '/public/json/sites/', 'serverCenterAny.cfg.json'], true),
                sercerCenterActions     : globalUtil.safeFileReadSync([mainDir, '/public/json/sites/', 'serverCenterActions.cfg.json'], true)
            });
        }
    })

module.exports = router;