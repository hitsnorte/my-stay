import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const SECRET_KEY = process.env.SECRET_KEY; // A mesma usada na geração do token

export async function POST(request) {
    try {
        const { email, message, token } = await request.json();

        if (!email || !message || !token) {
            return new NextResponse(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // 🔹 Decodificar o token para obter os dados
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return new NextResponse(
                JSON.stringify({ error: "Invalid or expired token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // 🔹 Buscar os dados da propriedade pelo propertyTag contido no token
        const property = await prisma.properties.findUnique({
            where: { propertyTag: decoded.propertyTag },
            select: {
                replyEmail: true,
                replyPassword: true,
                sendingServer: true,
                sendingPort: true,
                infoEmail: true, // Pegando o e-mail para onde a mensagem será enviada
            },
        });

        if (!property) {
            return new NextResponse(
                JSON.stringify({ error: "Property not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const { replyEmail, replyPassword, sendingServer, sendingPort, infoEmail } = property;

        // 🔹 Configurar o transporte de e-mail
        const transporter = nodemailer.createTransport({
            host: sendingServer,
            port: sendingPort,
            secure: sendingPort === 465, // SSL
            auth: { user: replyEmail, pass: replyPassword },
        });

        // 🔹 Configuração do e-mail
        const mailOptions = {
            from: replyEmail,
            to: infoEmail, // Se infoEmail não existir, usa o padrão
            subject: "New Contact Form Submission",
            text: `From: ${email}\nMessage: ${message}`,
            html: `<p><strong>From:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
        };

        // 🔹 Enviar e-mail
        await transporter.sendMail(mailOptions);

        return new NextResponse(
            JSON.stringify({ message: "Email sent successfully!" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error processing request:", error);
        return new NextResponse(
            JSON.stringify({ error: "Error processing request" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
