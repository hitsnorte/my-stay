"use client";
import { useEffect, useState, useRef } from "react";
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

import PopUpModal from "@/components/popup_modal/page";

import { AiOutlineCalendar } from "react-icons/ai";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const translations = { en, pt };

// Função para formatar a data
const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "";

    // Se já estiver no formato "yyyy-mm-dd", retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return ""; // Data inválida

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
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

    const [open, setOpen] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });
    const [wasSuccessful, setWasSuccessful] = useState(false);

    const issueDateRef = useRef(null);
    const expirationDateRef = useRef(null);
    const birthDateRef = useRef(null);

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
                    setCountry(guestInfo.protelCountryID || "");
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

    const handleCloseModal = () => {
        setShowModal(false);
        if (wasSuccessful) {
            router.push('/reservation/details');
        }
    };

    const handleSave = async () => {

        if (!isDateValidAndNotPast(documentExpirationDate)) {
            setExpirationDateError(t.GuestProfile.ExpirationDate);
            setModalContent({
                title: t.GuestProfile.PopUpModal.Title,
                message: t.GuestProfile.ExpirationDate,
            });
            setShowModal(true);
            return;
        }

        const missingFields = [];

        if (!firstName) missingFields.push("First Name");
        if (!lastName) missingFields.push("Last Name");
        if (!email) missingFields.push("Email");
        if (!country) missingFields.push("Country");
        if (!identificationDocument) missingFields.push("Document Type");
        if (!docNo) missingFields.push("Document Number");
        if (!documentExpirationDate) missingFields.push("Expiry Date");
        if (!birthCountry) missingFields.push("Country of Birth");

        if (missingFields.length > 0) {
            setModalContent({
                title: t.GuestProfile.PopUpModal.Title,
                message: `${t.GuestProfile.PopUpModal.Message} (${missingFields.join(", ")})`,
            });
            setShowModal(true);
            return;
        }

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

        const guestType = sessionStorage.getItem("selectedGuestType");
        const selectedGuestID = sessionStorage.getItem("selectedGuestID");

        const isUnknownGuest = guestType === "unknown";
        const isKnownGuest = guestType === "main" || guestType === "additional";

        let url = "/api/sysConectorStay/submit_guest_profile";
        if (isKnownGuest && selectedGuestID) {
            url = "/api/sysConectorStay/update_guest_profile";
        }

        try {
            const headers = {
                "Content-Type": "application/json",
                "Reservation-Token": token,
            };

            Object.entries(guestProfileData).forEach(([key, value]) => {
                headers[`Guest-${key}`] = value !== undefined ? String(value) : "";
            });

            if (isKnownGuest && selectedGuestID && selectedGuestID !== "unknown") {
                headers["profileID"] = selectedGuestID;
            }

            console.log("Enviando headers:", headers);

            const response = await axios.post(url, {}, { headers });

            let guestID = selectedGuestID;

            if (response.status === 200) {
                if (isUnknownGuest && response.data?.InsertedID) {
                    guestID = response.data.InsertedID;
                }

                if (enabledDataP && guestID) {
                    try {
                        const response = await axios.post("/api/sysConectorStay/update_guest_privacy_policy", {
                            profileID: guestID,
                            propertyID: propertyID,
                        });
                        console.log("Resposta da política de privacidade:", response.data);
                    } catch (privacyErr) {
                        console.warn("Erro ao atualizar política de privacidade:", privacyErr);
                    }
                }

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

                if (guestID) {
                    sessionStorage.setItem(guestID, JSON.stringify([updatedGuestData]));
                }

                setModalContent({
                    title: t.GuestProfile.PopUpModal.SuccessTitle,
                    message: t.GuestProfile.PopUpModal.SuccessMessage,
                });
                setWasSuccessful(true);
                setShowModal(true);
            } else {
                const errorMessage = response?.data?.message;
                setError("Erro ao salvar os dados.");
                setModalContent({
                    title: t.GuestProfile.PopUpModal.ErrorTitle,
                    message: `${t.GuestProfile.PopUpModal.ErrorMessage} ${errorMessage}`,
                });
                setShowModal(true);
            }
        } catch (err) {
            console.log(err);
            const errorMessage = err?.response?.data?.message || err?.message;
            setModalContent({
                title: t.GuestProfile.PopUpModal.ErrorTitle,
                message: `${t.GuestProfile.PopUpModal.ErrorMessage} ${errorMessage}`,
            });
            setShowModal(true);
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
        setBirthDate(formatDate(renderGuestData("birthDate")));
        setNationality(renderGuestData("nationality"));
        setCountry(renderGuestData("protelCountryID"));
        setStreetAddress(renderGuestData("protelAddress"));
        setPostalCode(renderGuestData("postalCode"));
        setCity(renderGuestData("city"));
        setEmail(renderGuestData("email"));
        setPhone(renderGuestData("protelGuestPhone"));
        setMobile(renderGuestData("protelGuestMobilePhone"));
        setDocNo(renderGuestData("identificationDocument"));
        setIdentificationDocument(renderGuestData("protelDocType"));
        setDocumentExpirationDate(formatDate(renderGuestData("documentExpirationDate")));
        setDocumentIssueDate(formatDate(renderGuestData("documentIssueDate")));
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

    const DEFAULT_DATES = ["1900-01-01", "2050-12-31"];

    const formatInputDate = (value) => {
        // Remove tudo que não for número
        let input = value.replace(/\D/g, "");

        // Limita a 8 dígitos (aaaa mm dd)
        input = input.slice(0, 8);

        if (input.length > 4) input = input.slice(0, 4) + "-" + input.slice(4);
        if (input.length > 7) input = input.slice(0, 7) + "-" + input.slice(7);

        return input;
    };

    // Função que garante que o valor passado para o DatePicker seja um Date válido
    const parseDate = (value) => {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    };

    const [expirationDateError, setExpirationDateError] = useState("");

    const isDateValidAndNotPast = (dateStr) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

        const inputDate = new Date(dateStr + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inputDate >= today;
    };

    const handleExpirationDateChange = (e) => {
        const formattedDate = formatInputDate(e.target.value);

        if (formattedDate.length === 10 && !isDateValidAndNotPast(formattedDate)) {
            setExpirationDateError(t.GuestProfile.ExpirationDate);
            // Não atualiza o valor inválido
            return;
        }

        setExpirationDateError("");
        setDocumentExpirationDate(formattedDate);
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
                                <p>{t.GuestProfile.GuestDetails.LastName}*</p>
                                <input
                                    type="text"
                                    value={lastName}  // Usa diretamente o estado lastName
                                    onChange={(e) => setLastName(e.target.value)}  // Atualiza o estado lastName
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>

                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.FirstName}*</p>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}  // Atualiza o estado firstName
                                    className="text-right focus:outline-none" // Alinha o texto à direita
                                />
                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.DateOfBirth}</p>

                                <div className="flex items-center">
                                    {/* Input visível */}
                                    <input
                                        type="text"
                                        value={DEFAULT_DATES.includes(birthDate) || !birthDate ? "aaaa-mm-dd" : birthDate}
                                        onChange={(e) => {
                                            const formatted = formatInputDate(e.target.value);
                                            setBirthDate(formatted);
                                        }}
                                        placeholder="aaaa-mm-dd"
                                        className="text-right focus:outline-none"
                                    />

                                    {/* Ícone que abre o calendário */}
                                    <AiOutlineCalendar
                                        size={22}
                                        className="ml-2 cursor-pointer text-gray-500 hover:text-orange-500"
                                        onClick={() => birthDateRef.current?.setOpen(true)}
                                    />

                                    {/* DatePicker invisível para controlar o calendário */}
                                    <DatePicker
                                        ref={birthDateRef}
                                        selected={parseDate(birthDate)}
                                        onChange={(date) => {
                                            const formatted = date ? date.toISOString().split("T")[0] : "";
                                            setBirthDate(formatted);
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        withPortal={false}
                                        className="hidden" // esconde o input do datepicker
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.GuestDetails.Nationality}</p>
                                <Select
                                    options={countryOptions}
                                    value={
                                        countryOptions.find(
                                            option => option.value === String(nationality) || option.label === nationality
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
                                <p>{t.GuestProfile.Address.Country}*</p>
                                <Select
                                    options={countryOptions}
                                    value={
                                        countryOptions.find(
                                            option => option.value === String(country)
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
                                <p>{t.GuestProfile.Contact.Email}*</p>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-right focus:outline-none w-120"
                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
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
                                <p>{t.GuestProfile.PersonalID.DocumentType}*</p>
                                <Select
                                    options={docTypeOptions}
                                    value={docTypeOptions.find(option => option.value === String(identificationDocument)) || null} // Garantir que está usando 'value'
                                    onChange={(selectedOption) => setIdentificationDocument(selectedOption.value)} // Usar 'value' ao invés de 'label'
                                    isSearchable
                                    styles={customStyles}
                                />

                            </div>
                            <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.PersonalID.DocumentNumber}*</p>
                                <input
                                    type="text"
                                    value={docNo}
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="text-right focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-row justify-between items-center border-b-2 pb-2 group focus-within:border-orange-500 mb-10">
                                <p>{t.GuestProfile.PersonalID.IssueDate}</p>

                                <div className="flex items-center">
                                    {/* Input visível que você já tinha */}
                                    <input
                                        type="text"
                                        value={
                                            DEFAULT_DATES.includes(documentIssueDate) || !documentIssueDate
                                                ? ""
                                                : documentIssueDate
                                        }
                                        onChange={(e) => {
                                            const formatted = formatInputDate(e.target.value);
                                            setDocumentIssueDate(formatted);
                                        }}
                                        placeholder="aaaa-mm-dd"
                                        className="text-right focus:outline-none"
                                    />

                                    {/* Ícone que abre o calendário */}
                                    <AiOutlineCalendar
                                        size={22}
                                        className="ml-2 cursor-pointer text-gray-500 hover:text-orange-500"
                                        onClick={() => issueDateRef.current?.setOpen(true)}
                                    />

                                    {/* DatePicker invisível, só usado para controlar o calendário */}
                                    <DatePicker
                                        ref={issueDateRef}
                                        selected={parseDate(documentIssueDate)}
                                        onChange={(date) => {
                                            const formatted = date ? date.toISOString().split("T")[0] : "";
                                            setDocumentIssueDate(formatted);
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        showMonthDropdown        // permite selecionar o mês rapidamente
                                        showYearDropdown         // permite selecionar o ano rapidamente
                                        dropdownMode="select"    // dropdown nativo para mês/ano
                                        withPortal={false}
                                        className="hidden"       // esconde totalmente o input do datepicker
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-row justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                    <p>{t.GuestProfile.PersonalID.ExpiracyDate}*</p>

                                    <div className="flex items-center">
                                        {/* Input visível */}
                                        <input
                                            type="text"
                                            value={documentExpirationDate}
                                            onChange={handleExpirationDateChange}
                                            placeholder="aaaa-mm-dd"
                                            className="text-right focus:outline-none"
                                        />

                                        {/* Ícone que abre o calendário */}
                                        <AiOutlineCalendar
                                            size={22}
                                            className="ml-2 cursor-pointer text-gray-500 hover:text-orange-500"
                                            onClick={() => expirationDateRef.current?.setOpen(true)}
                                        />

                                        {/* DatePicker invisível para controlar o calendário */}
                                        <DatePicker
                                            ref={expirationDateRef}
                                            selected={parseDate(documentExpirationDate)}
                                            onChange={(date) => {
                                                const formatted = date ? date.toISOString().split("T")[0] : "";
                                                handleExpirationDateChange({ target: { value: formatted } });
                                            }}
                                            dateFormat="yyyy-MM-dd"
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            withPortal={false}
                                            className="hidden" // input do datepicker escondido
                                        />
                                    </div>
                                </div>

                                {expirationDateError && (
                                    <p className="text-red-600 text-sm mt-1">{expirationDateError}</p>
                                )}
                            </div>
                            <div className="flex flex-row items-center justify-between border-b-2 pb-2 group focus-within:border-orange-500">
                                <p>{t.GuestProfile.PersonalID.CountryOfBirth}*</p>
                                <Select
                                    options={countryOptions}
                                    value={
                                        countryOptions.find(
                                            option => option.value === String(birthCountry) || option.label === birthCountry
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
                            {locale === "en"
                                ? propertyInfo?.hotelTermsEN
                                : locale === "pt"
                                    ? propertyInfo?.hotelTermsPT
                                    : ""}
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
                        {/* <p>{t.GuestProfile.Privacy.PrivacyPolicy}</p> */}
                        <p
                            onClick={() => setOpen(true)}
                            className="cursor-pointer text-sky-600 underline inline-block"
                        >
                            {t.GuestProfile.Privacy.PrivacyPolicy}
                        </p>
                        {/* overlay + modal */}
                        {open && (
                            <div
                                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                                onClick={() => setOpen(false)} // fecha se clicar fora
                            >
                                <div
                                    className="bg-white max-w-2xl w-full h-auto rounded-2xl shadow-xl relative"
                                    onClick={e => e.stopPropagation()} // impede fecho ao clicar dentro
                                >
                                    {/* Cruz no canto superior direito */}
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-gray-900"
                                    >
                                        &times; {/* Aqui usamos o símbolo "×" para a cruz */}
                                    </button>

                                    <h2 className="text-xl text-white font-semibold mb-2 bg-[#e6ac27] p-6 rounded-t-2xl text-left">
                                        {t.GuestProfile.Privacy.PrivacyPolicyTerms}
                                    </h2>

                                    {/* conteúdo real da política vai aqui */}
                                    <p className="text-sm leading-relaxed p-6">
                                        {locale === "en"
                                            ? propertyInfo?.privacyPolicyEN
                                            : locale === "pt"
                                                ? propertyInfo?.privacyPolicyPT
                                                : ""}
                                    </p>
                                </div>
                            </div>
                        )}
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
            {showModal && (
                <PopUpModal
                    title={modalContent.title}
                    message={modalContent.message}
                    onClose={handleCloseModal}
                />
            )}
        </main>
    );
}
