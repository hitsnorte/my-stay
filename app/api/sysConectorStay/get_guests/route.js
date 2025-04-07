import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationToken = searchParams.get("reservationToken");
    const protelGuestID = searchParams.get("protelGuestID");

    if (!reservationToken || !protelGuestID) {
      return new NextResponse(
        JSON.stringify({ error: "Os parâmetros 'reservationToken' e 'protelGuestID' são obrigatórios." }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const stayRecord = await prisma.stayRecords.findFirst({
      where: { token: reservationToken },
      select: {
        companionsIDS: true,
        propertyID: true
      }
    });

    if (!stayRecord) {
      return new NextResponse(
        JSON.stringify({ error: "Registro de reserva não encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const { companionsIDS, propertyID } = stayRecord;

    const property = await prisma.properties.findUnique({
      where: { propertyID: parseInt(propertyID, 10) },
      select: { propertyServer: true, propertyPortStay: true }
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "Propriedade não encontrada." }),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const { propertyServer, propertyPortStay } = property;

    const guestIDs = companionsIDS
      ? [protelGuestID, ...companionsIDS.split(',').map(id => id.trim())]
      : [protelGuestID];

    const guestData = {};

    for (const guestID of guestIDs) {
      try {
        const url = `http://${propertyServer}:${propertyPortStay}/getguestsbyid?profileID=${guestID}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: 'q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi',
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 200) {
          guestData[guestID] = response.data;
        }
      } catch (err) {
        console.error(`Erro ao buscar guestID ${guestID}:`, err.message);
      }
    }

    return new NextResponse(
      JSON.stringify(guestData),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );

  } catch (error) {
    console.error("Erro ao processar a requisição:", error.message);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno no servidor." }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
