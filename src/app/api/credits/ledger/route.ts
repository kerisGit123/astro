import { NextResponse } from "next/server";
import { listLedger } from "@/lib/credits";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        const limit = Number(searchParams.get("limit") || 50);

        if (!companyId) {
            return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
        }

        const ledger = await listLedger(companyId, limit);
        return NextResponse.json({ ledger });

    } catch (error: unknown) {
        console.error("Get ledger error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get ledger";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
