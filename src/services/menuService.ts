import { supabase } from "../lib/supabase";
import { DbMenu, DbMenuInsert } from "../lib/database.types";

export async function fetchMenuByMerchant(
  merchantId: string,
): Promise<(DbMenu & { kategori?: { nama: string } | null })[]> {
  // Query menu items directly
  const { data: menuData, error: menuError } = await supabase
    .from("menu")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("nama_menu");

  if (menuError) {
    console.error("Error fetching menu:", menuError);
    return [];
  }

  if (!menuData || menuData.length === 0) return [];

  // Query categories map to avoid PostgREST relational 406 header errors
  const { data: catData } = await supabase.from("kategori").select("*");
  const catMap = new Map((catData || []).map((c) => [c.id, c.nama]));

  return menuData.map((item) => ({
    ...item,
    kategori: item.kategori_id && catMap.has(item.kategori_id)
      ? { nama: catMap.get(item.kategori_id)! }
      : null,
  }));
}

export async function addMenuItem(item: DbMenuInsert): Promise<DbMenu | null> {
  const { data, error } = await supabase
    .from("menu")
    .insert(item)
    .select();

  if (error) {
    console.error("Error adding menu item:", error);
    return null;
  }
  return data?.[0] ?? null;
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
    .select();

  if (error) {
    console.error("Error updating menu item:", error);
    return null;
  }
  return data?.[0] ?? null;
}

export async function fetchMenuItemById(
  menuId: string,
): Promise<DbMenu | null> {
  const { data, error } = await supabase
    .from("menu")
    .select("*")
    .eq("menu_id", menuId);

  if (error || !data || data.length === 0) {
    console.error("Error fetching menu item:", error);
    return null;
  }
  return data[0];
}

export async function decrementMenuStock(
  menuId: string,
  decrementBy: number,
): Promise<DbMenu | null> {
  const existing = await fetchMenuItemById(menuId);
  if (!existing) return null;

  const currentStock = existing.stok ?? 0;
  const nextStock = Math.max(0, currentStock - decrementBy);
  const nextStatus = nextStock > 0 ? (existing.status_tersedia || "tersedia") : "habis";

  const { data, error } = await supabase
    .from("menu")
    .update({ stok: nextStock, status_tersedia: nextStatus })
    .eq("menu_id", menuId)
    .select();

  if (error) {
    console.error("Error decrementing menu stock:", error);
    return null;
  }

  return data?.[0] ?? null;
}

export async function fetchSalesCountsByMerchant(
  merchantId: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("order_item")
    .select("menu_id, jumlah");

  if (error || !data) {
    console.error("Error fetching order_item for salesCount:", error);
    return {};
  }

  const salesMap: Record<string, number> = {};
  data.forEach((item) => {
    if (item.menu_id) {
      salesMap[item.menu_id] = (salesMap[item.menu_id] || 0) + (item.jumlah || 0);
    }
  });

  return salesMap;
}

export async function deleteMenuItem(menuId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("menu")
    .delete()
    .eq("menu_id", menuId)
    .select();

  if (error) {
    console.error("Error deleting menu item:", error);
    return false;
  }

  return (data && data.length > 0) ?? true;
}

export async function uploadMenuImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const bucketName = 'menu-images';

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type || undefined,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Storage Error] Failed to upload menu image:', uploadError.message || uploadError);
      alert(`Gagal mengunggah gambar: ${uploadError.message || 'Periksa Storage Policies di Supabase.'}`);
      return null;
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return data?.publicUrl || null;
  } catch (err) {
    console.error('Failed to upload menu image:', err);
    return null;
  }
}
