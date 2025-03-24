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

import Select from "react-select";

import "./style.css";

// Função para formatar a data
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split(" ")[0].split("/");
    return `${day}/${month}/${year}`;
};

const customStyles = {
    control: (provided) => ({
        ...provided,
        border: "none",
        padding: "1px 4px",
        boxShadow: "none",
        width: "200px",
        '&:hover': {
            borderColor: "black"
        },
    })
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

    const [countryOptions, setCountryOptions] = useState([]);
    const [salutationOptions, setSalutationOptions] = useState([]);
    const [docTypeOptions, setDocTypeOptions] = useState([]);

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

    const fetchNationalities = async () => {
        const response = await axios.get(`/api/sysConectorStay/get_countries?propertyID=${propertyID}`);
        return response.data;
    };
    
    const fetchSalutation = async () => {
        const response = await axios.get(`/api/sysConectorStay/get_salutation?propertyID=${propertyID}`);
        return response.data;
    };
    
    const fetchDocType = async () => {
        const response = await axios.get(`/api/sysConectorStay/get_doc_type?propertyID=${propertyID}`);
        return response.data;
    };
    
    useEffect(() => {
        if (propertyID) {
            // Usando Promise.all para fazer as três requisições ao mesmo tempo
            Promise.all([fetchNationalities(), fetchSalutation(), fetchDocType()])
                .then(([nationalities, salutations, docTypes]) => {
                    // Processando nacionalidades
                    const formattedCountryOptions = nationalities
                        .map((country) => ({
                            value: country.codenr, // ID do país
                            label: country.land    // Nome do país
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)); // Ordena alfabeticamente
    
                    setCountryOptions(formattedCountryOptions);
    
                    // Processando saudações
                    const formattedSalutationOptions = salutations
                        .map((salutation) => ({
                            value: salutation.codenr, // ID da saudação
                            label: salutation.land    // Nome da saudação
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)); // Ordena alfabeticamente
    
                    setSalutationOptions(formattedSalutationOptions);
    
                    // Processando tipos de documentos
                    const formattedDocTypeOptions = docTypes
                        .map((docType) => ({
                            value: docType.codenr,  // ID do tipo de documento
                            label: docType.land     // Nome do tipo de documento
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)); // Ordena alfabeticamente
    
                    setDocTypeOptions(formattedDocTypeOptions);
                })
                .catch((error) => {
                    console.log("Erro ao buscar nacionalidades, saudações ou tipos de documentos:", error);
                });
        }
    }, [propertyID]);    

    return (
        <main>
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : data ? (
                <>
                    <div className="bg-[#8F857D] flex flex-row items-center h-12 pl-64 pr-64 header">
                        <IoChevronBackOutline
                            size={20}
                            color="white"
                            className="cursor-pointer"
                            onClick={() => router.push("./details")}
                        />
                        <p className="font-bold text-white flex-grow text-center">Guest Profile</p>
                    </div>
                    <div className="flex flex-col pl-110 pr-110 mt-8 main-page">
                        {/* PERSONAL DATA */}
                        <div className="flex flex-row items-center mb-4 gap-4">
                            <FaClipboardUser size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Guest Details</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Salutation</p>
                                {/* <input
                                    type="text"
                                    value={renderGuestData("salutation")}
                                    onChange={(e) => setSalutation(e.target.value)}
                                    className="text-right focus:outline-none"
                                /> */}
                                <Select
                                    options={salutationOptions}
                                    value={salutationOptions.find(option => option.label === renderGuestData("salutation")) || null}
                                    onChange={(selectedOption) => setSalutation(selectedOption.label)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>

                            {guestName !== "Unknown guest" && (
                                <>
                                    <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                        <p>Last Name</p>
                                        <input
                                            type="text"
                                            value={lastName}  // Usa diretamente o estado lastName
                                            onChange={(e) => setLastName(e.target.value)}  // Atualiza o estado lastName
                                            className="text-right focus:outline-none" // Alinha o texto à direita
                                        />
                                    </div>

                                    <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
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
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Date of birth</p>
                                <input
                                    type="date" // Isso garante que apenas a data será exibida (sem horas)
                                    value={renderGuestData("birthDate")}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Nationality</p>
                                {/* <input
                                    type="text"
                                    value={renderGuestData("nationality")}
                                    onChange={(e) => setNationality(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                /> */}
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find(option => option.label === renderGuestData("nationality")) || null}
                                    onChange={(selectedOption) => setNationality(selectedOption.label)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>
                        </div>
                        {/* ADDRESS */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <FaLocationPin size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Address</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Country</p>
                                {/* <input
                                    type="text"
                                    value={renderGuestData("country")}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                /> */}
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find(option => option.label === renderGuestData("country")) || null}
                                    onChange={(selectedOption) => setCountry(selectedOption.label)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>
                        </div>
                        {/* COMMUNICATION */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <MdEmail size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Contacts</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Email</p>
                                <input
                                    type="text"
                                    value={renderGuestData("email")}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Phone</p>
                                <input
                                    type="text"
                                    value={renderGuestData("phone")}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
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
                            <p className="font-bold text-xl text-[#e6ac27]">Personal ID</p>
                        </div>
                        <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Document type</p>
                                {/* <input
                                    type="text"
                                    value={renderGuestData("identificationDocument")}
                                    onChange={(e) => setIdentificationDocument(e.target.value)}
                                    className="text-right focus:outline-none"
                                /> */}
                                <Select
                                    options={docTypeOptions}
                                    value={docTypeOptions.find(option => option.label === renderGuestData("identificationDocument")) || null}
                                    onChange={(selectedOption) => setIdentificationDocument(selectedOption.label)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Document no.</p>
                                <input
                                    type="text"
                                    value={renderGuestData("docNo")}
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Expiry date</p>
                                <input
                                    type="text"
                                    value={renderGuestData("documentExpirationDate")}
                                    onChange={(e) => setDocumentExpirationDate(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
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
