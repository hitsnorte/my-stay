import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Token não fornecido!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar e decodificar o token
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return new NextResponse(
        JSON.stringify({ error: "Token inválido ou expirado!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Buscar os dados da reserva no banco de dados usando o token
    const stayRecord = await prisma.stayRecords.findFirst({
      where: { token },
      select: {
        requestBody: true, // Pegando apenas o requestBody
      },
    });

    if (!stayRecord) {
      return new NextResponse(
        JSON.stringify({ error: "Reserva não encontrada!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new NextResponse(
      JSON.stringify(stayRecord),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao buscar reserva:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
