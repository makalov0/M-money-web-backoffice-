// src/pages/MenusPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import { Plus, Edit2, Trash2, X, List, Layers, Image as ImgIcon } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

/* =====================
   Types (UI uses short keys)
===================== */
export type Menu = {
  id: number;
  name: string;
  name_lao: string;

  group_na?: string | null;
  order_ind?: number | null;
  order_gro?: number | null;

  status: string; // "A"
  image?: string | null; // can be "/uploads/xxx.png" OR "https://...."
  descriptio?: string | null;

  created_a?: string;
  updated_a?: string;
};

export type Submenu = {
  id: number;
  menu_id: number;
  name: string;
  name_lao: string;

  group_na?: string | null;
  order_ind?: number | null;
  order_gro?: number | null;

  status: string; // "A"
  image?: string | null; // "/uploads/..." OR "https://..."
  descriptio?: string | null;

  created_a?: string;
  updated_a?: string;
};

type ApiResponse<T> = {
  status: boolean;
  data: T;
  message?: string;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const getServerOrigin = (apiBase: string) => {
  const idx = apiBase.lastIndexOf("/api");
  return idx > -1 ? apiBase.slice(0, idx) : apiBase;
};
const SERVER_ORIGIN = getServerOrigin(API);

/* =====================
   Helpers
===================== */
const resolveImageUrl = (serverOrigin: string, img?: string | null) => {
  if (!img) return null;

  // ✅ already full url
  if (img.startsWith("http://") || img.startsWith("https://")) return img;

  // ✅ local upload path: /uploads/xxx.png
  return `${serverOrigin}${img}`;
};

/* =====================
   API <-> UI mapping
===================== */
type MenuApiRow = {
  id: number;
  name: string;
  name_lao: string;
  group_name?: string | null;
  order_index?: number | null;
  order_group_index?: number | null;
  status: string;
  image?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SubmenuApiRow = {
  id: number;
  menu_id: number;
  name: string;
  name_lao: string;
  group_name?: string | null;
  order_index?: number | null;
  order_group_index?: number | null;
  status: string;
  image?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

function menuApiToUi(r: MenuApiRow): Menu {
  return {
    id: r.id,
    name: r.name,
    name_lao: r.name_lao,
    group_na: r.group_name ?? null,
    order_ind: r.order_index ?? null,
    order_gro: r.order_group_index ?? null,
    status: r.status,
    image: r.image ?? null,
    descriptio: r.description ?? null,
    created_a: r.created_at,
    updated_a: r.updated_at,
  };
}

function submenuApiToUi(r: SubmenuApiRow): Submenu {
  return {
    id: r.id,
    menu_id: r.menu_id,
    name: r.name,
    name_lao: r.name_lao,
    group_na: r.group_name ?? null,
    order_ind: r.order_index ?? null,
    order_gro: r.order_group_index ?? null,
    status: r.status,
    image: r.image ?? null,
    descriptio: r.description ?? null,
    created_a: r.created_at,
    updated_a: r.updated_at,
  };
}

/* =====================
   Build FormData (multipart)
   Backend expects fields:
   name, name_lao, group_name, order_index, order_group_index, status, description
   and file field name: "image"
===================== */
function toStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v === null || v === undefined) return "";
  return String(v);
}

function buildMenuFormData(form: Partial<Menu>, file: File | null): FormData {
  const fd = new FormData();
  fd.append("name", toStr(form.name));
  fd.append("name_lao", toStr(form.name_lao));
  fd.append("group_name", toStr(form.group_na ?? ""));
  fd.append("order_index", toStr(form.order_ind ?? ""));
  fd.append("order_group_index", toStr(form.order_gro ?? ""));
  fd.append("status", toStr(form.status ?? "A"));
  fd.append("description", toStr(form.descriptio ?? ""));

  // keep old image (string) when editing and no file chosen
  if (!file && form.image) fd.append("image", form.image);

  if (file) fd.append("image", file);
  return fd;
}

function buildSubmenuFormData(form: Partial<Submenu>, menuId: number, file: File | null): FormData {
  const fd = new FormData();
  fd.append("menu_id", toStr(form.menu_id ?? menuId));
  fd.append("name", toStr(form.name));
  fd.append("name_lao", toStr(form.name_lao));
  fd.append("group_name", toStr(form.group_na ?? ""));
  fd.append("order_index", toStr(form.order_ind ?? ""));
  fd.append("order_group_index", toStr(form.order_gro ?? ""));
  fd.append("status", toStr(form.status ?? "A"));
  fd.append("description", toStr(form.descriptio ?? ""));

  if (!file && form.image) fd.append("image", form.image);
  if (file) fd.append("image", file);
  return fd;
}

/* =====================
   Thumb component (shows fallback icon if broken)
===================== */
function Thumb({ url }: { url: string | null }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
      {!url || broken ? (
        <ImgIcon size={18} className="text-gray-400" />
      ) : (
        <img
          src={url}
          alt="thumb"
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}

/* =====================
   Page
===================== */
export default function MenusPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [menus, setMenus] = useState<Menu[]>([]);
  const [submenus, setSubmenus] = useState<Submenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingSub, setEditingSub] = useState<Submenu | null>(null);

  const [menuForm, setMenuForm] = useState<Partial<Menu>>({});
  const [subForm, setSubForm] = useState<Partial<Submenu>>({});

  // ✅ selected files
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [subFile, setSubFile] = useState<File | null>(null);

  /* =====================
     Fetch
  ===================== */
  const fetchMenus = async () => {
    const res = await axios.get<ApiResponse<MenuApiRow[]>>(`${API}/menus`);
    const rows = res.data.data || [];
    setMenus(rows.map(menuApiToUi));
  };

  const fetchSubmenus = async (menuId: number) => {
    const res = await axios.get<ApiResponse<SubmenuApiRow[]>>(
      `${API}/submenus?menu_id=${menuId}`
    );
    const rows = res.data.data || [];
    setSubmenus(rows.map(submenuApiToUi));
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingMenus(true);
        await fetchMenus();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load menus";
        toast.error(msg);
      } finally {
        setLoadingMenus(false);
      }
    })();
  }, []);

  /* =====================
     Handlers
  ===================== */
  const selectMenu = async (m: Menu) => {
    try {
      setSelectedMenu(m);
      setLoadingSubs(true);
      await fetchSubmenus(m.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load submenus";
      toast.error(msg);
    } finally {
      setLoadingSubs(false);
    }
  };

  const openAddMenu = () => {
    setEditingMenu(null);
    setMenuFile(null);
    setMenuForm({
      name: "",
      name_lao: "",
      group_na: "Services",
      order_ind: 1,
      order_gro: 1,
      status: "A",
      image: null,
      descriptio: "",
    });
    setShowMenuModal(true);
  };

  const openEditMenu = (m: Menu) => {
    setEditingMenu(m);
    setMenuFile(null);
    setMenuForm({
      ...m,
      order_ind: m.order_ind ?? 0,
      order_gro: m.order_gro ?? 0,
    });
    setShowMenuModal(true);
  };

  const openAddSub = () => {
    if (!selectedMenu) return;

    setEditingSub(null);
    setSubFile(null);
    setSubForm({
      menu_id: selectedMenu.id,
      name: "",
      name_lao: "",
      group_na: selectedMenu.group_na ?? "Services",
      order_ind: 1,
      order_gro: selectedMenu.order_gro ?? 1,
      status: "A",
      image: null,
      descriptio: "",
    });
    setShowSubModal(true);
  };

  const openEditSub = (s: Submenu) => {
    setEditingSub(s);
    setSubFile(null);
    setSubForm({
      ...s,
      order_ind: s.order_ind ?? 0,
      order_gro: s.order_gro ?? 0,
    });
    setShowSubModal(true);
  };

  const saveMenu = async () => {
    try {
      if (!menuForm.name || !menuForm.name_lao) {
        toast.error("Please fill name and name_lao");
        return;
      }

      const fd = buildMenuFormData(menuForm, menuFile);

      if (editingMenu) {
        await axios.put(`${API}/menus/${editingMenu.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("ແກ້ໄຂເມນູສຳເລັດ");
      } else {
        await axios.post(`${API}/menus`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("ເພີ່ມເມນູສຳເລັດ");
      }

      setShowMenuModal(false);
      setMenuFile(null);
      await fetchMenus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save menu failed";
      toast.error(msg);
    }
  };

  const saveSubmenu = async () => {
    if (!selectedMenu) return;

    try {
      if (!subForm.name || !subForm.name_lao) {
        toast.error("Please fill name and name_lao");
        return;
      }

      const fd = buildSubmenuFormData(subForm, selectedMenu.id, subFile);

      if (editingSub) {
        await axios.put(`${API}/submenus/${editingSub.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("ແກ້ໄຂ Submenu ສຳເລັດ");
      } else {
        await axios.post(`${API}/submenus`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("ເພີ່ມ Submenu ສຳເລັດ");
      }

      setShowSubModal(false);
      setSubFile(null);
      await fetchSubmenus(selectedMenu.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save submenu failed";
      toast.error(msg);
    }
  };

  const deleteMenu = async (id: number) => {
    try {
      if (!window.confirm("ຢືນຢັນລຶບເມນູ?")) return;

      await axios.delete(`${API}/menus/${id}`);
      toast.success("ລຶບເມນູແລ້ວ");

      setSelectedMenu(null);
      setSubmenus([]);
      await fetchMenus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete menu failed";
      toast.error(msg);
    }
  };

  const deleteSub = async (id: number) => {
    if (!selectedMenu) return;

    try {
      if (!window.confirm("ຢືນຢັນລຶບ Submenu?")) return;

      await axios.delete(`${API}/submenus/${id}`);
      toast.success("ລຶບ Submenu ແລ້ວ");

      await fetchSubmenus(selectedMenu.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete submenu failed";
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onToggle={setSidebarOpen} />

      <div
        className="flex-1 transition-all"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        <Navbar title="ຈັດການເມນູ & Submenu" />

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MENUS */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="font-bold flex items-center gap-2">
                <List size={18} /> ເມນູ
              </h2>
              <button
                onClick={openAddMenu}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
              >
                <Plus size={16} /> ເພີ່ມ
              </button>
            </div>

            {loadingMenus ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <ul className="divide-y">
                {menus.map((m) => (
                  <li
                    key={m.id}
                    onClick={() => selectMenu(m)}
                    className={`p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 ${
                      selectedMenu?.id === m.id ? "bg-red-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Thumb url={resolveImageUrl(SERVER_ORIGIN, m.image)} />

                      <div>
                        <p className="font-semibold">{m.name_lao}</p>
                        <p className="text-sm text-gray-500">{m.name}</p>
                        <p className="text-xs text-gray-400">
                          group: {m.group_na ?? "-"} | order: {(m.order_gro ?? 0)}/
                          {(m.order_ind ?? 0)} | status: {m.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditMenu(m);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMenu(m.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}

                {menus.length === 0 && (
                  <li className="p-8 text-center text-gray-500">ບໍ່ມີເມນູ</li>
                )}
              </ul>
            )}
          </div>

          {/* SUBMENUS */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="font-bold flex items-center gap-2">
                <Layers size={18} /> Submenu
              </h2>
              <button
                disabled={!selectedMenu}
                onClick={openAddSub}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={16} /> ເພີ່ມ
              </button>
            </div>

            {!selectedMenu ? (
              <div className="p-8 text-center text-gray-500">ເລືອກເມນູກ່ອນ</div>
            ) : loadingSubs ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <ul className="divide-y">
                {submenus.map((s) => (
                  <li
                    key={s.id}
                    className="p-4 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <Thumb url={resolveImageUrl(SERVER_ORIGIN, s.image)} />

                      <div>
                        <p className="font-semibold">{s.name_lao}</p>
                        <p className="text-sm text-gray-500">{s.name}</p>
                        <p className="text-xs text-gray-400">
                          order: {(s.order_gro ?? 0)}/{(s.order_ind ?? 0)} | status:{" "}
                          {s.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditSub(s)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteSub(s.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}

                {submenus.length === 0 && (
                  <li className="p-8 text-center text-gray-500">ບໍ່ມີ Submenu</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showMenuModal && (
        <MenuModal
          title={editingMenu ? "ແກ້ໄຂເມນູ" : "ເພີ່ມເມນູ"}
          form={menuForm}
          setForm={setMenuForm}
          file={menuFile}
          setFile={setMenuFile}
          serverOrigin={SERVER_ORIGIN}
          onClose={() => setShowMenuModal(false)}
          onSave={saveMenu}
        />
      )}

      {showSubModal && selectedMenu && (
        <SubmenuModal
          title={editingSub ? "ແກ້ໄຂ Submenu" : "ເພີ່ມ Submenu"}
          form={subForm}
          setForm={setSubForm}
          file={subFile}
          setFile={setSubFile}
          serverOrigin={SERVER_ORIGIN}
          onClose={() => setShowSubModal(false)}
          onSave={saveSubmenu}
          menuId={selectedMenu.id}
        />
      )}
    </div>
  );
}

/* =====================
   Menu Modal (with upload)
===================== */
type MenuModalProps = {
  title: string;
  form: Partial<Menu>;
  setForm: (next: Partial<Menu>) => void;

  file: File | null;
  setFile: (f: File | null) => void;

  serverOrigin: string;

  onClose: () => void;
  onSave: () => void;
};

function MenuModal({
  title,
  form,
  setForm,
  file,
  setFile,
  serverOrigin,
  onClose,
  onSave,
}: MenuModalProps) {
  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ✅ handle both https://... and /uploads/...
  const currentImageUrl = !file ? resolveImageUrl(serverOrigin, form.image) : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 bg-red-600 text-white flex justify-between items-center">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            placeholder="Name (EN)"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            placeholder="ຊື່ (ລາວ)"
            value={form.name_lao ?? ""}
            onChange={(e) => setForm({ ...form, name_lao: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            placeholder="group_na"
            value={form.group_na ?? ""}
            onChange={(e) => setForm({ ...form, group_na: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="order_gro"
              value={form.order_gro ?? 0}
              onChange={(e) => setForm({ ...form, order_gro: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="order_ind"
              value={form.order_ind ?? 0}
              onChange={(e) => setForm({ ...form, order_ind: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={form.status ?? "A"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="A">A (Active)</option>
            <option value="I">I (Inactive)</option>
          </select>

          {/* ✅ Upload image */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">Image Upload</div>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                setFile(f);
              }}
              className="mt-2 w-full"
            />

            <div className="mt-3">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full max-h-48 object-cover rounded-lg" />
              ) : currentImageUrl ? (
                <img src={currentImageUrl} alt="current" className="w-full max-h-48 object-cover rounded-lg" />
              ) : (
                <div className="text-sm text-gray-500">No image</div>
              )}
            </div>
          </div>

          <textarea
            placeholder="descriptio"
            value={form.descriptio ?? ""}
            onChange={(e) => setForm({ ...form, descriptio: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
        </div>

        <div className="p-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            ຍົກເລີກ
          </button>
          <button onClick={onSave} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            ບັນທຶກ
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================
   Submenu Modal (with upload)
===================== */
type SubmenuModalProps = {
  title: string;
  form: Partial<Submenu>;
  setForm: (next: Partial<Submenu>) => void;

  file: File | null;
  setFile: (f: File | null) => void;

  serverOrigin: string;

  onClose: () => void;
  onSave: () => void;
  menuId: number;
};

function SubmenuModal({
  title,
  form,
  setForm,
  file,
  setFile,
  serverOrigin,
  onClose,
  onSave,
  menuId,
}: SubmenuModalProps) {
  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const currentImageUrl = !file ? resolveImageUrl(serverOrigin, form.image) : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 bg-red-600 text-white flex justify-between items-center">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-500">
            menu_id: <span className="font-semibold">{menuId}</span>
          </div>

          <input
            placeholder="Name (EN)"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            placeholder="ຊື່ (ລາວ)"
            value={form.name_lao ?? ""}
            onChange={(e) => setForm({ ...form, name_lao: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            placeholder="group_na"
            value={form.group_na ?? ""}
            onChange={(e) => setForm({ ...form, group_na: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="order_gro"
              value={form.order_gro ?? 0}
              onChange={(e) => setForm({ ...form, order_gro: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="order_ind"
              value={form.order_ind ?? 0}
              onChange={(e) => setForm({ ...form, order_ind: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={form.status ?? "A"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="A">A (Active)</option>
            <option value="I">I (Inactive)</option>
          </select>

          {/* ✅ Upload image */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">Image Upload</div>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                setFile(f);
              }}
              className="mt-2 w-full"
            />

            <div className="mt-3">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full max-h-48 object-cover rounded-lg" />
              ) : currentImageUrl ? (
                <img src={currentImageUrl} alt="current" className="w-full max-h-48 object-cover rounded-lg" />
              ) : (
                <div className="text-sm text-gray-500">No image</div>
              )}
            </div>
          </div>

          <textarea
            placeholder="descriptio"
            value={form.descriptio ?? ""}
            onChange={(e) => setForm({ ...form, descriptio: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
        </div>

        <div className="p-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            ຍົກເລີກ
          </button>
          <button
            onClick={() => {
              // ensure menu_id always correct
              setForm({ ...form, menu_id: menuId });
              onSave();
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ບັນທຶກ
          </button>
        </div>
      </div>
    </div>
  );
}
