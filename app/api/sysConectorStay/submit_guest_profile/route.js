import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/db"; // Remova esta linha se não precisar do banco de dados

export async function POST(request) {
  try {
    const headers = request.headers;
    const token = headers.get("Reservation-Token");

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Token de reserva não encontrado" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // Coleta os dados do hóspede a partir dos headers
    const guestProfileData = {
      propertyID: headers.get("Guest-propertyID"),
      Salutation_string40: headers.get("Guest-salutation"),
      LastName_string80: headers.get("Guest-lastName"),
      FirstName_string50: headers.get("Guest-firstName"),
      birthday_date: headers.get("Guest-birthDate"),
      nationality_integer: parseInt(headers.get("Guest-nationality")),
      CountryID_CodeNrColumnFromNatcode_integer: parseInt(headers.get("Guest-country")),
      CountryID_LandColumnFromNatcode_string80: headers.get("Guest-countryText"),
      emailaddress_string75: headers.get("Guest-email"),
      guestPhone_string50: headers.get("Guest-phone"),
      mobilePhone_string50: headers.get("Guest-mobile"),
      idDocument_string30: headers.get("Guest-docNo"),
      doctype_integer: parseInt(headers.get("Guest-identificationDocument")),
      expDate_date: headers.get("Guest-documentExpirationDate"),
      issueDate_date: headers.get("Guest-documentIssueDate"),
      birthCountry_integer: parseInt(headers.get("Guest-birthCountry")),
      marketingOptIn: headers.get("Guest-marketingOptIn") === "true",
      dataProcessingOptIn: headers.get("Guest-dataProcessingOptIn") === "true",
      StreetAddress_string80: "teste",
      ZipCode_string17: "teste",
      City_string50: "teste",
      vatNO_string30: "teste",
      IDReserva_integer: parseInt(headers.get("Guest-reservationID"))
    };

    console.log("Dados recebidos via headers:", { token, guestProfileData });

    if (!guestProfileData.propertyID) {
      return new NextResponse(
        JSON.stringify({ error: "Faltam parâmetros obrigatórios: propertyID" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }
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
    const url = `http://${propertyServer}:${propertyPortStay}/insertcompanion`;
    console.log("Enviando dados para:", url);

    // Enviar os dados para o servidor do hotel
    const response = await axios.post(url, {}, {
      headers: {
        ...guestProfileData,  // Enviando os dados do hóspede nos headers
        token,  // Token de reserva
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
