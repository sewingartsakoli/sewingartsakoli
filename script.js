(() => {
    "use strict";

    /* =========================================================
       SEWING ARTS CENTER
       SECURE FRONTEND SCRIPT

       CONTACT FLOW

       WhatsApp:
       Button
       → Enquiry Form
       → Cloudflare Worker
       → Resend Email
       → WhatsApp

       Email:
       Button
       → Enquiry Form
       → Cloudflare Worker
       → Resend Email
    ========================================================= */


    /* =========================================================
       01. CONFIGURATION
    ========================================================= */

    const WHATSAPP_NUMBER = "917767826171";

    const WORKER_URL =
        "https://sewingartsakoli.ruralwavecommunication.workers.dev";


    /* =========================================================
       02. DOM ELEMENTS
    ========================================================= */

    const overlay =
        document.getElementById("enquiryModal");

    const form =
        document.getElementById("enquiryForm");

    const getLocationButton =
        document.getElementById("getLocation");

    const locationStatus =
        document.getElementById("gpsStatus");

    const gpsLocation =
        document.getElementById("gps");

    const submitButton =
        document.getElementById("submitEnquiry");

    const formMessage =
        document.getElementById("formMessage");

    const closeButtons =
        document.querySelectorAll("[data-close-modal]");

    const nameInput =
        document.getElementById("name");

    const ageInput =
        document.getElementById("age");

    const mobileInput =
        document.getElementById("mobile");

    const locationInput =
        document.getElementById("location");

    const pinInput =
        document.getElementById("pin");

    const serviceInput =
        document.getElementById("service");

    const messageInput =
        document.getElementById("message");

    const websiteInput =
        document.getElementById("website");


    /* =========================================================
       03. REQUIRED ELEMENT CHECK
    ========================================================= */

    if (
        !overlay ||
        !form ||
        !getLocationButton ||
        !locationStatus ||
        !gpsLocation ||
        !submitButton ||
        !formMessage ||
        !nameInput ||
        !ageInput ||
        !mobileInput ||
        !locationInput ||
        !pinInput ||
        !serviceInput ||
        !messageInput ||
        !websiteInput
    ) {
        return;
    }


    /* =========================================================
       04. ALLOWED SERVICES
    ========================================================= */

    const allowedServices = new Set([
        "Blouse Stitching",
        "Ladies Kurta Pajama",
        "Ladies Dress Stitching",
        "Girls Dress Stitching",
        "Other"
    ]);


    /* =========================================================
       05. STATE
    ========================================================= */

    let isSubmitting = false;

    let currentContactMode = "whatsapp";


    /* =========================================================
       06. TEXT CLEANING
    ========================================================= */

    function cleanSingleLine(
        value,
        maxLength
    ) {
        return String(value || "")
            .replace(/[\r\n\t]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, maxLength);
    }


    function cleanMessage(
        value,
        maxLength
    ) {
        return String(value || "")
            .replace(/\r/g, "")
            .replace(/\u0000/g, "")
            .trim()
            .slice(0, maxLength);
    }


    function isSafeText(value) {

        const text =
            String(value || "");

        return (
            !/<\s*script\b/i.test(text) &&
            !/<\s*iframe\b/i.test(text) &&
            !/<\s*object\b/i.test(text) &&
            !/<\s*embed\b/i.test(text)
        );
    }


    /* =========================================================
       07. FORM MESSAGE
    ========================================================= */

    function showMessage(
        message,
        type
    ) {

        formMessage.hidden = false;

        formMessage.textContent =
            message;

        if (type) {
            formMessage.dataset.type =
                type;
        } else {
            delete formMessage.dataset.type;
        }
    }


    function clearMessage() {

        formMessage.textContent = "";

        formMessage.hidden = true;

        delete formMessage.dataset.type;
    }


    /* =========================================================
       08. OPEN MODAL
    ========================================================= */

    function openEnquiry() {

        overlay.hidden = false;

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        clearMessage();

        window.setTimeout(() => {
            nameInput.focus();
        }, 50);
    }


    /* =========================================================
       09. RESET FORM
    ========================================================= */

    function resetFormState() {

        form.reset();

        gpsLocation.value = "";

        locationStatus.textContent =
            "Location is optional.";

        clearMessage();

        getLocationButton.disabled =
            false;

        submitButton.disabled =
            false;

        isSubmitting = false;
    }


    /* =========================================================
       10. CLOSE MODAL
    ========================================================= */

    function closeEnquiry() {

        overlay.hidden = true;

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        currentContactMode =
            "whatsapp";

        resetFormState();
    }


    /* =========================================================
       11. CONTACT BUTTONS
    ========================================================= */

    const contactButtons =
        document.querySelectorAll(
            "[data-contact-mode]"
        );


    contactButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                currentContactMode =
                    button.dataset.contactMode === "email"
                        ? "email"
                        : "whatsapp";

                openEnquiry();
            }
        );

    });


    /* =========================================================
       12. CLOSE BUTTONS
    ========================================================= */

    closeButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                closeEnquiry();
            }
        );

    });


    /* =========================================================
       13. CLICK OUTSIDE MODAL
    ========================================================= */

    overlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === overlay
            ) {
                closeEnquiry();
            }
        }
    );


    /* =========================================================
       14. ESCAPE KEY
    ========================================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !overlay.hidden
            ) {
                closeEnquiry();
            }
        }
    );


    /* =========================================================
       15. DIGITS ONLY
    ========================================================= */

    function allowDigitsOnly(
        input,
        maxLength
    ) {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value
                        .replace(/\D/g, "")
                        .slice(0, maxLength);
            }
        );
    }


    allowDigitsOnly(
        mobileInput,
        10
    );

    allowDigitsOnly(
        pinInput,
        6
    );


    /* =========================================================
       16. GPS
    ========================================================= */

    function setLocationStatus(
        message
    ) {

        locationStatus.textContent =
            message;
    }


    function isValidCoordinate(
        latitude,
        longitude
    ) {

        return (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
        );
    }


    function createGoogleMapsURL(
        latitude,
        longitude
    ) {

        return (
            "https://www.google.com/maps?q=" +
            encodeURIComponent(
                `${latitude},${longitude}`
            )
        );
    }


    function validateGPSUrl(value) {

        if (!value) {
            return false;
        }

        try {

            const url =
                new URL(value);

            if (
                url.protocol !== "https:"
            ) {
                return false;
            }

            if (
                url.hostname !== "www.google.com" &&
                url.hostname !== "google.com"
            ) {
                return false;
            }

            if (
                url.pathname !== "/maps"
            ) {
                return false;
            }

            const query =
                url.searchParams.get("q");

            if (!query) {
                return false;
            }

            const parts =
                query.split(",");

            if (
                parts.length !== 2
            ) {
                return false;
            }

            const latitude =
                Number(parts[0].trim());

            const longitude =
                Number(parts[1].trim());

            return isValidCoordinate(
                latitude,
                longitude
            );

        } catch {
            return false;
        }
    }


    getLocationButton.addEventListener(
        "click",
        () => {

            clearMessage();

            if (
                !navigator.geolocation
            ) {

                setLocationStatus(
                    "आपके browser में GPS location उपलब्ध नहीं है।"
                );

                return;
            }


            setLocationStatus(
                "📍 Location प्राप्त की जा रही है..."
            );


            getLocationButton.disabled =
                true;


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    const latitude =
                        Number(
                            position.coords.latitude
                        );

                    const longitude =
                        Number(
                            position.coords.longitude
                        );


                    if (
                        !isValidCoordinate(
                            latitude,
                            longitude
                        )
                    ) {

                        gpsLocation.value =
                            "";

                        setLocationStatus(
                            "Location data invalid है। कृपया दोबारा try करें।"
                        );

                        getLocationButton.disabled =
                            false;

                        return;
                    }


                    const mapsURL =
                        createGoogleMapsURL(
                            latitude,
                            longitude
                        );


                    if (
                        !validateGPSUrl(
                            mapsURL
                        )
                    ) {

                        gpsLocation.value =
                            "";

                        setLocationStatus(
                            "Location verification failed।"
                        );

                        getLocationButton.disabled =
                            false;

                        return;
                    }


                    gpsLocation.value =
                        mapsURL;


                    setLocationStatus(
                        "✓ Location successfully प्राप्त हो गई।"
                    );


                    getLocationButton.disabled =
                        false;
                },


                (error) => {

                    gpsLocation.value =
                        "";

                    getLocationButton.disabled =
                        false;


                    let message =
                        "Location प्राप्त नहीं हो सकी।";


                    switch (error.code) {

                        case error.PERMISSION_DENIED:

                            message =
                                "Location permission denied है।";

                            break;


                        case error.POSITION_UNAVAILABLE:

                            message =
                                "Location अभी उपलब्ध नहीं है।";

                            break;


                        case error.TIMEOUT:

                            message =
                                "Location request timeout हो गया।";

                            break;


                        default:

                            message =
                                "Location प्राप्त नहीं हो सकी।";
                    }


                    setLocationStatus(
                        message
                    );
                },


                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        }
    );


    /* =========================================================
       17. FORM VALIDATION
    ========================================================= */

    function getFormData() {

        /*
         * Honeypot:
         * Normal users must leave this field empty.
         */

        if (
            websiteInput.value.trim() !== ""
        ) {
            return null;
        }


        /*
         * Native browser validation.
         */

        if (
            !form.checkValidity()
        ) {

            form.reportValidity();

            return null;
        }


        const name =
            cleanSingleLine(
                nameInput.value,
                80
            );


        const age =
            Number(
                ageInput.value
            );


        const mobile =
            cleanSingleLine(
                mobileInput.value,
                10
            );


        const location =
            cleanSingleLine(
                locationInput.value,
                100
            );


        const pin =
            cleanSingleLine(
                pinInput.value,
                6
            );


        const service =
            cleanSingleLine(
                serviceInput.value,
                100
            );


        const message =
            cleanMessage(
                messageInput.value,
                1000
            );


        const gps =
            String(
                gpsLocation.value || ""
            ).trim();


        /* REQUIRED TEXT */

        if (
            !name ||
            !location ||
            !message
        ) {
            return null;
        }


        /* NAME */

        if (
            name.length < 2 ||
            name.length > 80 ||
            !isSafeText(name)
        ) {
            return null;
        }


        /* AGE */

        if (
            !Number.isInteger(age) ||
            age < 1 ||
            age > 120
        ) {
            return null;
        }


        /* MOBILE */

        if (
            !/^\d{10}$/.test(mobile)
        ) {
            return null;
        }


        /* PIN */

        if (
            !/^\d{6}$/.test(pin)
        ) {
            return null;
        }


        /* LOCATION */

        if (
            location.length < 2 ||
            location.length > 100 ||
            !isSafeText(location)
        ) {
            return null;
        }


        /* SERVICE */

        if (
            !allowedServices.has(
                service
            )
        ) {
            return null;
        }


        /* MESSAGE */

        if (
            message.length < 2 ||
            message.length > 1000 ||
            !isSafeText(message)
        ) {
            return null;
        }


        /* GPS */

        if (
            gps &&
            !validateGPSUrl(gps)
        ) {
            return null;
        }


        return {
            name,
            age,
            mobile,
            location,
            pin,
            service,
            message,
            gps
        };
    }


    /* =========================================================
       18. SEND TO CLOUDFLARE WORKER
    ========================================================= */

    async function sendToWorker(
        data
    ) {

        if (
            !WORKER_URL ||
            WORKER_URL.includes(
                "YOUR-WORKER-NAME"
            ) ||
            WORKER_URL.includes(
                "YOUR-SUBDOMAIN"
            )
        ) {

            throw new Error(
                "Worker URL अभी configure नहीं किया गया है।"
            );
        }


        const response =
            await fetch(
                WORKER_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name:
                            data.name,

                        age:
                            data.age,

                        mobile:
                            data.mobile,

                        location:
                            data.location,

                        pin:
                            data.pin,

                        service:
                            data.service,

                        message:
                            data.message,

                        gps:
                            data.gps,

                        website:
                            ""
                    }),

                    credentials: "omit",

                    cache: "no-store"
                }
            );


        let result = null;


        try {

            result =
                await response.json();

        } catch {

            result = null;
        }


        if (
            !response.ok
        ) {

            if (
                result &&
                typeof result.error === "string"
            ) {

                throw new Error(
                    result.error
                );
            }


            throw new Error(
                "Server request failed."
            );
        }


        return result;
    }


    /* =========================================================
       19. WHATSAPP MESSAGE
    ========================================================= */

    function buildWhatsAppMessage(
        data
    ) {

        const lines = [

            "Sewing Arts Center - Customer Enquiry",

            "",

            "Customer Details",

            `Name: ${data.name}`,

            `Age: ${data.age}`,

            `Mobile: ${data.mobile}`,

            `Village / City / Area: ${data.location}`,

            `PIN Code: ${data.pin}`,

            `Service: ${data.service}`,

            "",

            "Requirement / Query:",

            data.message
        ];


        if (data.gps) {

            lines.push(
                "",
                "Customer GPS Location:",
                data.gps
            );
        }


        lines.push(
            "",
            "This enquiry was submitted through the Sewing Arts Center website."
        );


        return lines.join(
            "\n"
        );
    }


    /* =========================================================
       20. OPEN WHATSAPP
    ========================================================= */

    function openWhatsApp(
        data
    ) {

        const message =
            buildWhatsAppMessage(
                data
            );


        const whatsappURL =
            "https://wa.me/" +
            WHATSAPP_NUMBER +
            "?text=" +
            encodeURIComponent(
                message
            );


        const newWindow =
            window.open(
                whatsappURL,
                "_blank",
                "noopener,noreferrer"
            );


        if (!newWindow) {

            window.location.href =
                whatsappURL;

            return;
        }


        closeEnquiry();
    }


    /* =========================================================
       21. FORM SUBMIT
    ========================================================= */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (
                isSubmitting
            ) {
                return;
            }


            const data =
                getFormData();


            if (!data) {

                showMessage(
                    "कृपया सभी required details सही तरीके से भरें।",
                    "error"
                );

                return;
            }


            isSubmitting =
                true;

            submitButton.disabled =
                true;


            showMessage(
                "कृपया प्रतीक्षा करें... आपकी enquiry submit की जा रही है।",
                "success"
            );


            try {

                await sendToWorker(
                    data
                );


                showMessage(
                    "✓ आपकी enquiry successfully submit हो गई है। हम जल्द आपसे संपर्क करेंगे।",
                    "success"
                );


                /*
                 * WhatsApp mode:
                 * Open WhatsApp after Worker succeeds.
                 */

                if (
                    currentContactMode ===
                    "whatsapp"
                ) {

                    window.setTimeout(
                        () => {

                            openWhatsApp(
                                data
                            );

                        },
                        700
                    );

                    return;
                }


                /*
                 * Email mode:
                 * Worker + Resend already sent the email.
                 *
                 * No mailto.
                 * No email address exposed.
                 * No WhatsApp.
                 */

                submitButton.disabled =
                    false;

                isSubmitting =
                    false;

            } catch (error) {

                showMessage(
                    "Enquiry submit नहीं हो सकी। कृपया कुछ देर बाद दोबारा प्रयास करें या WhatsApp से संपर्क करें।",
                    "error"
                );


                /*
                 * Keep entered form data.
                 */

                console.error(
                    "Enquiry submission error:",
                    error
                );


                submitButton.disabled =
                    false;

                isSubmitting =
                    false;
            }

        }
    );


    /* =========================================================
       22. INITIAL STATE
    ========================================================= */

    overlay.hidden = true;

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    clearMessage();

})();