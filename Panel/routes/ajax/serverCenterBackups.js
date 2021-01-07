/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020-2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/ArkadminWIN/blob/main/LICENSE)
 * Github: https://github.com/Kyri123/ArkadminWIN
 * *******************************************************************************************
 */

const serverCmd         = require('./../../app/src/background/server/cmd');
const express           = require('express')
const router            = express.Router()
const serverClass       = require('./../../app/src/util_server/class');

router.route('/')

    .post((req,res)=>{
        let POST            = req.body;

        if(POST.remove !== undefined && userHelper.hasPermissions(req.session.uid, "backups/remove", POST.server)) {
            let serverData  = new serverClass(POST.server);
            let serverCFG   = serverData.getConfig();
            let success     = false;
            try {
                if(globalUtil.poisonNull(POST.file)) {
                    globalUtil.safeFileRmSync([serverCFG.pathBackup, POST.file]);
                    success = true;
                }
            }
            catch (e) {
                if(debug) console.log(e);
            }

            res.render('ajax/json', {
                data: JSON.stringify({
                    alert: alerter.rd(success ? 1012 : 3).replace("{file}", POST.file)
                })
            });
        }

        if(POST.playin !== undefined && userHelper.hasPermissions(req.session.uid, "backups/playin", POST.server)) {
            let success     = false;
            let serverData  = new serverClass(POST.server);
            let serverCFG   = serverData.getConfig();
            let serverINFO  = serverData.getServerInfos();

            if(serverData.serverExsists()) {
                let savePath    = pathMod.join(serverCFG.path, '\\ShooterGame\\Saved');
                if(globalUtil.safeFileExsistsSync([savePath]))  globalUtil.safeFileRmSync([savePath]);
                if(!globalUtil.safeFileExsistsSync([savePath])) globalUtil.safeFileMkdirSync([savePath]);
                if(globalUtil.safeFileExsistsSync([savePath]) && serverINFO.pid === 0) {
                    serverCmd.runCMD(`powershell -command "Expand-Archive -Force -LiteralPath '${serverCFG.pathBackup}\\${POST.file}' -DestinationPath '${serverCFG.path}\\ShooterGame\\Saved'"`)
                    success = true;
                }
            }

            res.render('ajax/json', {
                data: JSON.stringify({
                    alert: alerter.rd(success ? 1013 : 3).replace("{file}", POST.file)
                })
            });
            return true;
        }


    })

    .get((req,res)=>{
        // DEFAULT AJAX
        let GET         = req.query;
        GET.server      = htmlspecialchars(GET.server);

        // Wenn keine Rechte zum abruf
        if(!userHelper.hasPermissions(req.session.uid, "show", GET.server) || !userHelper.hasPermissions(req.session.uid, "backups/show", GET.server)) return true;

        // GET serverInfos
        if(GET.getDir !== undefined && GET.server !== undefined) {
            let serverData  = new serverClass(GET.server);
            let CFG         = serverData.getConfig();
            if(globalUtil.safeFileExsistsSync([CFG.pathBackup]) && serverData.serverExsists()) {
                res.render('ajax/json', {
                    data: JSON.stringify(fs.readdirSync(pathMod.join(CFG.pathBackup)))
                });
                return true;
            }
        }
    })

module.exports = router;