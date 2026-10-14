import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/verify/verify-auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedStaff(request);
    if (!auth) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      staff: {
        id: auth.staff.id,
        email: auth.staff.email,
        displayName: auth.staff.displayName,
        role: auth.staff.role,
      },
      bar: {
        id: auth.bar.id,
        name: auth.bar.name,
        outletCode: auth.bar.outletCode,
        location: auth.bar.location,
        address: auth.bar.address,
        city: auth.bar.city,
        country: auth.bar.country,
      },
    });
  } catch (error) {
    console.error("[VerifyPortal] Session check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
