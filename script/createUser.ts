import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import pool from "../lib/db";
import z from "zod";
import { hash } from "argon2";

const emailSchema = z.object({
    email: z.string().email({message: "Invalid email address"})
})

const passwordSchema = z.object({
    password: z.string().min(6, {message: "Password must be at least 6 characters long"})
})

const readline = createInterface({input, output});

async function createUser(){
    let email: string;
    let emailValid: boolean = false;

    let password: string;
    let passwordValid: boolean = false;

    let passwordConfirmation: string;
    let confirmValid: boolean = false;
    try {

        //Input for email
        do{
            email = (
            await readline.question("Enter email: ")
            ).trim();
            emailValid = emailSchema.safeParse({email}).success;
        } while(!emailValid)

        console.log(`Email: ${email}`);

        //Input for password
        do{
            password = (
            await readline.question("Enter password: ")
            ).trim();
            passwordValid = passwordSchema.safeParse({password}).success;
        } while(!passwordValid)
        
        //Confirm password
        do{
            passwordConfirmation = (
                await readline.question("Confirm password: ")
            );
            confirmValid = password === passwordConfirmation;
        } while (!confirmValid)

        const passwordHash = await hash(password);

        await pool.execute(
            "INSERT INTO core_user (email,password) VALUES ?,?",
            [email, passwordHash]
        );

        console.log(`User created successfully\nEmail: ${email}`);
    } catch (error){
        console.error("Failed to create user:", error);
    } finally {
        readline.close();
        await pool.end();
    }
}

void createUser();