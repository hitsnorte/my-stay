import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(request) {
  try {
    const body = await request.json();
    const userEmail = body.email;
    const profileID = body.protelGuestID;
    const expDate = body.protelValidUntil;

    // Validações
    if (!userEmail) {
      return new NextResponse(
        JSON.stringify({ error: "O campo 'email' é obrigatório!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!profileID) {
      return new NextResponse(
        JSON.stringify({ error: "O campo 'protelGuestID' é obrigatório!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!expDate) {
      return new NextResponse(
        JSON.stringify({ error: "O campo 'protelValidUntil' é obrigatório!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyTag = searchParams.get("propertyTag");
    const resNo = searchParams.get("resNo");
    const mpeHotel = searchParams.get("mpeHotel");

    if (!propertyTag || !resNo || !mpeHotel) {
      return new NextResponse(
        JSON.stringify({ error: "Parâmetros obrigatórios ausentes: propertyTag, resNo, mpeHotel" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Buscar dados da propriedade
    const property = await prisma.properties.findUnique({
      where: { propertyTag },
      select: {
        propertyServer: true,
        propertyPort: true,
        propertyID: true,
        replyEmail: true,
        replyPassword: true,
        sendingServer: true,
        sendingPort: true,
      },
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyTag não encontrado no banco de dados" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const { propertyServer, propertyPort, propertyID, replyEmail, replyPassword, sendingServer, sendingPort } = property;
    const uniqueId = uuidv4();

    // Payload do token com o novo parâmetro
    const payload = {
      propertyTag,
      propertyID,
      replyEmail,
      sendingServer,
      sendingPort,
      resNo,
      mpeHotel,
      profileID,
      uniqueId,
    };

    // Converter expDate para objeto Date
    const [datePart, timePart] = expDate.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    const expirationDate = new Date(year, month - 1, day, hours, minutes, seconds);
    const now = new Date();
    const expiresInSeconds = Math.floor((expirationDate - now) / 1000);

    if (expiresInSeconds <= 0) {
      return new NextResponse(
        JSON.stringify({ error: "Data de validade expirada ou inválida" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: expiresInSeconds });
    const link = `https://stay.mypms.pt/reservation/reservation?token=${token}`;
    // const link = `http://localhost:3000/reservation/reservation?token=${token}`;

    // Inserção no banco
    const stayRecord = await prisma.stayRecords.create({
      data: {
        requestBody: JSON.stringify(body),
        responseBody: JSON.stringify({ message: "E-mail enviado", link }),
        requestType: request.method,
        requestDateTime: new Date(),
        requestStatus: "200",
        propertyID: propertyID,
        token: token,
      },
    });

    // Email setup
    const transporter = nodemailer.createTransport({
      host: sendingServer,
      port: sendingPort,
      secure: sendingPort === 465,
      auth: { user: replyEmail, pass: replyPassword },
    });

    const mailOptions = {
      from: `Reserva Confirmada <${replyEmail}>`,
      to: userEmail,
      subject: "Confirmação de Reserva",
      text: `Clique no link para confirmar sua reserva: ${link}`,
      html: `<p>Clique no link para confirmar sua reserva: <a href="${link}">MyStay</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    return new NextResponse(
      JSON.stringify({ message: "E-mail enviado com sucesso!", link, stayID: stayRecord.stayID }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao processar a requisição", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao processar a requisição" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
