import { supabase } from "../lib/supabase";
import { DbMenu, DbMenuInsert } from "../lib/database.types";

export async function fetchMenuByMerchant(
  merchantId: string,
): Promise<(DbMenu & { kategori?: { nama: string } | null })[]> {
  const { data, error } = await supabase
    .from("menu")
    .select("*, kategori(nama)")
    .eq("merchant_id", merchantId)
    .order("nama_menu");

  if (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
  return data ?? [];
}

export async function addMenuItem(item: DbMenuInsert): Promise<DbMenu | null> {
  const { data, error } = await supabase
    .from("menu")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("Error adding menu item:", error);
    return null;
  }
  return data;
}

export async function updateMenuItem(
  menuId: string,
  updates: Partial<
    Pick<
      DbMenu,
      | "nama_menu"
      | "harga"
      | "status_tersedia"
      | "image_url"
      | "kategori_id"
      | "deskripsi"
      | "stok"
    >
  >,
): Promise<DbMenu | null> {
  const { data, error } = await supabase
    .from("menu")
    .update(updates)
    .eq("menu_id", menuId)
    .select()
    .single();

  if (error) {
    console.error("Error updating menu item:", error);
    return null;
  }
  return data;
}
export async function fetchMenuItemById(
  menuId: string,
): Promise<DbMenu | null> {
  const { data, error } = await supabase
    .from("menu")
    .select()
    .eq("menu_id", menuId)
    .single();

  if (error || !data) {
    console.error("Error fetching menu item:", error);
    return null;
  }
  return data;
}

export async function decrementMenuStock(
  menuId: string,
  decrementBy: number,
): Promise<DbMenu | null> {
  const existing = await fetchMenuItemById(menuId);
  if (!existing) return null;

  const nextStock = Math.max(0, existing.stok - decrementBy);
  const nextStatus = nextStock > 0 ? existing.status_tersedia : "habis";

  const { data, error } = await supabase
    .from("menu")
    .update({ stok: nextStock, status_tersedia: nextStatus })
    .eq("menu_id", menuId)
    .select()
    .single();

  if (error) {
    console.error("Error decrementing menu stock:", error);
    return null;
  }

  return data;
}
export async function deleteMenuItem(menuId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("menu")
    .delete()
    .eq("menu_id", menuId)
    .select()
    .single();

  if (error) {
    console.error("Error deleting menu item:", error);
    return false;
  }

  return Boolean(data);
}
