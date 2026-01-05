import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM profiles WHERE user_id = $1",
            [userId]
        );
        return NextResponse.json(result.rows[0] || null);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { birthDate, birthTime, birthLocation, gender, zodiacSign } = body;

        // Validation (basic)
        if (!birthDate || !birthLocation) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const query = `
            INSERT INTO profiles (user_id, birth_date, birth_time, birth_location, gender, zodiac_sign)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                birth_date = EXCLUDED.birth_date,
                birth_time = EXCLUDED.birth_time,
                birth_location = EXCLUDED.birth_location,
                gender = EXCLUDED.gender,
                zodiac_sign = EXCLUDED.zodiac_sign,
                updated_at = now()
            RETURNING *;
        `;

        const result = await pool.query(query, [
            userId,
            birthDate,
            birthTime,
            birthLocation,
            gender,
            zodiacSign
        ]);

        return NextResponse.json(result.rows[0]);
    } catch (e: any) {
        console.error("Profile Error", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
