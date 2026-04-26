import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";
import { formatDateID, formatRupiah } from "@/lib/utils";

const itemDefaults = { name: "", category_id: "", unit: "pcs", current_stock: "", min_stock: "" };
const supplierDefaults = { name: "", contact_phone: "", email: "", address: "" };
const purchaseDefaults = { supplier_id: "", item_id: "", qty: "", unit_price: "", date: "" };
const usageDefaults = { item_id: "", qty: "", reason: "", date: "" };

export function InventoryPage() {
  const [overview, setOverview] = useState({
    items: [],
    categories: [],
    suppliers: [],
    purchases: [],
    usages: [],
  });
  const [itemForm, setItemForm] = useState(itemDefaults);
  const [supplierForm, setSupplierForm] = useState(supplierDefaults);
  const [purchaseForm, setPurchaseForm] = useState(purchaseDefaults);
  const [usageForm, setUsageForm] = useState(usageDefaults);

  const loadData = async () => {
    try {
      const response = await api.get("/inventory/overview");
      setOverview(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tambah Item Inventori</CardTitle>
              <CardDescription>Atur stok awal dan batas minimum untuk alert.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nama item">
                <Input value={itemForm.name} onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))} />
              </FormField>
              <FormField label="Kategori">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={itemForm.category_id}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Pilih kategori</option>
                  {overview.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Satuan">
                <Input value={itemForm.unit} onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))} />
              </FormField>
              <FormField label="Stok awal">
                <Input
                  type="number"
                  min="0"
                  value={itemForm.current_stock}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, current_stock: e.target.value }))}
                />
              </FormField>
              <FormField label="Stok minimum">
                <Input
                  type="number"
                  min="0"
                  value={itemForm.min_stock}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, min_stock: e.target.value }))}
                />
              </FormField>
            </div>
            <Button
              onClick={async () => {
                try {
                  if (!itemForm.name || !itemForm.category_id) {
                    toast.error("Nama dan kategori item wajib diisi.");
                    return;
                  }
                  await api.post("/inventory/items", {
                    ...itemForm,
                    current_stock: Number(itemForm.current_stock || 0),
                    min_stock: Number(itemForm.min_stock || 0),
                  });
                  toast.success("Item inventori ditambahkan.");
                  setItemForm(itemDefaults);
                  await loadData();
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Simpan Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tambah Supplier</CardTitle>
              <CardDescription>Simpan vendor utama untuk pembelian stok.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nama supplier">
                <Input value={supplierForm.name} onChange={(e) => setSupplierForm((prev) => ({ ...prev, name: e.target.value }))} />
              </FormField>
              <FormField label="Nomor HP">
                <Input
                  value={supplierForm.contact_phone}
                  onChange={(e) => setSupplierForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
                />
              </FormField>
              <FormField label="Email">
                <Input value={supplierForm.email} onChange={(e) => setSupplierForm((prev) => ({ ...prev, email: e.target.value }))} />
              </FormField>
              <FormField label="Alamat">
                <Input value={supplierForm.address} onChange={(e) => setSupplierForm((prev) => ({ ...prev, address: e.target.value }))} />
              </FormField>
            </div>
            <Button
              onClick={async () => {
                try {
                  if (!supplierForm.name) {
                    toast.error("Nama supplier wajib diisi.");
                    return;
                  }
                  await api.post("/inventory/suppliers", supplierForm);
                  toast.success("Supplier berhasil ditambahkan.");
                  setSupplierForm(supplierDefaults);
                  await loadData();
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Simpan Supplier
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pembelian Stok</CardTitle>
              <CardDescription>Konfirmasi pembelian akan menambah stok item otomatis.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Supplier">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={purchaseForm.supplier_id}
                  onChange={(e) => setPurchaseForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
                >
                  <option value="">Pilih supplier</option>
                  {overview.suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Item">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={purchaseForm.item_id}
                  onChange={(e) => setPurchaseForm((prev) => ({ ...prev, item_id: e.target.value }))}
                >
                  <option value="">Pilih item</option>
                  {overview.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Qty">
                <Input
                  type="number"
                  min="1"
                  value={purchaseForm.qty}
                  onChange={(e) => setPurchaseForm((prev) => ({ ...prev, qty: e.target.value }))}
                />
              </FormField>
              <FormField label="Harga satuan">
                <Input
                  type="number"
                  min="0"
                  value={purchaseForm.unit_price}
                  onChange={(e) => setPurchaseForm((prev) => ({ ...prev, unit_price: e.target.value }))}
                />
              </FormField>
              <FormField label="Tanggal">
                <Input
                  type="date"
                  value={purchaseForm.date}
                  onChange={(e) => setPurchaseForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </FormField>
            </div>
            <Button
              onClick={async () => {
                try {
                  if (!purchaseForm.supplier_id || !purchaseForm.item_id || !purchaseForm.qty) {
                    toast.error("Supplier, item, dan qty wajib diisi.");
                    return;
                  }
                  await api.post("/inventory/purchases", {
                    ...purchaseForm,
                    qty: Number(purchaseForm.qty),
                    unit_price: Number(purchaseForm.unit_price || 0),
                  });
                  toast.success("Pembelian stok berhasil dicatat.");
                  setPurchaseForm(purchaseDefaults);
                  await loadData();
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Simpan Pembelian
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Penggunaan Stok</CardTitle>
              <CardDescription>Setiap penggunaan akan langsung mengurangi stok item terkait.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Item">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={usageForm.item_id}
                  onChange={(e) => setUsageForm((prev) => ({ ...prev, item_id: e.target.value }))}
                >
                  <option value="">Pilih item</option>
                  {overview.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Qty">
                <Input
                  type="number"
                  min="1"
                  value={usageForm.qty}
                  onChange={(e) => setUsageForm((prev) => ({ ...prev, qty: e.target.value }))}
                />
              </FormField>
              <FormField label="Alasan">
                <Input value={usageForm.reason} onChange={(e) => setUsageForm((prev) => ({ ...prev, reason: e.target.value }))} />
              </FormField>
              <FormField label="Tanggal">
                <Input
                  type="date"
                  value={usageForm.date}
                  onChange={(e) => setUsageForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </FormField>
            </div>
            <Button
              onClick={async () => {
                try {
                  if (!usageForm.item_id || !usageForm.qty || !usageForm.reason) {
                    toast.error("Item, qty, dan alasan penggunaan wajib diisi.");
                    return;
                  }
                  await api.post("/inventory/usages", {
                    ...usageForm,
                    qty: Number(usageForm.qty),
                  });
                  toast.success("Penggunaan stok berhasil dicatat.");
                  setUsageForm(usageDefaults);
                  await loadData();
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Simpan Penggunaan
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ringkasan Inventori</CardTitle>
            <CardDescription>Stok saat ini, histori pembelian, dan penggunaan stok.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div>
            <Table>
              <THead>
                <TR>
                  <TH>Item</TH>
                  <TH>Kategori</TH>
                  <TH>Stok</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {overview.items.map((item) => (
                  <TR key={item.id}>
                    <TD>{item.name}</TD>
                    <TD>{item.category?.name}</TD>
                    <TD>
                      {item.current_stock} {item.unit}
                    </TD>
                    <TD>
                      <Badge tone={Number(item.current_stock) <= Number(item.min_stock) ? "warning" : "success"}>
                        {Number(item.current_stock) <= Number(item.min_stock) ? "Perlu restock" : "Aman"}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <div className="space-y-4">
            <div>
              <p className="mb-3 font-medium">Pembelian Terbaru</p>
              <div className="space-y-3">
                {overview.purchases.map((purchase) => (
                  <div key={purchase.id} className="rounded-2xl border border-border bg-white p-4">
                    <p className="font-medium">{purchase.supplier?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateID(purchase.date)} • {formatRupiah(purchase.total_amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 font-medium">Penggunaan Terbaru</p>
              <div className="space-y-3">
                {overview.usages.map((usage) => (
                  <div key={usage.id} className="rounded-2xl border border-border bg-white p-4">
                    <p className="font-medium">{usage.item?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {usage.qty} {usage.item?.unit} • {usage.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

