import * as eco from "../../data.json";
import * as fs from "fs";
import * as cron from "node-cron";

export class EconomyUser {
    user_id: string;
    balance: number;
    xp: number;
    level: number;
    required_xp: number;
    used_daily: boolean;
    constructor(user: string, bal: number, xp: number, lvl: number, required: number, daily: boolean) {
        this.user_id = user;
        this.balance = bal;
        this.xp = xp;
        this.level = lvl;
        this.required_xp = required;
        this.used_daily = daily;
    }

    toJSON(): object {
        return {[this.user_id]: {balance: this.balance, xp: this.xp, level: this.level, required: this.required_xp, daily: this.used_daily}};
    }

    toSubJSON(): object {
        return {balance: this.balance, xp: this.xp, level: this.level, required: this.required_xp, daily: this.used_daily};
    }

    static fromJSON(id: string): EconomyUser {
        if (eco[id]) return new this(id, eco[id]["balance"], eco[id]["xp"], eco[id]["level"], eco[id]["required"], eco[id]["daily"]);
        return new this(id, 0, 0, 0, 10, false);
    }
}

export class MoneyManager {
    static add(user: EconomyUser, amount: number) {
        user.balance += amount;
        eco[user.user_id] = user.toSubJSON();
        Utils.writeFile();
    }

    static remove(user: EconomyUser, amount: number) {
        user.balance -= amount;
        eco[user.user_id] = user.toSubJSON();
        Utils.writeFile();
    }

    static pay(source: EconomyUser, target: EconomyUser, amount: number) {
        if ((source.balance - amount) < 0) return;
        else if ((source.balance - amount) >= 0) {
            this.remove(source, amount);
            this.add(target, amount);
        }
    }
}

export class XpManager {
    static add(user: EconomyUser, amount: number) {
        user.xp += amount;
        if (Utils.canLevelUp(user)) {
            user = Utils.levelUp(user);

            eco[user.user_id] = user.toSubJSON();
            Utils.writeFile();
        } else {
            eco[user.user_id] = user.toSubJSON();
            Utils.writeFile();
        }
    }

    static remove(user: EconomyUser, amount: number) {
        user.xp -= amount;
        eco[user.user_id] = user.toSubJSON();
        Utils.writeFile();
    }
}

export class GeneratorOptions {
    min: number;
    max: number;
    integer?: boolean | undefined;
    constructor(min: number, max: number, integer?: boolean | undefined) {
        this.min = min;
        this.max = max;
        this.integer = integer;
    }
}

export class Utils {
    static writeFile(): void {
        fs.writeFileSync("./data.json", JSON.stringify(eco, null, "    "));
    }

    static canLevelUp(user: EconomyUser): boolean {
        return user.xp >= user.required_xp ? true : false;
    }

    static levelUp(user: EconomyUser): EconomyUser {
        user.xp -= user.required_xp;
        user.required_xp *= 2;
        user.level += 1;

        this.writeFile();

        return user;
    }

    static generateRandom(options: GeneratorOptions): number {
        let int = (options.integer || true);
        return (int == true ? Math.floor(Math.random() * (options.max - options.min + 1) + options.min) : Math.random() * (options.max - options.min + 1) + options.min);
    }

    static resetDaily(): void {
        for (const user in eco) {
            console.log(eco[user]["daily"]);
            eco[user]["daily"] = false;
            this.writeFile();
        }

        cron.schedule("0 0 * * *", () => { this.resetDaily(); });
    }
}