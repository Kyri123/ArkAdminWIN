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
const globalinfos       = require('./../../app/src/global_infos');
const serverUtilInfos   = require('./../../app/src/util_server/infos');
const serverCommands    = require('./../../app/src/background/server/commands');

router.route('/')

    .post((req,res)=>{
        let POST        = req.body;

        // Action Handle
        if(POST.actions !== undefined && POST.cfg !== undefined && userHelper.hasPermissions(req.session.uid, "actions", POST.cfg)) {
            if(POST.actions === "sendcommand") {
                let stop = false;

                // Server Installieren
                if(POST.action === "install") {
                    if(debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m sendCommand > ${POST.cfg} > install`);
                    serverCommands.doInstallServer(
                        POST.cfg
                    );
                    stop = true;
                    res.render('ajax/json', {
                        data: `{"code":"1", "txt": "Install running"}`
                    });
                }

                // Server Updaten
                if(POST.action === "update") {
                    if(debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m sendCommand > ${POST.cfg} > update`);
                    let update = serverCommands.doUpdateServer(
                        POST.cfg,
                        POST.para === undefined ? false : POST.para.includes("--validate"),
                        POST.para === undefined ? false : POST.para.includes("--warn")
                    );
                    stop = true;
                    res.render('ajax/json', {
                        data: `{"code":"1", "txt": "${update !== false ? "update running": "already up to date"}"}`
                    });
                }

                // Alle mods Installieren
                if(POST.action === "installallmods") {
                    if(debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m sendCommand > ${POST.cfg} > installallmods`);

                    let serverInfos     = serverUtilInfos.getConfig(POST.cfg);
                    let modlist         = serverInfos.mods;
                    if(serverInfos.MapModID !== 0) modlist.push(serverInfos.MapModID);

                    serverCommands.doInstallMods(
                        POST.cfg,
                        modlist,
                        POST.para === undefined ? false : POST.para.includes("--validate")
                    );
                    stop = true;
                    res.render('ajax/json', {
                        data: `{"code":"1", "txt": "installallmods running"}`
                    });
                }

                // Starten
                if(POST.action === "start") {
                    if(debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m sendCommand > ${POST.cfg} > start`);
                    serverCommands.doStart(
                        POST.cfg,
            POST.para === undefined ? false : POST.para.includes("--no-autoupdate"),
                POST.para === undefined ? false : POST.para.includes("--validate"),
                        POST.para === undefined ? false : POST.para.includes("--alwaysstart")
                    );
                    stop = true;
                    res.render('ajax/json', {
                        data: `{"code":"1", "txt": "Start running"}`
                    });
                }

                // Stoppen
                if(POST.action === "stop") {
                    if(debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m sendCommand > ${POST.cfg} > stop`);
                    serverCommands.doStop(
                        POST.cfg,
                        POST.para === undefined ? false : POST.para.includes("--saveworld"),
                        POST.para === undefined ? false : POST.para.includes("--warn")
                    );
                    stop = true;
                    res.render('ajax/json', {
                        data: `{"code":"1", "txt": "Stop running"}`
                    });
                }

                // Restarten
                if(POST.action === "restart") {
                    if(debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m sendCommand > ${POST.cfg} > stop`);
                    serverCommands.doRestart(
                        POST.cfg,
                        POST.para === undefined ? false : POST.para.includes("--saveworld"),
                        POST.para === undefined ? false : POST.para.includes("--warn"),
                        POST.para === undefined ? false : POST.para.includes("--validate"),
                    POST.para === undefined ? false : POST.para.includes("--no-autoupdate"),
                        POST.para === undefined ? false : POST.para.includes("--alwaysstart")
                    );
                    stop = true;
                    res.render('ajax/json', {
                        data: `{"code":"1", "txt": "Stop running"}`
                    });
                }

                // Backup
                if(POST.action === "backup") {
                    if(debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m sendCommand > ${POST.cfg} > backup`);
                    serverCommands.doBackup(
                        POST.cfg
                    );
                    stop = true;
                    res.render('ajax/json', {
                        data: `{"code":"1", "txt": "installallmods running"}`
                    });
                }

                if(!stop) res.render('ajax/json', {
                    data: `{"code":"404"}`
                });
            }
        }
    })

    .get((req,res)=>{
        // DEFAULT AJAX
        let GET         = req.query;

        // Wenn keine Rechte zum abruf
        if(!userHelper.hasPermissions(req.session.uid, "show", GET.server)) return true;

        // GET serverInfos
        if(GET.getserverinfos !== undefined && GET.server !== undefined) {
            res.render('ajax/json', {
                data: JSON.stringify(serverUtilInfos.getServerInfos(GET.server))
            });
        }

        // GET Globale Infos
        if(GET.getglobalinfos !== undefined) {
            res.render('ajax/json', {
                data: JSON.stringify(globalinfos.get())
            });
        }

        // GET ActionJson
        if(GET.getscglobalinfos !== undefined) {
            try {
                let array = [];
                let file = globalUtil.safeFileReadSync([mainDir, '/public/json/sites/', 'serverCenterActions.cfg.json'], true);
                array[0] = file !== false ? file : [];
                file     = globalUtil.safeFileReadSync([mainDir, '/public/json/sites/', 'serverCenterAny.cfg.json'], true);
                array[1] = file !== false ? file : [];

                res.render('ajax/json', {
                    data: JSON.stringify(array)
                });
            }
            catch (e) {
                if(debug) console.log(e);
                res.render('ajax/json', {
                    data: '{"state": false}'
                });
            }
        }
    })

module.exports = router;