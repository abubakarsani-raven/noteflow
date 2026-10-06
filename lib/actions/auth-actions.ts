"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase";
import { signIn, signOut } from "@/lib/auth";
import { signUpSchema, signInSchema } from "@/lib/validations";
import { type ActionState } from "@/lib/errors";

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if an account already exists with this email
  const existingSnapshot = await db
    .collection("users")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    return { ok: false, fieldErrors: { email: ["An account already exists with this email."] } };
  }

  const hashed = await bcrypt.hash(password, 12);
  const userRef = db.collection("users").doc();
  const now = new Date();

  await userRef.set({
    id: userRef.id,
    name,
    email: normalizedEmail,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  });

  // signIn throws a redirect on success, so it stays outside the try/catch above.
  await signIn("credentials", { email: normalizedEmail, password, redirectTo: "/dashboard" });
  return { ok: true };
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid email or password." };
    }
    throw error; // redirects and unknown failures bubble up
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
