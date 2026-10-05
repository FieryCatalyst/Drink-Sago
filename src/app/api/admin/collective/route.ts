import { NextResponse } from "next/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { getSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function verifyAdmin(
  request: Request
): Promise<{ authorized: boolean; email?: string; error?: string }> {
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!bearerToken) {
    return {
      authorized: false,
      error: "Authentication required. Please sign in with your user credentials.",
    };
  }

  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser(bearerToken);
      if (!error && data?.user) {
        const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (allowedEmail && data.user.email?.toLowerCase() !== allowedEmail) {
          return {
            authorized: false,
            error: `Access denied. ${data.user.email} does not have administrator privileges.`,
          };
        }
        return { authorized: true, email: data.user.email };
      }
    } catch (err) {
      console.error("[Admin API] Auth verification error:", err);
    }
  }

  return {
    authorized: false,
    error: "Session expired or invalid credentials. Please sign in again.",
  };
}


export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  if (!hasSupabaseServerEnv()) {
    return NextResponse.json(
      {
        error:
          "Supabase environment variables are missing. Please check .env.local.",
      },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseClient();
    const { data: members, error } = await supabase
      .from("sago_collective_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin API] Failed to fetch members:", error);
      return NextResponse.json(
        { error: "Unable to retrieve member records at this time." },
        { status: 500 }
      );
    }

    const memberList = members || [];
    const total = memberList.length;

    // Calculate stats
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = memberList.filter(
      (m) => new Date(m.created_at) >= sevenDaysAgo
    ).length;

    const bartendersCount = memberList.filter((m) => Boolean(m.is_bartender)).length;

    const countryMap: Record<string, number> = {};
    for (const m of memberList) {
      const country = m.country || "Unspecified";
      countryMap[country] = (countryMap[country] || 0) + 1;
    }

    const topCountries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    return NextResponse.json({
      success: true,
      stats: {
        total,
        newThisWeek,
        bartendersCount,
        topCountries,
      },
      members: memberList,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load members";
    console.error("[Admin API] Unexpected error:", msg);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  if (!hasSupabaseServerEnv()) {
    return NextResponse.json(
      { error: "Database configuration is not available." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const id = body.id;

    if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Missing or invalid member id format." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("sago_collective_members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Admin API] Failed to delete member:", error);
      return NextResponse.json(
        { error: "Unable to remove member at this time." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member removed successfully.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete member";
    console.error("[Admin API] Delete unexpected error:", msg);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}

