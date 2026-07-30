"use server";

import z from "zod";
import { createSession, deleteSession } from "lib/session";
import { redirect } from "next/navigation";
import {verify} from "argon2"
import pool from "@/lib/db"
import { RowDataPacket } from "mysql2";

const loginSchema = z.object({
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"})
})

interface UserRow extends RowDataPacket{
    id: number,
    email: string;
    password: string
}

export async function login(prevState: any, formData: FormData) {

    //Input validation
    const result = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    //If validation fails, return the errors to the form
    if(!result.success){
        return {
            errors: result.error.flatten().fieldErrors
        }
    }

    //If validation succeeds, check the credentials correctness
    const {email, password} = result.data;

    //Searhc for user
    const sql = "SELECT id, email, password FROM core_user WHERE email = ? LIMIT 1";
    const [rows] = await pool.execute<UserRow[]>(
        sql,
        [email]
    );

    const user = rows[0];

    //If user is not found, then email is invalid
    if(!user){
        return {
            errors : {password: ["Invalid email or password"]}
        }
    }

    //Check credentials valid or not
    const isValid = await verify(user.password, password);
    if(!isValid){
        return {
            errors : {password: ["Invalid email or password"]}
        }
    } else {
        await createSession(String(user.id));
        redirect("/");
    }

}

export async function logout() {
    await deleteSession();
    redirect("/login");
}