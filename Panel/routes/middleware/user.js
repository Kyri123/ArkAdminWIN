/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkWIN/blob/main/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkWIN
 * *******************************************************************************************
 */

module.exports = {
    /**
     * Wenn eingeloggt ist > weiter !> /login
     * @param req
     * @param res
     * @param next
     */
    isLoggedIn: (req, res, next) => {
        let sess =  req.session;
        if(sess.uid !== undefined) {
            // Prüfe ob dieser gebannt ist
            sql    = 'SELECT * FROM `ArkAdmin_users` WHERE `id`=?';
            result = globalUtil.safeSendSQLSync(sql, sess.uid);
            if(result[0].ban === 0) {
                next();
            }
            else {
                module.exports.logout(req, res);
            }
        }
        else {
            cookies = req.cookies;
            if(cookies.id !== undefined && cookies.validate !== undefined) {
                sql    = 'SELECT * FROM `ArkAdmin_user_cookies` WHERE `md5id`=? AND `validate`=?';
                result = globalUtil.safeSendSQLSync(sql, cookies.id, cookies.validate);
                if(result.length > 0) {
                    sess.uid = result[0].userid;
                    req.session.save((err) => {});
                    // Prüfe ob dieser gebannt ist
                    sql    = 'SELECT * FROM `ArkAdmin_users` WHERE `id`=?';
                    result = globalUtil.safeSendSQLSync(sql, sess.uid);
                    if(result[0].ban === 0) {
                        next();
                    }
                    else {
                        module.exports.logout(req, res);
                    }
                }
                else {
                    res.redirect("/login");
                }
            }
            else {
                res.redirect("/login");
            }
        }
    },

    /**
     * Wenn nicht eingeloggt ist > weiter !> Prüfe ob einloggen kann (Cookie) - /home !> weiter
     * @param req
     * @param res
     * @param next
     */
    isNotLoggedIn: (req, res, next) => {
        let sess =  req.session;
        if(sess.uid === undefined) {
            cookies = req.cookies;
            if(cookies.id !== undefined && cookies.validate !== undefined) {
                sql    = 'SELECT * FROM `ArkAdmin_user_cookies` WHERE `md5id`=? AND `validate`=?';
                result = globalUtil.safeSendSQLSync(sql, cookies.id, cookies.validate);
                if(result.length > 0) {
                    sess.uid = result[0].userid;
                    req.session.save((err) => {});
                    // Prüfe ob dieser gebannt ist
                    sql    = 'SELECT * FROM `ArkAdmin_users` WHERE `id`=?';
                    result = globalUtil.safeSendSQLSync(sql, sess.uid);
                    if(result[0].ban === 0) {
                        res.redirect("/home");
                    }
                    else {
                        module.exports.logout(req, res);
                    }
                }
                else {
                    next();
                }
            }
            else {
                next();
            }
        }
        else {
            res.redirect("/home");
        }
    },

    /**
     * Wenn nicht eingeloggt ist > weiter !> Prüfe ob einloggen kann (Cookie) - /home !> weiter
     * @param req
     * @param res
     */
    logout: (req, res) => {
        let userid = req.session.uid;
        req.session.destroy((err) => {
            if(err) {
                return console.log(err);
            }
            globalUtil.safeSendSQLSync('DELETE FROM `ArkAdmin_user_cookies` WHERE `userid`=?', userid);
            res.cookie('id', "", {maxAge: 0});
            res.cookie('validate', "", {maxAge: 0});
            res.redirect('/login');
        });
    }
}