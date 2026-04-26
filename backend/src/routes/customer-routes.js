import { Hono } from "hono";
import { z } from "zod";
import {
  customers,
  editCustomer,
  removeCustomer,
  storeCustomer,
} from "../controllers/customer-controller.js";
import { validateBody } from "../middleware/validate-body.js";

const router = new Hono();

const schema = z.object({
  name: z.string().min(2, "Nama konsumen wajib diisi."),
  phone: z.string().min(8, "Nomor HP wajib diisi."),
  email: z.string().email("Email tidak valid.").or(z.literal("")).optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.get("/", customers);
router.post("/", validateBody(schema), storeCustomer);
router.put("/:id", validateBody(schema), editCustomer);
router.delete("/:id", removeCustomer);

export { router as customerRoutes };


