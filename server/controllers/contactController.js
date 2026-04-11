const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // 1. Save to Database
        const newContact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        // 2. Send Email Notification (Separate try-catch so it doesn't block DB save success)
        if (process.env.SMTP_EMAIL && process.env.SMTP_EMAIL !== 'your-email@gmail.com' && process.env.SMTP_PASSWORD) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.SMTP_EMAIL,
                        pass: process.env.SMTP_PASSWORD
                    }
                });

                const mailOptions = {
                    from: process.env.SMTP_EMAIL,
                    to: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
                    subject: `New Contact Request: ${subject || 'Help Needed'}`,
                    html: `
                        <h3>New Contact Message Received</h3>
                        <p><strong>From:</strong> ${name || 'N/A'} (${email})</p>
                        <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
                        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
                            <p>${message}</p>
                        </div>
                        <p><em>Saved in database ID: ${newContact._id}</em></p>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Email sent for contact request ${newContact._id}`);
            } catch (emailError) {
                console.error('Email sending failed, but contact was saved:', emailError.message);
            }
        } else {
            console.warn('SMTP credentials not configured or using placeholders. Email NOT sent.');
        }

        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete a contact message (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        await contact.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
