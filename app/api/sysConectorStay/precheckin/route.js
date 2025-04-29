import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import axios from "axios";

export async function POST(request) {
  try {
    const body = await request.json();
    const { protelReservationID, protelMpeHotel, propertyID, pdfBase64 } = body;

    if (!protelReservationID || !protelMpeHotel || !propertyID || !pdfBase64) {
      return new NextResponse(
        JSON.stringify({ error: "Campos obrigatórios em falta." }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const propertyIDInt = parseInt(propertyID, 10);
    if (isNaN(propertyIDInt)) {
      return new NextResponse(
        JSON.stringify({ error: "propertyID inválido." }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const property = await prisma.properties.findUnique({
      where: { propertyID: propertyIDInt },
      select: { propertyServer: true, propertyPortStay: true },
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "Propriedade não encontrada." }),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const { propertyServer, propertyPortStay } = property;
    const url = `http://${propertyServer}:${propertyPortStay}/precheckin`;

    const response = await axios.post(url, pdfBase64, {
      headers: {
        Authorization: 'q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi',
        'Content-Type': 'application/json',
        'ReservationID': String(protelReservationID),
        'MpeHotel': String(protelMpeHotel)
      }
    });

    console.log("DADOS A ENVIAR PELA URL: ", response);
    return new NextResponse(
      JSON.stringify({ message: "Precheck-in enviado com sucesso", data: response.data }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );

  } catch (error) {
    console.error("Erro no precheckin:", error.message);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao processar o precheckin." }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}