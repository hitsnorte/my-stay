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
    return `${year}-${month}-${day}`;
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
    const [countryText, setCountryText] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [mobile, setMobile] = useState("");
    const [docNo, setDocNo] = useState("");
    const [identificationDocument, setIdentificationDocument] = useState("");
    const [documentExpirationDate, setDocumentExpirationDate] = useState("");
    const [documentIssueDate, setDocumentIssueDate] = useState("");
    const [birthCountry, setBirthCountry] = useState("");
    const [vatNo, setVatNo] = useState("");
    const [propertyID, setPropertyID] = useState(null);
    const [reservationID, setReservationID] = useState(null);
    const [guestName, setGuestName] = useState("");

    const [countryOptions, setCountryOptions] = useState([]);
    const [salutationOptions, setSalutationOptions] = useState([]);
    const [docTypeOptions, setDocTypeOptions] = useState([]);

    const [mainGuestID, setMainGuestID] = useState(""); // ID do hóspede selecionado

    // useEffect(() => {
    //     // Acesso ao sessionStorage só no lado do cliente
    //     const storedGuestName = sessionStorage.getItem("selectedGuestName");

    //     if (storedGuestName) {
    //         setGuestName(storedGuestName); // Armazena no estado
    //     } else {
    //         setGuestName("Unknown guest");
    //     }

    //     const token = sessionStorage.getItem("reservationToken");

    //     if (!token) {
    //         router.push("/"); // Redireciona para a página inicial se não houver token
    //         return;
    //     }

    //     try {
    //         const decodedToken = jwtDecode(token);
    //         if (decodedToken?.propertyID && decodedToken?.resNo) {
    //             setPropertyID(decodedToken.propertyID);
    //             setReservationID(decodedToken.resNo);
    //         } else {
    //             console.error("PropertyID ou ReservationID não encontrados no token!");
    //         }
    //     } catch (error) {
    //         console.error("Erro ao decodificar o token:", error);
    //     }

    //     const fetchData = async () => {
    //         try {
    //             const response = await axios.get(`/api/get_reservation?token=${token}`);
    //             const fetchedData = JSON.parse(response.data.requestBody);
    
    //             // Armazena os dados da reserva no estado
    //             setData(fetchedData);
    //             setSalutation(fetchedData.salutation || "");
    //             setBirthDate(fetchedData.birthDate || "");
    //             setNationality(fetchedData.nationality || "");
    //             setCountry(fetchedData.country || "");
    //             setEmail(fetchedData.email || "");
    //             setPhone(fetchedData.phone || "");
    //             setMobile(fetchedData.mobile || "");
    //             setDocNo(fetchedData.docNo || "");
    //             setIdentificationDocument(fetchedData.identificationDocument || "");
    //             setDocumentExpirationDate(fetchedData.documentExpirationDate || "");
    //             setDocumentIssueDate(fetchedData.documentIssueDate || "");
    //             setBirthCountry(fetchedData.birthCountry || "");
    //             setVatNo(fetchedData.vatNo || "");
    //             setStreetAddress(fetchedData.streetAddress || "");
    //             setPostalCode(fetchedData.postalCode || "");
    //             setCity(fetchedData.city || "");
    
    //             // Se o nome do hóspede não for "Unknown guest", define os nomes
    //             if (
    //                 (fetchedData.protelGuestFirstName && fetchedData.protelGuestFirstName !== "Unknown guest") ||
    //                 (fetchedData.protelGuestLastName && fetchedData.protelGuestLastName !== "Unknown guest")
    //             ) {
    //                 setFirstName(fetchedData.protelGuestFirstName || "");
    //                 setLastName(fetchedData.protelGuestLastName || "");
    //             }
    
    //         } catch (err) {
    //             console.error(err); // boa prática: log no console pro dev
    //             setError("Erro ao buscar os dados da reserva");
    //         }
    //     };

    //     fetchData();
    // }, [router]);

    useEffect(() => {
        const storedGuestName = sessionStorage.getItem("selectedGuestName");
        const selectedGuestID = sessionStorage.getItem("selectedGuestID");
        const token = sessionStorage.getItem("reservationToken");
    
        if (storedGuestName) {
            setGuestName(storedGuestName);
        } else {
            setGuestName("Unknown guest");
        }
    
        if (!token) {
            router.push("/");
            return;
        }
    
        let decodedToken = null;
        try {
            decodedToken = jwtDecode(token);
            if (decodedToken?.propertyID && decodedToken?.resNo) {
                setPropertyID(decodedToken.propertyID);
                setReservationID(decodedToken.resNo);
            } else {
                console.error("PropertyID ou ReservationID não encontrados no token!");
            }
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
        }
    
        // Verifica se deve buscar do sessionStorage (hóspede adicional)
        const isUnknownGuest = storedGuestName === "Unknown guest";
        const isMainGuest = !selectedGuestID; // Se não tem ID, assumimos hóspede principal
    
        if (!isUnknownGuest && selectedGuestID) {
            const guestData = JSON.parse(sessionStorage.getItem(selectedGuestID));
            if (guestData) {
                const guestInfo = guestData[0];
    
                setData(guestInfo);
                setSalutation(guestInfo.protelSalution || "");
                setBirthDate(guestInfo.birthDate || "");
                setNationality(guestInfo.nationality || "");
                setCountry(guestInfo.country || "");
                setEmail(guestInfo.email || "");
                setPhone(guestInfo.protelGuestPhone || "");
                setMobile(guestInfo.protelGuestMobilePhone || "");
                setDocNo(guestInfo.identificationDocument || "");
                setIdentificationDocument(guestInfo.protelDocType || "");
                setDocumentExpirationDate(guestInfo.documentExpirationDate || "");
                setDocumentIssueDate(guestInfo.documentIssueDate || "");
                setBirthCountry(guestInfo.birthCountry || "");
                setVatNo(guestInfo.vatNo || "");
                setStreetAddress(guestInfo.protelAddress || "");
                setPostalCode(guestInfo.postalCode || "");
                setCity(guestInfo.city || "");
                setFirstName(guestInfo.protelGuestFirstName || "");
                setLastName(guestInfo.protelGuestLastName || "");
                return; // Evita chamada à API
            } else {
                console.warn("selectedGuestID definido, mas dados não encontrados no sessionStorage.");
            }
        }
    
        // Se for hóspede principal ou nome desconhecido, busca da API
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/get_reservation?token=${token}`);
                const fetchedData = JSON.parse(response.data.requestBody);
    
                setData(fetchedData);
                setSalutation(fetchedData.protelSalutation || "");
                setBirthDate(fetchedData.birthDate || "");
                setNationality(fetchedData.nationality || "");
                setCountry(fetchedData.country || "");
                setEmail(fetchedData.email || "");
                setPhone(fetchedData.protelGuestPhone || "");
                setMobile(fetchedData.protelGuestMobilePhone || "");
                setDocNo(fetchedData.identificationDocument || "");
                setIdentificationDocument(fetchedData.protelDocType || "");
                setDocumentExpirationDate(fetchedData.documentExpirationDate || "");
                setDocumentIssueDate(fetchedData.documentIssueDate || "");
                setBirthCountry(fetchedData.protelAddress || "");
                setVatNo(fetchedData.vatNo || "");
                setStreetAddress(fetchedData.streetAddress || "");
                setPostalCode(fetchedData.postalCode || "");
                setCity(fetchedData.city || "");
                setFirstName(fetchedData.protelGuestFirstName || "");
                setLastName(fetchedData.protelGuestLastName || "");
                setMainGuestID(fetchData.protelGuestID || "");
            } catch (err) {
                console.error(err);
                setError("Erro ao buscar os dados da reserva");
            }
        };
    
        fetchData();
    }, [router]);
    

    const renderGuestData = (field, formatDateFlag = false) => {
        if (guestName === "Unknown guest") return "";

        if (!data) return "";

        // Caso contrário, retorna normalmente
        const value = data[field] || "";
        return formatDateFlag && value ? formatDate(value) : value;
    };

    const handleSave = async () => {
        const token = sessionStorage.getItem("reservationToken");
    
        if (!token) {
            setError("Token de reserva não encontrado.");
            return;
        }
    
        const guestProfileData = {
            propertyID,
            reservationID,
            salutation,
            lastName,
            firstName,
            birthDate,
            nationality,
            country,
            countryText,
            streetAddress,
            postalCode,
            city,
            email,
            phone,
            mobile,
            docNo,
            identificationDocument,
            documentExpirationDate,
            documentIssueDate,
            birthCountry,
            vatNo,
            marketingOptIn: enabledMarketing,
            dataProcessingOptIn: enabledDataP,
        };
    
        // Verifica o tipo de hóspede (main, adicional ou desconhecido)
        const guestType = sessionStorage.getItem("selectedGuestType"); // Pode ser "main", "acompanhante" ou "unknown"
        const selectedGuestID = sessionStorage.getItem("selectedGuestID"); // ID do hóspede, se existir
    
        // Verifica se o hóspede é desconhecido, principal ou adicional
        const isUnknownGuest = guestType === "unknown"; // Hóspede desconhecido
        const isMainGuest = guestType === "main"; // Hóspede principal
        const isAdditionalGuest = guestType === "additional" && selectedGuestID; // Hóspede adicional (tem selectedGuestID)
    
        // Determina o endpoint a ser chamado com base no tipo de hóspede
        let url = "/api/sysConectorStay/submit_guest_profile";  // Default para Unknown Guest
        if (isMainGuest || isAdditionalGuest) {
            url = "/api/sysConectorStay/update_guest_profile";  // Para hóspede principal ou adicional
        }
    
        try {
            const headers = {
                Authorization: "q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi",
                "Content-Type": "application/json",
                "Reservation-Token": token,
            };
    
            // Adiciona cada campo do guestProfileData no header
            Object.entries(guestProfileData).forEach(([key, value]) => {
                headers[`Guest-${key}`] = value !== undefined ? String(value) : "";
            });
    
            // Se for o hóspede principal ou adicional, adiciona o guestID como profileID
            let guestID = "";
    
            if (isMainGuest) {
                guestID = mainGuestID; // Para o hóspede principal, usa o mainGuestID
            } else if (isAdditionalGuest) {
                guestID = selectedGuestID; // Para o hóspede adicional, usa o selectedGuestID
            }
    
            // Se houver guestID (para principal ou adicional), inclui no header
            if (guestID) {
                headers["profileID"] = guestID;
            }
    
            // Envia os dados para o endpoint determinado
            const response = await axios.post(url, {}, { headers });
    
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
                            value: String(country.code),   // Usando 'code' que foi renomeado no backend
                            label: country.country // Usando 'country' que foi renomeado no backend
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)); // Ordena alfabeticamente

                    setCountryOptions(formattedCountryOptions);

                    // Processando saudações
                    const formattedSalutationOptions = salutations
                        .map((salutation) => ({
                            value: String(salutation.code),        // ID da saudação
                            label: salutation.salutation   // Nome da saudação (correto)
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)); // Ordena alfabeticamente

                    setSalutationOptions(formattedSalutationOptions);

                    // Processando tipos de documentos
                    const formattedDocTypeOptions = docTypes
                        .map((docType) => ({
                            value: String(docType.value),  // 'ref' é o campo de ID do tipo de documento
                            label: docType.label  // 'text' é o campo de nome do tipo de documento
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)); // Ordena alfabeticamente

                    setDocTypeOptions(formattedDocTypeOptions);

                })
                .catch((error) => {
                    console.log("Erro ao buscar nacionalidades, saudações ou tipos de documentos:", error);
                });
        }
    }, [propertyID]);


    useEffect(() => {
        if (!data) return;
    
        setSalutation(renderGuestData("protelSalutation"));
        setBirthDate(renderGuestData("birthDate"));
        setNationality(renderGuestData("nationality"));
        setCountry(renderGuestData("country"));
        setStreetAddress(renderGuestData("protelAddress"));
        setPostalCode(renderGuestData("postalCode"));
        setCity(renderGuestData("city"));
        setEmail(renderGuestData("email"));
        setPhone(renderGuestData("protelGuestPhone"));
        setMobile(renderGuestData("protelGuestMobilePhone"));
        setDocNo(renderGuestData("identificationDocument"));
        setIdentificationDocument(renderGuestData("protelDocType"));
        setDocumentExpirationDate(renderGuestData("documentExpirationDate"));
        setDocumentIssueDate(renderGuestData("documentIssueDate"));
        setBirthCountry(renderGuestData("birthCountry"));
        setVatNo(renderGuestData("vatNo"));
    
        // Verificar se o guestName é diferente de "Unknown guest"
        if (guestName !== "Unknown guest") {
            setFirstName(data.protelGuestFirstName || "");
            setLastName(data.protelGuestLastName || "");
            setMainGuestID(data.protelGuestID || ""); // Definir o mainGuestID corretamente
        } else {
            setFirstName(""); // Para o hóspede desconhecido
            setLastName("");  // Para o hóspede desconhecido
            setMainGuestID(null);  // Caso seja um hóspede desconhecido
        }
    }, [data, guestName]);
    

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
                        {/* GUEST DETAILS */}
                        <div className="flex flex-row items-center mb-4 gap-4">
                            <FaClipboardUser size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Guest Details</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Salutation</p>
                                <Select
                                    options={salutationOptions}
                                    value={salutationOptions.find(option => option.value === salutation) || null} // Garantir que está usando 'value'
                                    onChange={(selectedOption) => setSalutation(selectedOption.label)} // Usar 'value' ao invés de 'label'
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>

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
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}  // Atualiza o estado firstName
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Date of birth</p>
                                <input
                                    type="date" // Isso garante que apenas a data será exibida (sem horas)
                                    value={formatDate(birthDate)}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Nationality</p>
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find(option => option.label === nationality) || null}
                                    onChange={(selectedOption) => setNationality(selectedOption.value)}
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
                                <p>Street Address</p>
                                <input
                                    type="text"
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Zip Code</p>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>City</p>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Country</p>
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find(option => option.label === country) || null}
                                    onChange={(selectedOption) => {
                                        setCountry(selectedOption.value);
                                        setCountryText(selectedOption.label);
                                    }}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Phone</p>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Mobile</p>
                                <input
                                    type="text"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                        </div>
                        {/* PERSONAL ID */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <MdEmail size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Personal ID</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Document type</p>
                                <Select
                                    options={docTypeOptions}
                                    value={docTypeOptions.find(option => option.value === identificationDocument) || null} // Garantir que está usando 'value'
                                    onChange={(selectedOption) => setIdentificationDocument(selectedOption.value)} // Usar 'value' ao invés de 'label'
                                    isSearchable
                                    styles={customStyles}
                                />

                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Document no.</p>
                                <input
                                    type="text"
                                    value={docNo}
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Issue date</p>
                                <input
                                    type="date"
                                    value={formatDate(documentIssueDate)}
                                    onChange={(e) => setDocumentIssueDate(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Expiry date</p>
                                <input
                                    type="date"
                                    value={formatDate(documentExpirationDate)}
                                    onChange={(e) => setDocumentExpirationDate(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>Country of birth</p>
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find(option => option.label === birthCountry) || null}
                                    onChange={(selectedOption) => setBirthCountry(selectedOption.value)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>
                        </div>
                        {/* INVOICE DATA */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <MdEmail size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">Invoice Data</p>
                        </div>
                        <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                            <p>Vat No</p>
                            <input
                                type="text"
                                value={vatNo}
                                onChange={(e) => setVatNo(e.target.value)}
                                className="text-right focus:outline-none"
                            />
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
