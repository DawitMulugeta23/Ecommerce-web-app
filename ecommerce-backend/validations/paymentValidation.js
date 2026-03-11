// backend/validations/paymentValidation.js
import { z } from "zod";

const paymentMethods = ["card", "telebirr", "cbebirr", "mpesa"];

export const initializeDemoPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    email: z.string().email("Invalid email format"),
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    phone: z.string().min(9, "Phone number must be at least 9 digits"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City name required"),
    tx_ref: z.string().min(1, "Transaction reference required"),
    items: z.array(
      z.object({
        _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        image: z.string().url(),
      }),
    ),
  }),
});

export const initializeChapaPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    email: z.string().email("Invalid email format"),
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    phone: z.string().min(9, "Phone number must be at least 9 digits"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City name required"),
    tx_ref: z.string().min(1, "Transaction reference required"),
    items: z.array(
      z.object({
        _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        image: z.string().url(),
      }),
    ),
    payment_method: z.enum(paymentMethods),
    payment_data: z
      .object({
        card_number: z.string().optional(),
        card_holder: z.string().optional(),
        expiry: z
          .string()
          .regex(/^(0[1-9]|1[0-2])\/\d{2}$/)
          .optional(),
        cvv: z.string().length(3).optional(),
        phone_number: z.string().min(9).optional(),
        account_number: z.string().optional(),
      })
      .optional(),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid order ID format"),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid order ID format"),
  }),
});
