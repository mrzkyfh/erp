# Inventory History Date Filter - Filter Riwayat Transaksi dengan Kalender

## Masalah
Riwayat transaksi menampilkan semua transaksi terbaru tanpa filter. Jika ada lebih dari 100 transaksi, akan memakan tempat yang besar dan sulit untuk mencari transaksi spesifik.

## Solusi
Menambahkan date picker (kalender) untuk filter transaksi berdasarkan tanggal. User bisa memilih tanggal tertentu dan hanya transaksi di tanggal tersebut yang ditampilkan.

## Fitur Baru

### 1. Date Picker dengan Kalender
- Input type="date" dengan UI kalender native browser
- Default: Hari ini
- User bisa pilih tanggal mana saja

### 2. Quick Actions
- **Tombol "Hari Ini"**: Reset ke tanggal hari ini
- **Tombol "Semua"**: Tampilkan semua transaksi (tanpa filter)

### 3. Transaction Summary
Info box yang menampilkan:
- Tanggal yang dipilih (format Indonesia)
- Jumlah pembelian pada tanggal tersebut
- Jumlah penggunaan pada tanggal tersebut

### 4. Counter di Header
- "Pembelian (5)" - Menampilkan jumlah transaksi
- "Penggunaan (3)" - Menampilkan jumlah transaksi

### 5. Max Height dengan Scroll
- Max height: 96 (384px)
- Overflow-y: auto
- Jika transaksi banyak, bisa scroll dalam container

## UI Design

### Desktop View
```
┌─────────────────────────────────────────────────────────┐
│ Riwayat Transaksi                                       │
│ Pilih tanggal untuk melihat transaksi pada hari tersebut│
├─────────────────────────────────────────────────────────┤
│ 📅 [2026-04-28 ▼]  [Hari Ini] [Semua]                  │
│                                                          │
│ 📅 Menampilkan transaksi pada 28 April 2026            │
│ 5 pembelian • 3 penggunaan                              │
│                                                          │
│ ┌─────────────────────┬─────────────────────┐          │
│ │ Pembelian (5)       │ Penggunaan (3)      │          │
│ ├─────────────────────┼─────────────────────┤          │
│ │ [Supplier A]        │ [Tepung Terigu]     │          │
│ │ 28 Apr • Rp 500K    │ 5 kg • Produksi     │          │
│ │                     │                     │          │
│ │ [Supplier B]        │ [Gula Pasir]        │          │
│ │ 28 Apr • Rp 300K    │ 2 kg • Produksi     │          │
│ └─────────────────────┴─────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌───────────────────────────┐
│ Riwayat Transaksi         │
├───────────────────────────┤
│ 📅 [2026-04-28 ▼]        │
│ [Hari Ini] [Semua]       │
│                           │
│ 📅 28 April 2026         │
│ 5 pembelian • 3 penggunaan│
│                           │
│ Pembelian (5)             │
│ ┌───────────────────────┐ │
│ │ Supplier A            │ │
│ │ 28 Apr • Rp 500K      │ │
│ └───────────────────────┘ │
│                           │
│ Penggunaan (3)            │
│ ┌───────────────────────┐ │
│ │ Tepung Terigu         │ │
│ │ 5 kg • Produksi       │ │
│ └───────────────────────┘ │
└───────────────────────────┘
```

## Implementasi

### State Management
```javascript
// Default: Hari ini
const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
});

const [filteredPurchases, setFilteredPurchases] = useState([]);
const [filteredUsages, setFilteredUsages] = useState([]);
```

### Filter Logic
```javascript
useEffect(() => {
  if (selectedDate) {
    // Filter purchases by date
    const filtered = overview.purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.date).toISOString().split('T')[0];
      return purchaseDate === selectedDate;
    });
    setFilteredPurchases(filtered);
    
    // Filter usages by date
    const filteredUsage = overview.usages.filter(usage => {
      const usageDate = new Date(usage.date).toISOString().split('T')[0];
      return usageDate === selectedDate;
    });
    setFilteredUsages(filteredUsage);
  } else {
    // Show all if no date selected
    setFilteredPurchases(overview.purchases);
    setFilteredUsages(overview.usages);
  }
}, [selectedDate, overview.purchases, overview.usages]);
```

### Date Picker UI
```jsx
<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
  <div className="flex items-center gap-2 flex-1">
    <Calendar className="h-5 w-5 text-slate-600" />
    <Input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="flex-1"
    />
  </div>
  <div className="flex gap-2 w-full sm:w-auto">
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => {
        const today = new Date();
        setSelectedDate(today.toISOString().split('T')[0]);
      }}
    >
      Hari Ini
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setSelectedDate("")}
    >
      Semua
    </Button>
  </div>
</div>
```

### Transaction Summary
```jsx
{selectedDate && (
  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
    <p className="text-sm text-blue-900">
      📅 Menampilkan transaksi pada <strong>{formatDateID(selectedDate)}</strong>
    </p>
    <p className="text-xs text-blue-700 mt-1">
      {filteredPurchases.length} pembelian • {filteredUsages.length} penggunaan
    </p>
  </div>
)}
```

### Scrollable Container
```jsx
<div className="space-y-2 max-h-96 overflow-y-auto">
  {filteredPurchases.map((purchase) => (
    <div key={purchase.id} className="rounded-lg border border-slate-200 bg-white p-3">
      {/* Transaction card */}
    </div>
  ))}
</div>
```

## Benefits

### Untuk User
- ✅ Mudah mencari transaksi di tanggal tertentu
- ✅ Tidak perlu scroll panjang untuk cari transaksi lama
- ✅ UI lebih bersih dan terorganisir
- ✅ Bisa lihat summary jumlah transaksi per hari

### Untuk Performance
- ✅ Hanya render transaksi yang dipilih
- ✅ Tidak perlu load semua transaksi sekaligus
- ✅ Scroll container terbatas (max-h-96)
- ✅ Lebih cepat untuk dataset besar

### Untuk UX
- ✅ Native date picker (familiar untuk user)
- ✅ Quick actions: "Hari Ini" dan "Semua"
- ✅ Visual feedback dengan summary box
- ✅ Counter di header untuk info cepat

## Use Cases

### Use Case 1: Cek Transaksi Hari Ini
1. Buka halaman Inventory
2. Default sudah menampilkan transaksi hari ini
3. Lihat summary: "5 pembelian • 3 penggunaan"
4. Scroll untuk lihat detail

### Use Case 2: Cek Transaksi Kemarin
1. Klik date picker
2. Pilih tanggal kemarin
3. Transaksi kemarin langsung muncul
4. Summary otomatis update

### Use Case 3: Cek Transaksi Minggu Lalu
1. Klik date picker
2. Pilih tanggal minggu lalu
3. Lihat transaksi di tanggal tersebut
4. Jika tidak ada, muncul "Tidak ada pembelian pada tanggal ini"

### Use Case 4: Lihat Semua Transaksi
1. Klik tombol "Semua"
2. Semua transaksi ditampilkan
3. Summary box hilang
4. Bisa scroll untuk lihat semua

## Responsive Design

### Mobile (< 640px)
- Date picker dan buttons stack vertikal
- Buttons full width
- Grid 1 kolom untuk pembelian dan penggunaan
- Max height tetap 96 untuk scroll

### Tablet & Desktop (≥ 640px)
- Date picker dan buttons horizontal
- Buttons auto width
- Grid 2 kolom untuk pembelian dan penggunaan
- Max height tetap 96 untuk scroll

## Edge Cases

### Tidak Ada Transaksi pada Tanggal
```
Pembelian (0)
┌─────────────────────────────────┐
│ Tidak ada pembelian pada        │
│ tanggal ini                     │
└─────────────────────────────────┘
```

### Banyak Transaksi (>10)
- Container scroll dengan max-h-96
- Smooth scrolling
- Scrollbar muncul otomatis

### Tanggal di Masa Depan
- Tetap bisa dipilih
- Akan menampilkan "Tidak ada transaksi"
- Berguna untuk planning

## Testing

### Test 1: Default Hari Ini
1. Buka halaman Inventory
2. Scroll ke "Riwayat Transaksi"
3. Seharusnya menampilkan tanggal hari ini
4. Transaksi hari ini muncul

### Test 2: Pilih Tanggal Lain
1. Klik date picker
2. Pilih tanggal 3 hari lalu
3. Transaksi berubah sesuai tanggal
4. Summary update

### Test 3: Tombol "Hari Ini"
1. Pilih tanggal random
2. Klik "Hari Ini"
3. Kembali ke tanggal hari ini
4. Transaksi hari ini muncul

### Test 4: Tombol "Semua"
1. Klik "Semua"
2. selectedDate menjadi ""
3. Semua transaksi ditampilkan
4. Summary box hilang

### Test 5: Tidak Ada Transaksi
1. Pilih tanggal yang tidak ada transaksi
2. Seharusnya muncul "Tidak ada pembelian pada tanggal ini"
3. Counter menampilkan (0)

## File yang Diubah

1. `frontend/src/pages/InventoryPage.jsx`
   - Import Calendar icon dari lucide-react
   - Tambah state selectedDate, filteredPurchases, filteredUsages
   - Tambah useEffect untuk filter transaksi
   - Update UI riwayat transaksi dengan date picker
   - Tambah quick action buttons
   - Tambah transaction summary box
   - Tambah counter di header
   - Tambah max-h-96 dan overflow-y-auto

## Future Enhancements

### Date Range Picker
Bisa tambah fitur pilih range tanggal (dari-sampai):
```
[2026-04-01] sampai [2026-04-30]
```

### Export to Excel
Tambah tombol export transaksi di tanggal tertentu:
```
[📅 Date Picker] [Hari Ini] [Semua] [📥 Export]
```

### Filter by Type
Tambah filter berdasarkan tipe transaksi:
```
☑️ Pembelian  ☑️ Penggunaan  ☑️ Pengeluaran
```

### Search in Transactions
Tambah search box untuk cari transaksi spesifik:
```
🔍 [Cari supplier atau item...]
```

## Performance Notes

- Filter dilakukan di client-side (frontend)
- Untuk dataset sangat besar (>1000 transaksi), pertimbangkan:
  - Backend pagination
  - Backend date filtering
  - Lazy loading
  - Virtual scrolling

## Accessibility

- ✅ Native date picker (accessible by default)
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Clear labels dan descriptions
- ✅ Focus states untuk buttons

## Browser Compatibility

- ✅ Chrome/Edge: Native date picker dengan kalender
- ✅ Firefox: Native date picker dengan kalender
- ✅ Safari: Native date picker dengan kalender
- ✅ Mobile browsers: Native date picker optimized untuk touch
