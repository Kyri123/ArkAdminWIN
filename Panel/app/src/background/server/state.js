/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2019-2020, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/ArkadminWIN/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/ArkadminWIN
 * *******************************************************************************************
 */

// require Module
const fs            = require('fs');
const Gamedig       = require('gamedig');
const ip            = require("ip");
const serverInfos   = require('./../../util_server/infos');
const findProcess   = require('find-process');
const serverUtil    = require('./util');


/**
 * Speichert Informationen in einer JSON oder in die MYSQL
 * @param {boolean} mysql_status - Soll die Daten in der Datenbankl gespeichert werden
 * @param {array} data - Daten die gespeichert werden
 * @param {string} name - Bezeichung der gespeicherten Daten (bsp server)
 * @param {array} state - Daten zusätzlich gespeichert werden sollen (array.state)
 * @param {boolean} use_state - Soll state benutzt werden?
 */
function save(data, name, state, use_state = true) {
    // Schreibe in die Datenbank zu weiterverarbeitung
    let query_lf = `SELECT * FROM \`ArkAdmin_statistiken\` WHERE \`server\` = '${name}' ORDER BY \`time\``;
    con.query(query_lf, (error, results) => {
        if(use_state) data.state = state;
        if(!error) {
            // Wenn mehr als 999 Datensätze bestehen Updaten
            if(results.length > 999) {
                var update = `UPDATE \`ArkAdmin_statistiken\` SET \`time\` = '${Math.floor(Date.now() / 1000)}', \`serverinfo_json\` = '${JSON.stringify(data)}' WHERE \`id\` = '${results[0].id}'`;
                con.query(update);
            }
            // Wenn mehr weniger 999 Datensätze bestehen Erstelle neue Datensätze
            else {
                var create = `INSERT INTO \`ArkAdmin_statistiken\` VALUES (null, '${Math.floor(Date.now() / 1000)}', '${JSON.stringify(data)}', '${name}');`;
                con.query(create);
            }
        }
    });
    fs.writeFileSync(`./public/json/server/${name}.json`, JSON.stringify(data));
}

module.exports = {
    getStateFromServers: async () => {
        let serverLocalPath     = `./app/json/server`;
        let dirArray            = fs.readdirSync(serverLocalPath);
        // Scanne Instancen
        dirArray.forEach((ITEM) => {
            // Erstelle Abfrage wenn es eine .cfg Datei ist
            if (ITEM.includes(".json")) {

                if(!fs.existsSync(`./public/json/server/`)) fs.mkdirSync(`./public/json/server/`);
                let name            = ITEM.replace(".json", "");
                let data            = serverInfos.getServerInfos(name);
                let servCFG         = serverInfos.getConfig(name);
                let serverPath      = servCFG.path;
                let serverPathLogs  = servCFG.pathLogs;

                // Lese installierte Mods
                data.installedMods  = [];
                let modPath         = `${servCFG.path}\\ShooterGame\\Content\\Mods`;
                let dirRead         = fs.existsSync(modPath) ? fs.readdirSync(modPath, { withFileTypes: true }) : [];

                if(dirRead.length > 0) {
                    dirRead.forEach((val) => {
                        if(
                            (val.isFile()       && val.name !== "111111111.mod" && !isNaN(val.name.replace(".mod", ""))) ||
                            (val.isDirectory()  && val.name !== "111111111"     && !isNaN(val.name))
                        ) if(!data.installedMods.includes(parseInt(val.name))) data.installedMods.push(parseInt(val.name));
                    })
                }

                data.notInstalledMods  = [];
                if(servCFG.mods.length > 0) {
                    servCFG.mods.forEach((val) => {
                        if(!data.notInstalledMods.includes(val)) data.notInstalledMods.push(val);
                    });
                }

                // Default werte
                data.aplayers       = 0;
                data.players        = 0;
                data.listening      = false;
                data.online         = false;
                data.cfg            = name;
                data.ServerMap      = servCFG.serverMap;
                data.ServerName     = servCFG.sessionName;
                data.ARKServers     = `https://arkservers.net/server/${ip.address()}:${servCFG.query}`;
                data.connect        = `steam://connect/${ip.address()}:${servCFG.query}`;
                data.is_installing  = fs.existsSync(`${serverPath}\\steamapps\\appmanifest_${PANEL_CONFIG.appID_server}.acf`) && !fs.existsSync(`${serverPath}\\ShooterGame\\Binaries\\Win64\\ShooterGameServer.exe`);
                let exePath         = `${serverPath}\\ShooterGame\\Binaries\\Win64\\ShooterGameServer.exe`;
                data.is_installed   = fs.existsSync(`${serverPath}\\ShooterGame\\Binaries\\Win64\\ShooterGameServer.exe`);
                data.is_free        = true;
                // Runing infos
                data.run            = false;
                data.steamcmd       = false;
                data.cmd            = false;
                data.pid            = 0;
                data.ppid           = 0;
                data.steamcmdpid    = 0;
                data.steamcmdppid   = 0;
                data.cmdpid         = 0;
                data.cmdppid        = 0;
                data.cmd            = "";
                data.bin            = "";
                // More data
                data.aplayers       = 0;
                data.aplayersarr    = [];
                data.ping           = 0;
                data.version        = data.version === undefined ? "" : data.version;


                // Alerts
                data.alerts = [];
                if(data.is_installed) {
                    // Prüfe Server Update
                    if(serverUtil.checkSeverUpdate(name)) data.alerts.push("3998");

                    // Prüfe Mod Updates
                    if(serverUtil.checkModUpdates(name) !== false) data.alerts.push("3997");

                    // Prüfe Mod Installiert
                    if(data.notInstalledMods.length > 0) data.alerts.push("3996");

                    // Prüfe Mod Installiert
                    if(servCFG.shouldRun) data.alerts.push("3995");
                }
                else {
                    data.alerts.push("3999");
                }

                findProcess('name', `${name}`)
                    .then(function (list) {
                        if (list.length) {
                            let i1 = list.find(p => p.name === "ShooterGameServer.exe");
                            let i2 = list.find(p => p.name === "cmd.exe");
                            let i3 = list.find(p => p.name === "steamcmd.exe");
                            data.steamcmd       = i3 !== undefined;
                            data.cmd            = i2 !== undefined;
                            data.is_free        = i2 !== undefined;
                            data.steamcmdpid    = i3 !== undefined ? i3.pid : 0;
                            data.steamcmdppid   = i3 !== undefined ? i3.ppid : 0;
                            data.cmdpid         = i2 !== undefined ? i2.pid : 0;
                            data.cmdppid        = i2 !== undefined ? i2.ppid : 0;

                            if(i1 !== undefined) {
                                data.run            = true;
                                data.pid            = i1.pid;
                                data.ppid           = i1.ppid;
                                data.bin            = i1.bin;

                                Gamedig.query({
                                    type: 'arkse',
                                    host: ip.address(),
                                    port: servCFG.query
                                })
                                    .then((state) => {
                                        data.players = state.maxplayers;
                                        data.aplayers = state.players.length;
                                        data.aplayersarr = state.players;
                                        data.listening = 'Yes';
                                        data.online = 'Yes';
                                        data.cfg = name;
                                        data.ServerMap = state.map;
                                        data.ServerName = state.name;
                                        data.ping = state.ping;

                                        // Hole Version
                                        var version_split = state.name.split("-")[1];
                                        version_split = version_split.replace(")", "");
                                        version_split = version_split.replace("(", "");
                                        version_split = version_split.replace(" ", "");
                                        version_split = version_split.replace("v", "");
                                        data.version = version_split;

                                        // Speichern
                                        save(data, name, state);
                                    }).catch((error) => {
                                        // Speichern
                                        save(data, name, state);
                                    });
                            }
                            else {
                                save(data, name, {});
                            }
                        }
                        else {
                            // Speichern
                            save(data, name, {});
                        }
                    });
            }
        });
    }
};