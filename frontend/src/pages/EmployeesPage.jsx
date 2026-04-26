import { useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";
import { formatDateID, formatRupiah, getStatusBadgeTone } from "@/lib/utils";

const emptyForm = {
  id: null,
  email: "",
  password: "",
  full_name: "",
  nik: "",
  phone: "",
  address: "",
  role: "karyawan",
  join_date: "",
  salary_type: "bulanan",
  base_salary: "",
  allowance: "",
  default_deduction: "",
  status: "aktif",
  jobdesk_ids: [],
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [jobdesks, setJobdesks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(form.id);

  const salaryPreview = useMemo(() => {
    return formatRupiah((Number(form.base_salary || 0) + Number(form.allowance || 0)) || 0);
  }, [form.allowance, form.base_salary]);

  const loadData = async () => {
    try {
      const [employeesResponse, jobdesksResponse] = await Promise.all([
        api.get("/employees"),
        api.get("/employees/jobdesks"),
      ]);
      setEmployees(employeesResponse.data);
      setJobdesks(jobdesksResponse.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.full_name || !form.email || !form.join_date) {
      return "Nama, email, dan tanggal masuk wajib diisi.";
    }
    if (!isEdit && !form.password) {
      return "Password awal wajib diisi saat membuat karyawan.";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errorMessage = validate();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        base_salary: Number(form.base_salary || 0),
        allowance: Number(form.allowance || 0),
        default_deduction: Number(form.default_deduction || 0),
      };

      if (isEdit) {
        await api.put(`/employees/${form.id}`, payload);
        toast.success("Data karyawan diperbarui.");
      } else {
        await api.post("/employees", payload);
        toast.success("Karyawan baru berhasil dibuat.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{isEdit ? "Edit Karyawan" : "Tambah Karyawan"}</CardTitle>
              <CardDescription>Lengkapi data profil, role, dan setup penggajian.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <FormField label="Nama lengkap">
                <Input value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)} />
              </FormField>
              <FormField label="Email login">
                <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
              </FormField>
              <FormField label="Password awal" hint={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}>
                <Input type="password" value={form.password} onChange={(e) => updateForm("password", e.target.value)} />
              </FormField>
              <FormField label="NIK">
                <Input value={form.nik} onChange={(e) => updateForm("nik", e.target.value)} />
              </FormField>
              <FormField label="Nomor HP">
                <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
              </FormField>
              <FormField label="Tanggal masuk">
                <Input type="date" value={form.join_date} onChange={(e) => updateForm("join_date", e.target.value)} />
              </FormField>
              <FormField label="Role">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.role}
                  onChange={(e) => updateForm("role", e.target.value)}
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="karyawan">Karyawan</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </FormField>
              <FormField label="Tipe gaji">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.salary_type}
                  onChange={(e) => updateForm("salary_type", e.target.value)}
                >
                  <option value="harian">Harian</option>
                  <option value="bulanan">Bulanan</option>
                </select>
              </FormField>
              <FormField label="Gaji pokok">
                <Input
                  type="number"
                  min="0"
                  value={form.base_salary}
                  onChange={(e) => updateForm("base_salary", e.target.value)}
                />
              </FormField>
              <FormField label="Tunjangan">
                <Input
                  type="number"
                  min="0"
                  value={form.allowance}
                  onChange={(e) => updateForm("allowance", e.target.value)}
                />
              </FormField>
              <FormField label="Potongan default">
                <Input
                  type="number"
                  min="0"
                  value={form.default_deduction}
                  onChange={(e) => updateForm("default_deduction", e.target.value)}
                />
              </FormField>
              <FormField label="Estimasi total" hint="Gaji pokok + tunjangan">
                <Input value={salaryPreview} readOnly />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Alamat">
                  <Textarea value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
                </FormField>
              </div>
              <div className="md:col-span-2 space-y-3">
                <p className="text-sm font-medium">Jobdesk</p>
                <div className="grid gap-2 md:grid-cols-3">
                  {jobdesks.map((jobdesk) => (
                    <label key={jobdesk.id} className="flex items-center gap-2 rounded-2xl border border-border bg-white p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={form.jobdesk_ids.includes(jobdesk.id)}
                        onChange={(e) =>
                          updateForm(
                            "jobdesk_ids",
                            e.target.checked
                              ? [...form.jobdesk_ids, jobdesk.id]
                              : form.jobdesk_ids.filter((item) => item !== jobdesk.id),
                          )
                        }
                      />
                      <span>{jobdesk.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Karyawan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daftar Karyawan</CardTitle>
              <CardDescription>Seluruh tim aktif dan nonaktif dalam sistem.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat data karyawan...</p>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Nama</TH>
                    <TH>Role</TH>
                    <TH>Jobdesk</TH>
                    <TH>Gaji</TH>
                    <TH>Status</TH>
                    <TH>Aksi</TH>
                  </TR>
                </THead>
                <TBody>
                  {employees.map((employee) => (
                    <TR key={employee.id}>
                      <TD>
                        <p className="font-medium">{employee.profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{employee.profile?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Masuk {formatDateID(employee.join_date || employee.profile?.joined_at)}
                        </p>
                      </TD>
                      <TD>{employee.profile?.role}</TD>
                      <TD>{(employee.jobdesks ?? []).map((item) => item.name).join(", ") || "-"}</TD>
                      <TD>{formatRupiah(employee.base_salary + employee.allowance)}</TD>
                      <TD>
                        <Badge tone={getStatusBadgeTone(employee.status)}>{employee.status}</Badge>
                      </TD>
                      <TD>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setForm({
                                id: employee.id,
                                email: employee.profile?.email || "",
                                password: "",
                                full_name: employee.profile?.full_name || "",
                                nik: employee.profile?.nik || "",
                                phone: employee.profile?.phone || "",
                                address: employee.profile?.address || "",
                                role: employee.profile?.role || "karyawan",
                                join_date: employee.join_date || "",
                                salary_type: employee.salary_type || "bulanan",
                                base_salary: employee.base_salary || "",
                                allowance: employee.allowance || "",
                                default_deduction: employee.default_deduction || "",
                                status: employee.status || "aktif",
                                jobdesk_ids: (employee.jobdesks ?? []).map((item) => item.id),
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await api.patch(`/employees/${employee.id}/status`, {
                                  status: employee.status === "aktif" ? "nonaktif" : "aktif",
                                });
                                toast.success("Status karyawan diperbarui.");
                                await loadData();
                              } catch (error) {
                                toast.error(error.message);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
