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
        emailBody: true,
        emailSubject: true,
      },
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyTag não encontrado no banco de dados" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const { propertyServer, propertyPort, propertyID, replyEmail, replyPassword, sendingServer, sendingPort, emailBody, emailSubject } = property;
    const uniqueId = uuidv4();

    // Função para transformar os dados recebidos para o novo formato
    function transformDataToNewFormat(data) {
      return [
        {
          GuestInfo: [
            {
              Address: [
                {
                  City: data.city || "",
                  Region: "", // Se precisar de algo mais, pode pegar do 'data'
                  Street: data.protelAddress || "",
                  Country: data.country || "Portugal", // Valor padrão "Portugal"
                  PostalCode: data.postalCode || "",
                },
              ],
              Contacts: [
                {
                  Email: data.email || "", // Usando o email que você recebeu
                  VatNo: data.vatNo || "", // Valor recebido ou string vazia
                  PhoneNumber: `+351 ${data.protelGuestPhone || ""}`, // Formato de telefone +351
                },
              ],
              PersonalID: [
                {
                  Issue: "", // Preencher se necessário
                  NrDoc: data.protelBookingID || "", // Pode substituir com o número de reserva
                  ExpDate: data.documentExpirationDate || "", // Data de expiração do documento
                  DateOfBirth: data.birthDate || "", // Data de nascimento
                  Nationality: data.nationality || "Portugal", // Nacionalidade
                  CountryOfBirth: data.birthCountry || "Portugal", // País de nascimento
                },
              ],
            },
          ],
        },
      ];
    }

    const transformedData = transformDataToNewFormat(body);

    // Inserção na tabela requestRecordsArrivals com dados transformados
    const requestRecord = await prisma.requestRecordsArrivals.create({
      data: {
        requestBody: transformedData, // Usando o novo formato transformado
        requestType: request.method,
        requestDateTime: new Date(),
        responseStatus: "PENDING",
        responseBody: JSON.stringify({ message: "E-mail será enviado", link: "" }),
        propertyID: propertyID,
      },
    });

    const requestID = requestRecord.requestID; // Pegando o requestID gerado

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
      requestID, // Adicionando requestID ao payload
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
    const link = `http://localhost:3002/reservation/reservation?token=${token}`;
    // const link = `https://stay.mypms.pt/reservation/reservation?token=${token}`;

    // Inserção no banco stayRecords
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

    // Função para interpolar o conteúdo com os dados do body
    function interpolate(template, data, isHTML = false) {
      let result = template.replace(/{{\s*([\w]+)\s*}}/g, (_, key) => {
        return data[key] !== undefined ? data[key] : "";
      });

      // Converte **texto** para <strong>texto</strong> em HTML
      if (isHTML) {
        result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      } else {
        // Remove os ** na versão de texto simples
        result = result.replace(/\*\*(.*?)\*\*/g, "$1");
      }

      return result;
    }

    // Adiciona as versões de link ao body
    body.STAY_LINK = `<a href="${link}">MyStay</a>`; // para HTML
    body.STAY_LINK_TEXT = link; // para texto simples (opcional)

    // Interpolações separadas para HTML e texto do corpo do email
    const interpolatedBodyHTML = interpolate(emailBody, body, true);
    const interpolatedBodyText = interpolate(emailBody, { ...body, STAY_LINK: body.STAY_LINK_TEXT }, false);

    // Interpola o assunto do email (normalmente só texto, não HTML)
    const interpolatedSubject = interpolate(emailSubject, body, false);

    // Configuração do envio de e-mail
    const transporter = nodemailer.createTransport({
      host: sendingServer,
      port: sendingPort,
      secure: sendingPort === 465,
      auth: { user: replyEmail, pass: replyPassword },
    });

    const mailOptions = {
      from: `Reserva Confirmada <${replyEmail}>`,
      to: userEmail,
      subject: interpolatedSubject,  // usa o assunto interpolado aqui
      text: interpolatedBodyText,
      html: `<p>${interpolatedBodyHTML.replace(/\n/g, "<br>")}</p>`,
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
