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

import en from "../../../public/locales/english/common.json";
import pt from "../../../public/locales/portuguesePT/common.json";

import countryDialCodes from "@/lib/countryDialCodes.json";

import "./style.css";

const translations = { en, pt };

// Função para formatar a data
const formatDate = (dateStr) => {
    if (!dateStr) return "";

    // Se já está no formato correto, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    try {
        const [datePart] = dateStr.split(" ");
        const [day, month, year] = datePart.split("/");

        if (!day || !month || !year) return "";

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } catch (err) {
        console.error("Erro ao formatar a data:", err);
        return "";
    }
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

    const [mainGuestID, setMainGuestID] = useState(null);

    const [propertyInfo, setPropertyInfo] = useState(null);

    const [locale, setLocale] = useState("en"); // Idioma padrão

    useEffect(() => {
        // Verifica o idioma armazenado no localStorage ao carregar a página
        const storedLang = localStorage.getItem("lang");
        if (storedLang) {
            setLocale(storedLang);
        }
    }, []);

    const t = translations[locale];

    const init = async () => {
        const storedGuestName = sessionStorage.getItem("selectedGuestName");
        const selectedGuestID = sessionStorage.getItem("selectedGuestID");
        const selectedGuestType = sessionStorage.getItem("selectedGuestType"); // 👈 pega o tipo
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
            if (decodedToken?.propertyID && decodedToken?.resNo && decodedToken?.profileID) {
                setPropertyID(decodedToken.propertyID);
                setReservationID(decodedToken.resNo);
                setMainGuestID(decodedToken.profileID);

                // 🔄 Decide quem carregar: principal ou adicional
                let guestDataRaw = null;

                if (selectedGuestType === "additional" && selectedGuestID) {
                    guestDataRaw = sessionStorage.getItem(selectedGuestID);
                } else {
                    guestDataRaw = sessionStorage.getItem(decodedToken.profileID); // default para principal
                }

                if (guestDataRaw) {
                    const guestInfo = JSON.parse(guestDataRaw)[0];

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
                } else {
                    console.warn("Dados do hóspede não encontrados no sessionStorage.");
                }
            }
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
        }
    };

    useEffect(() => {
        init();
    }, [router]);

    // Esse useEffect chama a API quando propertyID estiver definido
    useEffect(() => {
        const fetchPropertyInfo = async () => {
            try {
                const response = await fetch("/api/get_property_info", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ propertyID }),
                });

                if (!response.ok) {
                    throw new Error("Erro ao buscar informações da propriedade");
                }

                const data = await response.json();
                setPropertyInfo(data); // ou trate os dados conforme necessário
            } catch (error) {
                console.error("Erro ao buscar informações da propriedade:", error);
            }
        };

        if (propertyID) {
            fetchPropertyInfo();
        }
    }, [propertyID]);

    const renderGuestData = (field, formatDateFlag = false) => {
        if (guestName === "Unknown guest") return "";

        if (!data) return "";

        // Caso contrário, retorna normalmente
        const value = data[field] || "";
        return formatDateFlag && value ? formatDate(value) : value;
    };

    const handleSave = async () => {
        const token = sessionStorage.getItem("reservationToken");
        console.log("ID", mainGuestID);

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

            // Aqui estamos logando os dados que serão enviados
            console.log("Enviando dados para o servidor com os seguintes headers:");
            console.log(headers);

            // Envia os dados para o endpoint determinado
            const response = await axios.post(url, {}, { headers });

            if (response.status === 200) {
                const updatedGuestData = {
                    protelSalution: salutation,
                    birthDate,
                    nationality,
                    country,
                    email,
                    protelGuestPhone: phone,
                    protelGuestMobilePhone: mobile,
                    identificationDocument: docNo,
                    protelDocType: identificationDocument,
                    documentExpirationDate,
                    documentIssueDate,
                    birthCountry,
                    vatNo,
                    protelAddress: streetAddress,
                    postalCode,
                    city,
                    protelGuestFirstName: firstName,
                    protelGuestLastName: lastName,
                };

                // Atualiza sessionStorage conforme o tipo de hóspede
                if (isMainGuest && mainGuestID) {
                    sessionStorage.setItem(mainGuestID, JSON.stringify([updatedGuestData]));
                } else if (isAdditionalGuest && selectedGuestID) {
                    sessionStorage.setItem(selectedGuestID, JSON.stringify([updatedGuestData]));
                }

                alert("Dados salvos com sucesso!");
                router.push('/reservation/details').then(() => {
                    window.location.reload();
                });
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
        const langCode = localStorage.getItem("langCode") || "1"; // fallback para "1" (en) se não houver
        const response = await axios.get(`/api/sysConectorStay/get_salutation`, {
            params: {
                propertyID: propertyID,
                langCode: langCode
            }
        });
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
        } else {
            setFirstName(""); // Para o hóspede desconhecido
            setLastName("");  // Para o hóspede desconhecido
        }
    }, [data, guestName]);

       // Função para obter o código de país
       const getCountryCode = (countryText) => {
        return countryDialCodes[countryText] || '+351'; // Portugal como default
    };

    // Função para atualizar o número com o novo código de país
    const updatePhoneWithNewDialCode = (newCountryText, currentPhone) => {
        const dialCode = getCountryCode(newCountryText);
        // Se o número já contiver um código de país, remove-o e adiciona o novo
        const phoneWithoutDialCode = currentPhone.replace(/^\+\d{1,4}\s*/, '').trim();
        return dialCode + ' ' + phoneWithoutDialCode;
    };

    // Quando o país mudar, atualiza o número de telefone e celular
    useEffect(() => {
        setPhone(updatePhoneWithNewDialCode(countryText, phone));
        setMobile(updatePhoneWithNewDialCode(countryText, mobile));
    }, [countryText]); // Atualiza quando o país mudar

    // Função para manipular a mudança do telefone
    const handlePhoneChange = (e) => {
        let value = e.target.value;
        const dialCode = getCountryCode(countryText);
        
        // Remover o código de país caso o usuário tente digitar novamente
        if (value.startsWith(dialCode)) {
            value = value.slice(dialCode.length).trim(); // Remove o código de país
        }

        setPhone(dialCode + ' ' + value); // Adiciona o código de país apenas uma vez
    };

    // Função para manipular a mudança do celular
    const handleMobileChange = (e) => {
        let value = e.target.value;
        const dialCode = getCountryCode(countryText);
        
        // Remover o código de país caso o usuário tente digitar novamente
        if (value.startsWith(dialCode)) {
            value = value.slice(dialCode.length).trim(); // Remove o código de país
        }

        setMobile(dialCode + ' ' + value); // Adiciona o código de país apenas uma vez
    };

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
                        <p className="font-bold text-white flex-grow text-center">{t.GuestProfile.Title}</p>
                    </div>
                    <div className="flex flex-col pl-110 pr-110 mt-8 main-page">
                        {/* GUEST DETAILS */}
                        <div className="flex flex-row items-center mb-4 gap-4">
                            <FaClipboardUser size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">{t.GuestProfile.GuestDetails.Title}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.Salutation}</p>
                                <Select
                                    options={salutationOptions}
                                    value={
                                        salutationOptions.find(
                                            option => option.value === salutation || option.label === salutation
                                        ) || null
                                    }
                                    onChange={(selectedOption) => setSalutation(selectedOption.label)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>

                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.LastName}</p>
                                <input
                                    type="text"
                                    value={lastName}  // Usa diretamente o estado lastName
                                    onChange={(e) => setLastName(e.target.value)}  // Atualiza o estado lastName
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>

                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.FirstName}</p>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}  // Atualiza o estado firstName
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.DateOfBirth}</p>
                                <input
                                    type="date"
                                    value={formatDate(birthDate)}
                                    onChange={(e) => { setBirthDate(e.target.value); }}
                                    className="text-right focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.Nationality}</p>
                                <Select
                                    options={countryOptions}
                                    value={
                                        countryOptions.find(
                                            option => option.value === nationality || option.label === nationality
                                        ) || null
                                    }
                                    onChange={(selectedOption) => setNationality(selectedOption.value)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>
                        </div>
                        {/* ADDRESS */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <FaLocationPin size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">{t.GuestProfile.Address.Title}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.Address.StreetAddress}</p>
                                <input
                                    type="text"
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.Address.PostalCode}</p>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.Address.City}</p>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.Address.Country}</p>
                                <Select
                                    options={countryOptions}
                                    value={
                                        countryOptions.find(
                                            option => option.value === country || option.label === country
                                        ) || null
                                    }
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
                            <p className="font-bold text-xl text-[#e6ac27]">{t.GuestProfile.Contact.Title}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.Contact.Email}</p>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.Contact.Phone}</p>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.Contact.Mobile}</p>
                                <input
                                    type="text"
                                    value={mobile}
                                    onChange={handleMobileChange}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                        </div>
                        {/* PERSONAL ID */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <MdEmail size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">{t.GuestProfile.PersonalID.Title}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.PersonalID.DocumentType}</p>
                                <Select
                                    options={docTypeOptions}
                                    value={docTypeOptions.find(option => option.value === identificationDocument) || null} // Garantir que está usando 'value'
                                    onChange={(selectedOption) => setIdentificationDocument(selectedOption.value)} // Usar 'value' ao invés de 'label'
                                    isSearchable
                                    styles={customStyles}
                                />

                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.PersonalID.DocumentNumber}</p>
                                <input
                                    type="text"
                                    value={docNo}
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.PersonalID.IssueDate}</p>
                                <input
                                    type="date"
                                    value={formatDate(documentIssueDate)}
                                    onChange={(e) => setDocumentIssueDate(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.PersonalID.ExpiracyDate}</p>
                                <input
                                    type="date"
                                    value={formatDate(documentExpirationDate)}
                                    onChange={(e) => setDocumentExpirationDate(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.PersonalID.CountryOfBirth}</p>
                                <Select
                                    options={countryOptions}
                                    value={
                                        countryOptions.find(
                                            option => option.value === birthCountry || option.label === birthCountry
                                        ) || null
                                    }
                                    onChange={(selectedOption) => setBirthCountry(selectedOption.value)}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>
                        </div>
                        {/* INVOICE DATA */}
                        <div className="flex flex-row items-center mb-4 mt-6 gap-4">
                            <MdEmail size={30} color="#e6ac27" />
                            <p className="font-bold text-xl text-[#e6ac27]">{t.GuestProfile.InvoiceData.Title}</p>
                        </div>
                        <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                            <p>{t.GuestProfile.InvoiceData.VatNo}</p>
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
                            <p className="font-bold text-xl text-[#e6ac27]">{t.GuestProfile.Privacy.Title}</p>
                        </div>
                        <p>
                            {propertyInfo?.hotelTermsEN || ""}
                        </p>

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
                            <span className="ml-4">{t.GuestProfile.Privacy.Marketing}</span>
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
                            <span className="ml-4">{t.GuestProfile.Privacy.DataProcessing}</span>
                        </div>
                        <p>{t.GuestProfile.Privacy.PrivacyPolicy}</p>
                        {/* SAVE */}
                        <button
                            onClick={handleSave}
                            className="bg-[#e6ac27] text-white mt-4 mb-4 p-3"
                        >
                            {t.GuestProfile.Privacy.Save}
                        </button>

                    </div>
                </>
            ) : (
                <p>Carregando...</p>
            )}
        </main>
    );
}
