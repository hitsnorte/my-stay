// File: /app/api/get_property_info/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { propertyID } = body;

    if (!propertyID) {
      return new NextResponse(
        JSON.stringify({ error: "propertyID não fornecido!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const property = await prisma.properties.findUnique({
      where: { id: propertyID },
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "Propriedade não encontrada!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new NextResponse(
      JSON.stringify(property),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao buscar propriedade:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
