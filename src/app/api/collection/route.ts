import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filterBy = url.searchParams.get("filterBy") ?? "all";
  const filterKey = url.searchParams.get("filterKey") ?? "";
  const sortBy = url.searchParams.get("sortBy") ?? "pokemon_id";
  const order = url.searchParams.get("order") === "desc" ? false : true;
  const limit = parseInt(url.searchParams.get("limit") ?? "18");
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  let query = supabase
    .from("collections")
    .select("*", { count: "exact" })
    .eq("owner_id", user.id);

  switch (filterBy) {
    case "type":
      if (filterKey) query = query.contains("type", [filterKey]);
      break;
    case "color":
      if (filterKey) query = query.eq("color", filterKey);
      break;
    case "can_evolve":
      query = query.not("evolves_to", "eq", "[]").not("evolves_to", "is", null).gte("count", 3);
      break;
    case "legendary":
      query = query.eq("is_legendary", true);
      break;
  }

  const validSortColumns = ["pokemon_id", "name_en", "rate", "first_at", "last_at", "count"];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "pokemon_id";

  query = query.order(sortColumn, { ascending: order }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [], total: count ?? 0 });
}
