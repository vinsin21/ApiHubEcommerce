const Mailgen = require('mailgen')
const nodemailer = require('nodemailer')




const sendMail = (options) => {

    // creting mail template 
    const mailGenerator = new Mailgen({
        theme: 'salted',
        product: {
            // Appears in header & footer of e-mails
            name: 'MyWebiste name',
            link: 'https://MyWebsiteLink.com/'
            // Optional product logo
            // logo: 'https://mailgen.js/img/logo.png'
        }
    });

    // Generate an HTML email with the provided contents
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = mailGenerator.generatePlaintext(mailgenContent);
    // Optionally, preview the generated HTML e-mail by writing it to a local file
    //require('fs').writeFileSync('preview.html', emailBody, 'utf8');

}

const emailVerificationMailgenContent = (username, verificationLink) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to Website Name! We\'re very excited to have you on board.',
            action: {
                instructions: 'To verify you account, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Confirm your account',
                    link: verificationLink,
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

}


module.exports = {
    sendMail,
    emailVerificationMailgenContent,
}