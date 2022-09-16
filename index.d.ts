declare module "phoenix-economy-v3" {
    export class EconomyUser {
        user_id: string;
        balance: number;
        xp: number;
        level: number;
        required_xp: number;
        used_daily: boolean;
        toJSON(): object;
        toSubJSON(): object;
        static fromJSON(id: string): EconomyUser;
    }

    export class MoneyManager {
        static add(user: EconomyUser, amount: number);
        static remove(user: EconomyUser, amount: number);
        static pay(source: EconomyUser, target: EconomyUser, amount: number);
    }

    export class XpManager {
        static add(user: EconomyUser, amount: number);
        static remove(user: EconomyUser, amount: number);
    }

    export class GeneratorOptions {
        min: number;
        max: number;
        integer?: boolean;
        constructor(min: number, max: number, integer?: boolean);
    }

    export class Utils {
        static writeFile(): void;
        static canLevelUp(user: EconomyUser): boolean;
        static levelUp(user: EconomyUser): EconomyUser;
        static generateRandom(options: GeneratorOptions): number;
        static resetDaily(): void;
    }
}