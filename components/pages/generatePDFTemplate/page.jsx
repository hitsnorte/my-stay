import { jsPDF } from "jspdf";

export async function generatePDFTemplate({ propertyID, reservationData, mainGuestData }) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Prepare Check-In", 20, 20);

    doc.setFontSize(12);
    doc.text(`Property ID: ${propertyID}`, 20, 40);
    doc.text(`Reservation ID: ${reservationData.protelReservationID}`, 20, 50);
    doc.text(`Hotel: ${reservationData.protelMpeHotel}`, 20, 60);

    doc.text(`Main Guest: ${mainGuestData.protelGuestFirstName} ${mainGuestData.protelGuestLastName}`, 20, 70);
    doc.text(`Guest ID: ${mainGuestData.protelGuestID}`, 20, 80);
    doc.text(`Email: ${mainGuestData.protelGuestEmail || "Not Provided"}`, 20, 90);
    doc.text(`Phone: ${mainGuestData.protelGuestPhone || "Not Provided"}`, 20, 100);
    doc.text(`Address: ${mainGuestData.protelAddress || "Not Provided"}`, 20, 110);
    doc.text(`Country: ${mainGuestData.protelGuestCountry || "Not Provided"}`, 20, 120);

    // additionalGuests.forEach((guest, index) => {
    //     doc.text(`Guest ${index + 1}: ${guest.protelGuestFirstName} ${guest.protelGuestLastName}`, 20, 130 + (index * 10));
    //     doc.text(`Email: ${guest.protelGuestEmail || "Not Provided"}`, 20, 140 + (index * 10));
    //     doc.text(`Phone: ${guest.protelGuestPhone || "Not Provided"}`, 20, 150 + (index * 10));
    //     doc.text(`Address: ${guest.protelAddress || "Not Provided"}`, 20, 160 + (index * 10));
    //     doc.text(`Country: ${guest.protelGuestCountry || "Not Provided"}`, 20, 170 + (index * 10));
    // });

    const signature = sessionStorage.getItem("userSignature");
    if (signature) {
        const imageData = signature;
        doc.addImage(imageData, 'PNG', 20, 200, 100, 50);
    } else {
        doc.text("Signature: Not Provided", 20, 200);
    }

    const pdfBase64 = doc.output('datauristring');
    return pdfBase64;
}
