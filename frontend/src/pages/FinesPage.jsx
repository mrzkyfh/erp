import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";
import { formatDateID, formatRupiah } from "@/lib/utils";

const fineTypeDefaults = { name: "", amount: "", trigger_type: "manual", is_auto: false };
const fineDefaults = { employee_id: "", fine_type_id: "", amount: "", reason: "", date: "" };

export function FinesPage() {
  const [fineTypes, setFineTypes] = useState([]);
  const [fines, setFines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [fineTypeForm, setFineTypeForm] = useState(fineTypeDefaults);
  const [fineForm, setFineForm] = useState(fineDefaults);

  const loadData = async () => {
    try {
      const [typeResponse, fineResponse, employeeResponse] = await Promise.all([
        api.get("/fines/types"),
        api.get("/fines"),
        api.get("/employees"),
      ]);
      setFineTypes(typeResponse.data);
      setFines(fineResponse.data);
      setEmployees(employeeResponse.data);
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
              <CardTitle>Master Jenis Denda</CardTitle>
              <CardDescription>Tambahkan pemicu denda otomatis atau manual sesuai SOP.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nama denda">
                <Input
                  value={fineTypeForm.name}
                  onChange={(e) => setFineTypeForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Nominal">
                <Input
                  type="number"
                  min="0"
                  value={fineTypeForm.amount}
                  onChange={(e) => setFineTypeForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </FormField>
              <FormField label="Trigger">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={fineTypeForm.trigger_type}
                  onChange={(e) => setFineTypeForm((prev) => ({ ...prev, trigger_type: e.target.value }))}
                >
                  <option value="manual">Manual</option>
                  <option value="late">Telat</option>
                  <option value="alpha">Alpha</option>
                  <option value="sop">Pelanggaran SOP</option>
                </select>
              </FormField>
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={fineTypeForm.is_auto}
                  onChange={(e) => setFineTypeForm((prev) => ({ ...prev, is_auto: e.target.checked }))}
                />
                Aktifkan denda otomatis
              </label>
            </div>
            <Button
              onClick={async () => {
                try {
                  if (!fineTypeForm.name || !fineTypeForm.amount) {
                    toast.error("Nama dan nominal denda wajib diisi.");
                    return;
                  }
                  await api.post("/fines/types", {
                    ...fineTypeForm,
                    amount: Number(fineTypeForm.amount),
                  });
                  toast.success("Jenis denda berhasil ditambahkan.");
                  setFineTypeForm(fineTypeDefaults);
                  await loadData();
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Simpan Jenis Denda
            </Button>

            <Table>
              <THead>
                <TR>
                  <TH>Nama</TH>
                  <TH>Nominal</TH>
                  <TH>Trigger</TH>
                </TR>
              </THead>
              <TBody>
                {fineTypes.map((item) => (
                  <TR key={item.id}>
                    <TD>{item.name}</TD>
                    <TD>{formatRupiah(item.amount)}</TD>
                    <TD>{item.trigger_type}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Denda Karyawan</CardTitle>
              <CardDescription>Denda otomatis dan manual akan terakumulasi pada payroll aktif.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Karyawan">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={fineForm.employee_id}
                  onChange={(e) => setFineForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                >
                  <option value="">Pilih karyawan</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.profile?.full_name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Jenis denda">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={fineForm.fine_type_id}
                  onChange={(e) => {
                    const selected = fineTypes.find((item) => item.id === e.target.value);
                    setFineForm((prev) => ({
                      ...prev,
                      fine_type_id: e.target.value,
                      amount: selected?.amount || "",
                    }));
                  }}
                >
                  <option value="">Pilih jenis denda</option>
                  {fineTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Nominal">
                <Input
                  type="number"
                  min="0"
                  value={fineForm.amount}
                  onChange={(e) => setFineForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </FormField>
              <FormField label="Tanggal">
                <Input
                  type="date"
                  value={fineForm.date}
                  onChange={(e) => setFineForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Alasan">
                  <Input
                    value={fineForm.reason}
                    onChange={(e) => setFineForm((prev) => ({ ...prev, reason: e.target.value }))}
                  />
                </FormField>
              </div>
            </div>
            <Button
              onClick={async () => {
                try {
                  if (!fineForm.employee_id || !fineForm.fine_type_id || !fineForm.amount) {
                    toast.error("Karyawan, jenis denda, dan nominal wajib diisi.");
                    return;
                  }
                  await api.post("/fines", {
                    ...fineForm,
                    amount: Number(fineForm.amount),
                  });
                  toast.success("Denda manual berhasil ditambahkan.");
                  setFineForm(fineDefaults);
                  await loadData();
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Simpan Denda
            </Button>

            <Table>
              <THead>
                <TR>
                  <TH>Karyawan</TH>
                  <TH>Denda</TH>
                  <TH>Nominal</TH>
                  <TH>Tanggal</TH>
                </TR>
              </THead>
              <TBody>
                {fines.map((item) => (
                  <TR key={item.id}>
                    <TD>{item.employee_name}</TD>
                    <TD>{item.reason || item.fine_type_name}</TD>
                    <TD>{formatRupiah(item.amount)}</TD>
                    <TD>{formatDateID(item.date)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

