# Delete Functionality Documentation

## Overview
Fitur delete telah ditambahkan untuk menghapus data user (employees), inventory items, suppliers, dan stock usages.

## Backend Endpoints

### 1. Delete Employee
**Endpoint:** `DELETE /api/employees/:id`  
**Access:** Owner only  
**Description:** Menghapus karyawan beserta data auth dan profile

**Process:**
1. Get employee profile_id
2. Delete from `employees` table (cascade to related tables)
3. Delete from `profiles` table
4. Delete auth user from Supabase Auth

**Response:**
```json
{
  "message": "Karyawan berhasil dihapus."
}
```

**Error Cases:**
- 404: Karyawan tidak ditemukan
- 500: Database error

---

### 2. Delete Inventory Item
**Endpoint:** `DELETE /api/inventory/items/:id`  
**Access:** Owner only  
**Description:** Menghapus item inventori

**Validation:**
- ❌ Tidak bisa dihapus jika sudah ada riwayat pembelian
- ❌ Tidak bisa dihapus jika sudah ada riwayat penggunaan

**Response:**
```json
{
  "message": "Item berhasil dihapus."
}
```

**Error Cases:**
- 422: Item memiliki riwayat transaksi
- 500: Database error

---

### 3. Delete Supplier
**Endpoint:** `DELETE /api/inventory/suppliers/:id`  
**Access:** Owner only  
**Description:** Menghapus supplier

**Validation:**
- ❌ Tidak bisa dihapus jika sudah ada riwayat pembelian

**Response:**
```json
{
  "message": "Supplier berhasil dihapus."
}
```

**Error Cases:**
- 422: Supplier memiliki riwayat pembelian
- 500: Database error

---

### 4. Delete Stock Usage
**Endpoint:** `DELETE /api/inventory/usages/:id`  
**Access:** Owner only  
**Description:** Menghapus data penggunaan stok

**Process:**
1. Get usage details (item_id, qty)
2. Restore stock (add qty back to current_stock)
3. Delete usage record

**Response:**
```json
{
  "message": "Data penggunaan berhasil dihapus."
}
```

**Error Cases:**
- 404: Data penggunaan tidak ditemukan
- 500: Database error

---

## Files Modified

### Backend Services
1. **`backend/src/services/employee-service.js`**
   - Added `deleteEmployee()` function
   - Deletes employee, profile, and auth user

2. **`backend/src/services/inventory-service.js`**
   - Added `deleteInventoryItem()` function
   - Added `deleteSupplier()` function
   - Added `deleteStockUsage()` function
   - All with validation checks

### Backend Controllers
1. **`backend/src/controllers/employee-controller.js`**
   - Added `removeEmployee()` controller
   - Imports `deleteEmployee` from service

2. **`backend/src/controllers/inventory-controller.js`**
   - Added `removeInventoryItem()` controller
   - Added `removeSupplier()` controller
   - Added `removeUsage()` controller

### Backend Routes
1. **`backend/src/routes/employee-routes.js`**
   - Added `DELETE /employees/:id` route
   - Owner only access

2. **`backend/src/routes/inventory-routes.js`**
   - Added `DELETE /inventory/items/:id` route
   - Added `DELETE /inventory/suppliers/:id` route
   - Added `DELETE /inventory/usages/:id` route
   - All owner only access

---

## Frontend Implementation Guide

### API Client Functions

Add to `frontend/src/lib/api.js`:

```javascript
// Employee
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Inventory
export const deleteInventoryItem = (id) => api.delete(`/inventory/items/${id}`);
export const deleteSupplier = (id) => api.delete(`/inventory/suppliers/${id}`);
export const deleteStockUsage = (id) => api.delete(`/inventory/usages/${id}`);
```

### Example Usage in Components

#### Delete Employee Button
```jsx
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

function EmployeeRow({ employee, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm(`Hapus karyawan ${employee.profile.full_name}?`)) return;
    
    try {
      setDeleting(true);
      await api.delete(`/employees/${employee.id}`);
      toast.success("Karyawan berhasil dihapus");
      onDeleted();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <TR>
      <TD>{employee.profile.full_name}</TD>
      <TD>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </TD>
    </TR>
  );
}
```

#### Delete Inventory Item Button
```jsx
function InventoryItemRow({ item, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm(`Hapus item ${item.name}?`)) return;
    
    try {
      setDeleting(true);
      await api.delete(`/inventory/items/${item.id}`);
      toast.success("Item berhasil dihapus");
      onDeleted();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <TR>
      <TD>{item.name}</TD>
      <TD>{item.current_stock} {item.unit}</TD>
      <TD>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </TD>
    </TR>
  );
}
```

---

## Security Considerations

### Access Control
- ✅ All delete endpoints require authentication
- ✅ Most delete endpoints require owner role
- ✅ Role validation via `requireRoles("owner")` middleware

### Data Integrity
- ✅ Validation checks before deletion
- ✅ Cascade deletes handled properly
- ✅ Stock restoration for usage deletions
- ✅ Prevents deletion of items with transaction history

### Error Handling
- ✅ Proper error messages
- ✅ 404 for not found
- ✅ 422 for validation errors
- ✅ 500 for server errors

---

## Testing Checklist

### Employee Delete
- [ ] Owner can delete employee
- [ ] Manager cannot delete employee
- [ ] Karyawan cannot delete employee
- [ ] Employee data removed from database
- [ ] Profile removed from database
- [ ] Auth user removed from Supabase Auth
- [ ] Related data (attendance, payroll) handled correctly

### Inventory Item Delete
- [ ] Owner can delete item without transactions
- [ ] Cannot delete item with purchase history
- [ ] Cannot delete item with usage history
- [ ] Error message clear and helpful

### Supplier Delete
- [ ] Owner can delete supplier without purchases
- [ ] Cannot delete supplier with purchase history
- [ ] Error message clear and helpful

### Stock Usage Delete
- [ ] Owner can delete usage record
- [ ] Stock is restored correctly
- [ ] Quantity added back to current_stock
- [ ] Usage record removed from database

---

## Database Cascade Rules

### Employees Table
```sql
-- When employee is deleted:
- employee_salary_components (CASCADE)
- attendance_logs (CASCADE)
- payroll_records (CASCADE)
```

### Inventory Items Table
```sql
-- When inventory_item is deleted:
- stock_purchase_items (CASCADE)
- stock_usages (CASCADE)
```

### Suppliers Table
```sql
-- When supplier is deleted:
- stock_purchases (CASCADE)
```

**Note:** Cascade rules are defined in database migrations. Check `supabase/migrations/` for details.

---

## API Response Examples

### Success Response
```json
{
  "message": "Karyawan berhasil dihapus."
}
```

### Error Response (Validation)
```json
{
  "message": "Item tidak dapat dihapus karena sudah memiliki riwayat transaksi."
}
```

### Error Response (Not Found)
```json
{
  "message": "Karyawan tidak ditemukan."
}
```

---

## Future Enhancements

### Soft Delete
Consider implementing soft delete for audit trail:
```javascript
// Instead of DELETE, use UPDATE
await supabaseAdmin
  .from("employees")
  .update({ deleted_at: new Date().toISOString() })
  .eq("id", employeeId);
```

### Bulk Delete
Add endpoints for bulk deletion:
```javascript
DELETE /api/employees/bulk
Body: { ids: ["id1", "id2", "id3"] }
```

### Delete Confirmation Modal
Create reusable confirmation modal component:
```jsx
<DeleteConfirmModal
  title="Hapus Karyawan"
  message="Apakah Anda yakin ingin menghapus karyawan ini?"
  onConfirm={handleDelete}
/>
```

### Undo Delete
Implement undo functionality with temporary storage:
```javascript
// Store deleted data temporarily
// Allow undo within 30 seconds
// Permanently delete after timeout
```

---

## Troubleshooting

### "Cannot delete employee"
- Check if user is owner
- Verify employee ID is correct
- Check database constraints

### "Item has transaction history"
- This is expected behavior
- Items with transactions cannot be deleted
- Consider archiving instead

### "Stock not restored"
- Check stock_usages table
- Verify item_id is correct
- Check current_stock value before/after

---

## Related Documentation
- [API Documentation](./API_DOCS.md)
- [Database Schema](./supabase/migrations/)
- [Authentication](./AUTH_GUIDE.md)
- [Role-Based Access Control](./RBAC_GUIDE.md)
