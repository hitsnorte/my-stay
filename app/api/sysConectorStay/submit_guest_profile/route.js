import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/db"; // Remova esta linha se não precisar do banco de dados

export async function POST(request) {
  try {
    const { token, guestProfileData } = await request.json();
    console.log("Dados recebidos:", { token, guestProfileData });
    if (!token || !guestProfileData || !guestProfileData.propertyID) {
      return new NextResponse(
        JSON.stringify({ error: "Faltam parâmetros obrigatórios: token ou propertyID" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const propertyIDInt = parseInt(guestProfileData.propertyID, 10);
    if (isNaN(propertyIDInt)) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyID inválido, deve ser um número" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // Buscar propertyServer e propertyPort no banco de dados
    const property = await prisma.properties.findUnique({
      where: { propertyID: propertyIDInt },
      select: { propertyServer: true, propertyPortStay: true },
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyID não encontrado no banco de dados" }),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const { propertyServer, propertyPortStay } = property;

    // Construir a URL para envio dos dados
    const url = `http://${propertyServer}:${propertyPortStay}/pp_xml_ckit_submitguestprofile`;
    console.log("Enviando dados para:", url);

    // Enviar os dados para o servidor do hotel
    const response = await axios.post(url, {
        ...guestProfileData,  // Dados do hóspede
        token,  // Token de reserva
      }, {
        headers: {
          Authorization: "q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi", // Token de autorização
          "Content-Type": "application/json",
        },
      });      
      console.log("response: ", response);
    return new NextResponse(JSON.stringify(response.data), {
      status: response.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });

  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return new NextResponse(
      JSON.stringify({
        error: error.response ? error.response.data : "Erro interno no servidor",
      }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
