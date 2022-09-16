"use strict";
exports.__esModule = true;
exports.Utils = exports.GeneratorOptions = exports.XpManager = exports.MoneyManager = exports.EconomyUser = void 0;
var eco = require("../../data.json");
var fs = require("fs");
var cron = require("node-cron");
var EconomyUser = /** @class */ (function () {
    function EconomyUser(user, bal, xp, lvl, required, daily) {
        this.user_id = user;
        this.balance = bal;
        this.xp = xp;
        this.level = lvl;
        this.required_xp = required;
        this.used_daily = daily;
    }
    EconomyUser.prototype.toJSON = function () {
        var _a;
        return _a = {}, _a[this.user_id] = { balance: this.balance, xp: this.xp, level: this.level, required: this.required_xp, daily: this.used_daily }, _a;
    };
    EconomyUser.prototype.toSubJSON = function () {
        return { balance: this.balance, xp: this.xp, level: this.level, required: this.required_xp, daily: this.used_daily };
    };
    EconomyUser.fromJSON = function (id) {
        if (eco[id])
            return new this(id, eco[id]["balance"], eco[id]["xp"], eco[id]["level"], eco[id]["required"], eco[id]["daily"]);
        return new this(id, 0, 0, 0, 10, false);
    };
    return EconomyUser;
}());
exports.EconomyUser = EconomyUser;
var MoneyManager = /** @class */ (function () {
    function MoneyManager() {
    }
    MoneyManager.add = function (user, amount) {
        user.balance += amount;
        eco[user.user_id] = user.toSubJSON();
        Utils.writeFile();
    };
    MoneyManager.remove = function (user, amount) {
        user.balance -= amount;
        eco[user.user_id] = user.toSubJSON();
        Utils.writeFile();
    };
    MoneyManager.pay = function (source, target, amount) {
        if ((source.balance - amount) < 0)
            return;
        else if ((source.balance - amount) >= 0) {
            this.remove(source, amount);
            this.add(target, amount);
        }
    };
    return MoneyManager;
}());
exports.MoneyManager = MoneyManager;
var XpManager = /** @class */ (function () {
    function XpManager() {
    }
    XpManager.add = function (user, amount) {
        user.xp += amount;
        if (Utils.canLevelUp(user)) {
            user = Utils.levelUp(user);
            eco[user.user_id] = user.toSubJSON();
            Utils.writeFile();
        }
        else {
            eco[user.user_id] = user.toSubJSON();
            Utils.writeFile();
        }
    };
    XpManager.remove = function (user, amount) {
        user.xp -= amount;
        eco[user.user_id] = user.toSubJSON();
        Utils.writeFile();
    };
    return XpManager;
}());
exports.XpManager = XpManager;
var GeneratorOptions = /** @class */ (function () {
    function GeneratorOptions(min, max, integer) {
        this.min = min;
        this.max = max;
        this.integer = integer;
    }
    return GeneratorOptions;
}());
exports.GeneratorOptions = GeneratorOptions;
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.writeFile = function () {
        fs.writeFileSync("./data.json", JSON.stringify(eco, null, "    "));
    };
    Utils.canLevelUp = function (user) {
        return user.xp >= user.required_xp ? true : false;
    };
    Utils.levelUp = function (user) {
        user.xp -= user.required_xp;
        user.required_xp *= 2;
        user.level += 1;
        this.writeFile();
        return user;
    };
    Utils.generateRandom = function (options) {
        var int = (options.integer || true);
        return (int == true ? Math.floor(Math.random() * (options.max - options.min + 1) + options.min) : Math.random() * (options.max - options.min + 1) + options.min);
    };
    Utils.resetDaily = function () {
        var _this = this;
        for (var user in eco) {
            console.log(eco[user]["daily"]);
            eco[user]["daily"] = false;
            this.writeFile();
        }
        cron.schedule("0 0 * * *", function () { _this.resetDaily(); });
    };
    return Utils;
}());
exports.Utils = Utils;
