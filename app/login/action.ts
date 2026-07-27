"use server";

import z from "zod";
import { createSession, deleteSession } from "lib/session";
import { redirect } from "next/navigation";

const loginSchema = z.object({
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"})
})

export async function login(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    //If validation fails, return the errors to the form
    if(!result.success){
        return {
            errors: result.error.flatten().fieldErrors
        }
    }

    //If validation succeeds, check the credentials correctness
    const {email, password} = result.data;

    //If credentials are incorrect, return an error to the form
    if(email !== ""){
        return {
            errors:{
                password: ["Invalid email or password"]
            }
        }
    }

    await createSession(email);
    redirect("/");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}