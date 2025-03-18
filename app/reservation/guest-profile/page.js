"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Importação do Axios

import { Switch } from "@headlessui/react"; // Componente Switch do HeroUI

import { IoChevronBackOutline } from "react-icons/io5";
import { FaClipboardUser } from "react-icons/fa6";
import { FaLocationPin } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { BsShieldLockFill } from "react-icons/bs";

import { jwtDecode } from "jwt-decode";


// Função para formatar a data
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split(" ")[0].split("/");
    return `${day}/${month}/${year}`;
};

export default function GuestProfile() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [enabledMarketing, setEnabledMarketing] = useState(false); // Estado para o primeiro switch
    const [enabledDataP, setEnabledDataP] = useState(false); // Estado para o segundo switch

    const [firstName, setFirstName] = useState(""); // Estado para o primeiro nome
    const [lastName, setLastName] = useState(""); // Estado para o sobrenome
    const [salutation, setSalutation] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [nationality, setNationality] = useState("");
    const [country, setCountry] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [mobile, setMobile] = useState("");
    const [docNo, setDocNo] = useState("");
    const [identificationDocument, setIdentificationDocument] = useState("");
    const [documentExpirationDate, setDocumentExpirationDate] = useState("");
    const [birthCountry, setBirthCountry] = useState("");

    const [propertyID, setPropertyID] = useState(null);
    const [guestName, setGuestName] = useState("");

    useEffect(() => {
        // Acesso ao sessionStorage só no lado do cliente
        const storedGuestName = sessionStorage.getItem("selectedGuestName");

        if (storedGuestName) {
            setGuestName(storedGuestName); // Armazena no estado
        } else {
            setGuestName("Unknown guest");
        }

        const token = sessionStorage.getItem("reservationToken");

        if (!token) {
            router.push("/"); // Redireciona para a página inicial se não houver token
            return;
        }

        try {
            // Decodifica o token para extrair o propertyID
            const decodedToken = jwtDecode(token);
            if (decodedToken.propertyID) {
                setPropertyID(decodedToken.propertyID);
                console.log("PropertyID extraído do token:", decodedToken.propertyID);
            } else {
                console.error("PropertyID não encontrado no token!");
            }
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
        }

        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/get_reservation?token=${token}`);
                const fetchedData = JSON.parse(response.data.requestBody);

                // Armazena os dados da reserva no estado
                setData(fetchedData);
                setSalutation(fetchedData.salutation || "");
                setBirthDate(fetchedData.birthDate || "");
                setNationality(fetchedData.nationality || "");
                setCountry(fetchedData.country || "");
                setEmail(fetchedData.email || "");
                setPhone(fetchedData.phone || "");
                setMobile(fetchedData.mobile || "");
                setDocNo(fetchedData.docNo || "");
                setIdentificationDocument(fetchedData.identificationDocument || "");
                setDocumentExpirationDate(fetchedData.documentExpirationDate || "");
                setBirthCountry(fetchedData.birthCountry || "");

                // Se o nome do hóspede não for "Unknown guest", divide o nome completo
                if (fetchedData.protelGuestName && fetchedData.protelGuestName !== "Unknown guest") {
                    const { firstName, lastName } = splitFullName(fetchedData.protelGuestName);
                    console.log("Primeiro nome:", firstName);
                    setFirstName(firstName);
                    setLastName(lastName);
                }

            } catch (err) {
                setError("Erro ao buscar os dados da reserva");
            }
        };

        fetchData();
    }, [router]);

    // Função para separar o nome completo em primeiro nome e sobrenome
    const splitFullName = (fullName) => {
        if (!fullName) return { firstName: "", lastName: "" };
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || ""; // Primeiro nome
        const lastName = nameParts.slice(1).join(" ") || ""; // Sobrenome (caso tenha mais de um nome)
        return { firstName, lastName };
    };

    const renderGuestData = (field, formatDateFlag = false) => {
        if (guestName === "Unknown guest") {
            return ""; // Deixa os campos vazios para "Unknown guest"
        }

        const value = data ? data[field] || "" : ""; // Retorna os dados se houver
        if (formatDateFlag && value) {
            return formatDate(value); // Se precisar formatar como data
        }
        return value;
    };

    const handleSave = async () => {
        const token = sessionStorage.getItem("reservationToken");

        if (!token) {
            setError("Token de reserva não encontrado.");
            return;
        }

        const guestProfileData = {
            propertyID,
            salutation,
            lastName,
            firstName,
            birthDate,
            nationality,
            country,
            email,
            phone,
            mobile,
            docNo,
            identificationDocument,
            documentExpirationDate,
            birthCountry,
            marketingOptIn: enabledMarketing,
            dataProcessingOptIn: enabledDataP,
        };

        try {
            const response = await axios.post("/api/sysConectorStay/submit_guest_profile", {
                token,
                guestProfileData,
            });

            if (response.status === 200) {
                alert("Dados salvos com sucesso!");
            } else {
                setError("Erro ao salvar os dados.");
            }
        } catch (err) {
            setError("Erro ao enviar os dados. Tente novamente.");
        }
    };

    return (
        <main>
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : data ? (
                <>
                    <div className="bg-[#8F857D] flex flex-row items-center h-12 pl-64 pr-64">
                        <IoChevronBackOutline
                            size={20}
                            color="white"
                            className="cursor-pointer"
                            onClick={() => router.push("./details")}
                        />
                        <p className="font-bold text-white flex-grow text-center">Guest Profile</p>
                    </div>
                    <div className="flex flex-col pl-110 pr-110 mt-8">
                        {/* PERSONAL DATA */}
                        <div className="flex flex-row items-center mb-4 gap-4">
                            <FaClipboardUser size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Personal data</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Salutation</p>
                                <input
                                    type="text"
                                    value={renderGuestData("salutation")}
                                    onChange={(e) => setSalutation(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                            {guestName !== "Unknown guest" && (
                                <>
                                    <div className="flex flex-row justify-between">
                                        <p>Last Name</p>
                                        <input
                                            type="text"
                                            value={lastName}  // Usa diretamente o estado lastName
                                            onChange={(e) => setLastName(e.target.value)}  // Atualiza o estado lastName
                                            className="text-right focus:outline-none" // Alinha o texto à direita
                                        />
                                    </div>

                                    <div className="flex flex-row justify-between">
                                        <p>First Name</p>
                                        <input
                                            type="text"
                                            value={firstName}  // Usa diretamente o estado firstName
                                            onChange={(e) => setFirstName(e.target.value)}  // Atualiza o estado firstName
                                            className="text-right focus:outline-none" // Alinha o texto à direita
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex flex-row justify-between">
                                <p>Date of birth</p>
                                <input
                                    type="date" // Isso garante que apenas a data será exibida (sem horas)
                                    value={renderGuestData("birthDate")}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                            <div className="flex flex-row justify-between">
                                <p>Nationality</p>
                                <input
                                    type="text"
                                    value={renderGuestData("nationality")}
                                    onChange={(e) => setNationality(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                        </div>
                        {/* ADDRESS */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <FaLocationPin size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Address</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Country</p>
                                <input
                                    type="text"
                                    value={renderGuestData("country")}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                        </div>
                        {/* COMMUNICATION */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <MdEmail size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Communication</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Email</p>
                                <input
                                    type="text"
                                    value={renderGuestData("email")}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between">
                                <p>Phone</p>
                                <input
                                    type="text"
                                    value={renderGuestData("phone")}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between">
                                <p>Mobile</p>
                                <input
                                    type="text"
                                    value={renderGuestData("mobile")}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                        </div>
                        {/* PASSPORT */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <MdEmail size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Passport</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Passport no.</p>
                                <input
                                    type="text"
                                    value={renderGuestData("docNo")}
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between">
                                <p>Document type</p>
                                <input
                                    type="text"
                                    value={renderGuestData("identificationDocument")}
                                    onChange={(e) => setIdentificationDocument(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between">
                                <p>Expiry date</p>
                                <input
                                    type="text"
                                    value={renderGuestData("documentExpirationDate")}
                                    onChange={(e) => setDocumentExpirationDate(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between">
                                <p>Country of birth</p>
                                <input
                                    type="text"
                                    value={renderGuestData("birthCountry")}
                                    onChange={(e) => setBirthCountry(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                        </div>
                        {/* PRIVACY */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <BsShieldLockFill size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Privacy</p>
                        </div>
                        <p>PLEASE CUSTOMIZE: Add a short paragraph with your information regarding marketing and/or data processing here.</p>

                        {/* First Switch */}
                        <div className="flex items-center mt-4">
                            <Switch
                                checked={enabledMarketing}
                                onChange={setEnabledMarketing}
                                className={`${enabledMarketing ? 'bg-[#e6ac27]' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
                            >
                                <span
                                    className={`${enabledMarketing ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                />
                            </Switch>
                            <span className="ml-4">CUSTOMIZE: Marketing</span>
                        </div>

                        {/* Second Switch */}
                        <div className="flex items-center mt-4 mb-4">
                            <Switch
                                checked={enabledDataP}
                                onChange={setEnabledDataP}
                                className={`${enabledDataP ? 'bg-[#e6ac27]' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
                            >
                                <span
                                    className={`${enabledDataP ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                />
                            </Switch>
                            <span className="ml-4">CUSTOMIZE: Data Processing</span>
                        </div>
                        <p>Please click here to open our privacy policy.</p>
                        {/* SAVE */}
                        <button
                            onClick={handleSave}
                            className="bg-[#e6ac27] text-white mt-4 mb-4 p-3"
                        >
                            SAVE
                        </button>

                    </div>
                </>
            ) : (
                <p>Carregando...</p>
            )}
        </main>
    );
}
