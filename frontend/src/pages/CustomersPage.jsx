import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";

const initialForm = { id: null, name: "", phone: "", email: "", address: "", notes: "" };

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    try {
      const response = await api.get("/customers", { search });
      setCustomers(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{form.id ? "Edit Konsumen" : "Tambah Konsumen"}</CardTitle>
            <CardDescription>Kelola data konsumen untuk CRM dasar dan histori transaksi berikutnya.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Nama">
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nomor HP">
              <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </FormField>
            <FormField label="Email">
              <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Alamat">
            <Textarea value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          </FormField>
          <FormField label="Catatan">
            <Textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </FormField>
          <div className="flex gap-3">
            <Button
              onClick={async () => {
                try {
                  if (!form.name || !form.phone) {
                    toast.error("Nama dan nomor HP wajib diisi.");
                    return;
                  }
                  if (form.id) {
                    await api.put(`/customers/${form.id}`, form);
                    toast.success("Data konsumen diperbarui.");
                  } else {
                    await api.post("/customers", form);
                    toast.success("Konsumen berhasil ditambahkan.");
                  }
                  setForm(initialForm);
                  await loadCustomers();
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Simpan
            </Button>
            <Button variant="ghost" onClick={() => setForm(initialForm)}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Daftar Konsumen</CardTitle>
            <CardDescription>Pencarian cepat berdasarkan nama, email, atau nomor HP.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Cari konsumen..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Nama</TH>
                <TH>Kontak</TH>
                <TH>Alamat</TH>
                <TH>Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {customers.map((customer) => (
                <TR key={customer.id}>
                  <TD>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.notes || "-"}</p>
                  </TD>
                  <TD>
                    <p>{customer.phone}</p>
                    <p className="text-xs text-muted-foreground">{customer.email || "-"}</p>
                  </TD>
                  <TD>{customer.address || "-"}</TD>
                  <TD>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setForm(customer)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          try {
                            await api.delete(`/customers/${customer.id}`);
                            toast.success("Konsumen dihapus.");
                            await loadCustomers();
                          } catch (error) {
                            toast.error(error.message);
                          }
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

