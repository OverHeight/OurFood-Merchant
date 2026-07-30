import { useState, useEffect } from "react";
import { MenuItem } from "../types";
import {
  fetchMenuByMerchant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../services/menuService";
import { CURRENT_MERCHANT_ID } from "../lib/supabase";
import { fetchKategori } from "../services/kategoriService";

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriList, setKategoriList] = useState<
    { id: string; nama: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);

    // Load categories first
    const kategori = await fetchKategori();
    setKategoriList(kategori);

    // Then load menu items
    const dbMenu = await fetchMenuByMerchant(CURRENT_MERCHANT_ID);

    // Transform to frontend format
    const transformedMenu: MenuItem[] = dbMenu.map((dbItem) => ({
      menu_id: dbItem.menu_id,
      merchant_id: dbItem.merchant_id,
      kategori_id: dbItem.kategori_id,
      nama_menu: dbItem.nama_menu,
      harga: dbItem.harga,
      status_tersedia: dbItem.status_tersedia === "tersedia",
      image_url: dbItem.image_url || "",
      category: dbItem.kategori?.nama || "Uncategorized",
      stok: dbItem.stok ?? 0,
      description: dbItem.deskripsi || "",
      salesCount: 0,
    }));

    setMenuItems(transformedMenu);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
      // Restore current state from DB if saving failed
      await loadData();
    }
  };

  const handleToggleAvailability = async (menuId: string | number) => {
    const itemToUpdate = menuItems.find((m) => m.menu_id === menuId);
    if (!itemToUpdate) return;

    const newStatus = !itemToUpdate.status_tersedia;

    // Optimistic update
    setMenuItems((prev) =>
      prev.map((item) =>
        item.menu_id === menuId
          ? { ...item, status_tersedia: newStatus }
          : item,
      ),
    );

    // Send to Supabase
    await updateMenuItem(menuId.toString(), {
      status_tersedia: newStatus ? "tersedia" : "habis",
    });
  };

  const handleAddMenu = async (newItem: Omit<MenuItem, "menu_id">) => {
    // Find category ID based on name, or use first available
    const matchedCategory = kategoriList.find(
      (k) => k.nama === newItem.category,
    );
    const categoryId = matchedCategory
      ? matchedCategory.id
      : kategoriList[0]?.id || "";

    const insertedMenu = await addMenuItem({
      merchant_id: CURRENT_MERCHANT_ID,
      kategori_id: categoryId,
      nama_menu: newItem.nama_menu,
      harga: newItem.harga,
      status_tersedia: newItem.status_tersedia ? "tersedia" : "habis",
      image_url: newItem.image_url || null,
      deskripsi: newItem.description || "",
      stok: newItem.stok,
    });

    if (insertedMenu) {
      await loadData(); // Reload to get fresh data with joined relations
    }
  };

  const handleEditMenu = async (
    menuId: string | number,
    updatedData: Partial<MenuItem>,
  ) => {
    // Optimistic update locally
    setMenuItems((prev) =>
      prev.map((item) =>
        item.menu_id === menuId ? { ...item, ...updatedData } : item,
      ),
    );

    // Prepare Supabase update payload
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

    // If category changed, we need to map to kategori_id
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
