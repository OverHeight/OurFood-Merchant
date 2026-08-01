import { useState, useEffect } from "react";
import { MenuItem } from "../types";
import {
  fetchMenuByMerchant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  fetchSalesCountsByMerchant,
} from "../services/menuService";
import { getMerchantId } from "../lib/supabase";
import { fetchKategori } from "../services/kategoriService";

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriList, setKategoriList] = useState<
    { id: string; nama: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const merchantId = getMerchantId();

  const loadData = async () => {
    setIsLoading(true);

    // Load categories first
    const kategori = await fetchKategori();
    setKategoriList(kategori);

    // Fetch menu items and sales count map
    const [dbMenu, salesMap] = await Promise.all([
      fetchMenuByMerchant(merchantId),
      fetchSalesCountsByMerchant(merchantId),
    ]);

    // Transform to frontend format
    const transformedMenu: MenuItem[] = dbMenu.map((dbItem) => ({
      menu_id: dbItem.menu_id,
      merchant_id: dbItem.merchant_id,
      kategori_id: dbItem.kategori_id || undefined,
      nama_menu: dbItem.nama_menu,
      harga: dbItem.harga,
      status_tersedia: dbItem.status_tersedia === "tersedia",
      image_url: dbItem.image_url || "",
      category: dbItem.kategori?.nama || "Uncategorized",
      stok: dbItem.stok ?? 0,
      description: dbItem.deskripsi || "",
      salesCount: salesMap[dbItem.menu_id] || 0,
    }));

    setMenuItems(transformedMenu);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [merchantId]);

  const handleUpdateStock = async (
    menuId: string | number,
    newStock: number,
  ) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.menu_id === menuId
          ? {
              ...item,
              stok: newStock,
              status_tersedia: newStock > 0,
            }
          : item,
      ),
    );

    const updated = await updateMenuItem(menuId.toString(), {
      stok: newStock,
      status_tersedia: newStock > 0 ? "tersedia" : "habis",
    });

    if (!updated) {
      await loadData();
    }
  };

  const handleToggleAvailability = async (menuId: string | number) => {
    const itemToUpdate = menuItems.find((m) => m.menu_id === menuId);
    if (!itemToUpdate) return;

    const newStatus = !itemToUpdate.status_tersedia;

    setMenuItems((prev) =>
      prev.map((item) =>
        item.menu_id === menuId
          ? { ...item, status_tersedia: newStatus }
          : item,
      ),
    );

    await updateMenuItem(menuId.toString(), {
      status_tersedia: newStatus ? "tersedia" : "habis",
    });
  };

  const handleAddMenu = async (newItem: Omit<MenuItem, "menu_id">) => {
    const matchedCategory = kategoriList.find(
      (k) => k.nama === newItem.category,
    );
    // Fix: if no matching category, set kategori_id to null instead of ""
    const categoryId = matchedCategory
      ? matchedCategory.id
      : kategoriList[0]?.id || null;

    const insertedMenu = await addMenuItem({
      merchant_id: merchantId,
      kategori_id: categoryId,
      nama_menu: newItem.nama_menu,
      harga: newItem.harga,
      status_tersedia: newItem.status_tersedia ? "tersedia" : "habis",
      image_url: newItem.image_url || null,
      deskripsi: newItem.description || "",
      stok: newItem.stok ?? 0,
    });

    if (insertedMenu) {
      await loadData();
    }
  };

  const handleEditMenu = async (
    menuId: string | number,
    updatedData: Partial<MenuItem>,
  ) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.menu_id === menuId ? { ...item, ...updatedData } : item,
      ),
    );

    const payload: any = {};
    if (updatedData.nama_menu !== undefined)
      payload.nama_menu = updatedData.nama_menu;
    if (updatedData.harga !== undefined) payload.harga = updatedData.harga;
    if (updatedData.status_tersedia !== undefined)
      payload.status_tersedia = updatedData.status_tersedia
        ? "tersedia"
        : "habis";
    if (updatedData.image_url !== undefined)
      payload.image_url = updatedData.image_url;
    if (updatedData.description !== undefined)
      payload.deskripsi = updatedData.description;

    if (updatedData.category !== undefined) {
      const matchedCategory = kategoriList.find(
        (k) => k.nama === updatedData.category,
      );
      if (matchedCategory) {
        payload.kategori_id = matchedCategory.id;
      }
    }

    if (updatedData.stok !== undefined) {
      payload.stok = updatedData.stok;
    }

    if (Object.keys(payload).length > 0) {
      await updateMenuItem(menuId.toString(), payload);
    }
  };

  const handleDeleteMenu = async (menuId: string | number) => {
    const previousItems = menuItems;
    setMenuItems((prev) => prev.filter((item) => item.menu_id !== menuId));

    const deleted = await deleteMenuItem(menuId.toString());
    if (!deleted) {
      setMenuItems(previousItems);
    }
    return deleted;
  };

  return {
    menuItems,
    kategoriList,
    isLoading,
    loadData,
    handleUpdateStock,
    handleToggleAvailability,
    handleAddMenu,
    handleEditMenu,
    handleDeleteMenu,
  };
}
