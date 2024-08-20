import nodemailer from 'nodemailer'; // Assuming you're using nodemailer for sending emails

const sendMail = async (req, res) => {
    try {
        // Access form fields
        const invoiceDataString = req.body.invoiceData;
        if (!invoiceDataString) {
            return res.status(400).json({ error: 'Missing invoice data' });
        };

        // Parse the JSON string
        let invoiceData;
        try {
            invoiceData = JSON.parse(invoiceDataString);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON format' });
        };

        // Access file data
        const file = req.files['pdfFile'] ? req.files['pdfFile'][0] : null; // Get the file from the 'pdfFile' field

        if (file) {
            console.log("Received file:", file.originalname);
            // file.buffer contains the file data
        } else {
            console.log("No file received");
        };

        // Log the extracted invoice data
        console.log("Invoice Data from body:", invoiceData);

        // Example: Send email using nodemailer (assuming you have set up nodemailer)
        let transporter = nodemailer.createTransport({
            service: 'gmail', // or another email service provider
            auth: {
                user: "arunmhere98@gmail.com",
                pass: "cffp atvm dqvf lbus"
            }
        });

        let mailOptions = {
            from: "arunmhere98@gmail.com",
            to: 'arunmhere62@gmail.com',
            subject: 'Invoice Data',
            text: 'Here is the invoice data',
            attachments: file ? [{
                filename: file.originalname,
                content: file.buffer,
                encoding: 'base64'
            }] : []
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { sendMail };
