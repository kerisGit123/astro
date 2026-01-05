import { NextResponse } from "next/server";
import { getBalance } from "@/lib/credits";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");

        if (!companyId) {
            return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
        }

        const balance = await getBalance(companyId);
        return NextResponse.json({ balance });

    } catch (error: unknown) {
        console.error("Get balance error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get balance";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
