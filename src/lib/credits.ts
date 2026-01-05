import { query, pool } from "./db";

/**
 * Get current credit balance for a company
 */
export async function getBalance(companyId: string): Promise<number> {
    const result = await query(
        'SELECT balance FROM credits_balance WHERE company_id = $1',
        [companyId]
    );

    return result.rows[0]?.balance ?? 0;
}

/**
 * Get transaction history (ledger) for a company
 */
export async function listLedger(
    companyId: string,
    limit: number = 50
): Promise<any[]> {
    const result = await query(
        `SELECT 
      id, company_id, tokens, stripe_payment_intent_id,
      stripe_checkout_session_id, amount_paid, currency,
      reason, created_at
    FROM credits_ledger 
    WHERE company_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2`,
        [companyId, limit]
    );

    return result.rows;
}

/**
 * Add credits to a company account (used by webhook)
 * Includes idempotency check and transaction safety
 */
export async function addCredits(args: {
    companyId: string;
    tokens: number;
    stripePaymentIntentId?: string;
    stripeCheckoutSessionId?: string;
    amountPaid?: number;
    currency?: string;
    reason?: string;
}): Promise<{ balance: number; skipped?: boolean }> {
    const client = await pool.connect();

    try {
        // Start transaction
        await client.query('BEGIN');

        // ===== IDEMPOTENCY CHECK =====
        // Prevent duplicate credit additions if webhook is called multiple times
        if (args.stripePaymentIntentId || args.stripeCheckoutSessionId) {
            const checkQuery = `
        SELECT id FROM credits_ledger 
        WHERE (stripe_payment_intent_id = $1 OR stripe_checkout_session_id = $2)
        AND company_id = $3
        LIMIT 1
      `;
            const existingResult = await client.query(checkQuery, [
                args.stripePaymentIntentId,
                args.stripeCheckoutSessionId,
                args.companyId
            ]);

            if (existingResult.rows.length > 0) {
                console.log("Credits already added for this payment, skipping");
                await client.query('ROLLBACK');
                return { balance: 0, skipped: true };
            }
        }

        // ===== INSERT LEDGER ENTRY =====
        const insertLedgerQuery = `
      INSERT INTO credits_ledger (
        company_id, tokens, stripe_payment_intent_id, 
        stripe_checkout_session_id, amount_paid, currency, reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
        await client.query(insertLedgerQuery, [
            args.companyId,
            args.tokens,
            args.stripePaymentIntentId,
            args.stripeCheckoutSessionId,
            args.amountPaid,
            args.currency,
            args.reason || "token_purchase"
        ]);

        // ===== UPDATE BALANCE =====
        // Use UPSERT (INSERT ... ON CONFLICT) to handle both new and existing balances
        const upsertBalanceQuery = `
      INSERT INTO credits_balance (company_id, balance, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (company_id) 
      DO UPDATE SET 
        balance = credits_balance.balance + $2,
        updated_at = NOW()
      RETURNING balance
    `;
        const balanceResult = await client.query(upsertBalanceQuery, [
            args.companyId,
            args.tokens
        ]);

        // Commit transaction
        await client.query('COMMIT');

        return { balance: balanceResult.rows[0].balance };

    } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Consume credits (deduct from balance)
 * Includes row-level locking to prevent race conditions
 */
export async function consumeCredits(
    companyId: string,
    tokens: number,
    reason?: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
    const client = await pool.connect();

    try {
        if (tokens <= 0) {
            return { success: false, error: "tokens must be > 0" };
        }

        // Start transaction
        await client.query('BEGIN');

        // Check current balance (with row lock to prevent race conditions)
        const balanceResult = await client.query(
            'SELECT balance FROM credits_balance WHERE company_id = $1 FOR UPDATE',
            [companyId]
        );

        const currentBalance = balanceResult.rows[0]?.balance ?? 0;

        if (currentBalance < tokens) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: "Insufficient tokens",
                balance: currentBalance
            };
        }

        // Add negative ledger entry
        await client.query(
            `INSERT INTO credits_ledger (company_id, tokens, reason)
       VALUES ($1, $2, $3)`,
            [companyId, -tokens, reason || "credit_usage"]
        );

        // Update balance
        const newBalance = currentBalance - tokens;
        await client.query(
            `UPDATE credits_balance 
       SET balance = $1, updated_at = NOW() 
       WHERE company_id = $2`,
            [newBalance, companyId]
        );

        // Commit transaction
        await client.query('COMMIT');

        return { success: true, balance: newBalance };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
