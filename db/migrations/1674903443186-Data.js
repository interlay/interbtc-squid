module.exports = class Data1674903443186 {
    name = 'Data1674903443186'

    async up(db) {
        await db.query(`ALTER TABLE "interest_accrual" ADD "exchange_rate_float" numeric NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" DROP COLUMN "utilization_ratio"`)
        await db.query(`ALTER TABLE "interest_accrual" ADD "utilization_ratio" numeric NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "total_borrows" SET NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "total_reserves" SET NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "borrow_index" SET NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "borrow_rate" SET NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "supply_rate" SET NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "exchange_rate" SET NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "interest_accrual" DROP COLUMN "exchange_rate_float"`)
        await db.query(`ALTER TABLE "interest_accrual" ADD "utilization_ratio" integer`)
        await db.query(`ALTER TABLE "interest_accrual" DROP COLUMN "utilization_ratio"`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "total_borrows" DROP NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "total_reserves" DROP NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "borrow_index" DROP NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "borrow_rate" DROP NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "supply_rate" DROP NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ALTER COLUMN "exchange_rate" DROP NOT NULL`)
    }
}
