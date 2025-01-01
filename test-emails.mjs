import sgMail from '@sendgrid/mail';

// Replace the direct API key with an environment variable
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// Configure SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

const FROM_EMAIL = 'hamedbakayoko048@gmail.com';
const TO_EMAIL = 'hamedbakayoko048@gmail.com';

async function testWelcomeEmail() {
    try {
        const msg = {
            to: TO_EMAIL,
            from: FROM_EMAIL,
            templateId: 'd-05d0435f4ea04d089f83343ad2c3dbd7',
            dynamicTemplateData: {
                first_name: 'Hamed',
                app_url: 'https://prim.app'
            },
        };
        
        await sgMail.send(msg);
        console.log('Welcome email sent successfully!');
    } catch (error) {
        console.error('Error sending welcome email:', error.response?.body || error);
    }
}

async function testVerificationEmail() {
    try {
        const msg = {
            to: TO_EMAIL,
            from: FROM_EMAIL,
            templateId: 'd-37b9f81725414b4abd7eb497467fdf91',
            dynamicTemplateData: {
                first_name: 'Hamed',
                verification_code: '123456'
            },
        };
        
        await sgMail.send(msg);
        console.log('Verification email sent successfully!');
    } catch (error) {
        console.error('Error sending verification email:', error.response?.body || error);
    }
}

async function testPasswordResetEmail() {
    try {
        const msg = {
            to: TO_EMAIL,
            from: FROM_EMAIL,
            templateId: 'd-b8598cdc65694981aa5aaf13127ddf4d',
            dynamicTemplateData: {
                first_name: 'Hamed',
                reset_code: '789012'
            },
        };
        
        await sgMail.send(msg);
        console.log('Password reset email sent successfully!');
    } catch (error) {
        console.error('Error sending password reset email:', error.response?.body || error);
    }
}

console.log('Starting email tests...');

// Run tests sequentially
await testWelcomeEmail();
console.log('\nWaiting 2 seconds...');
await new Promise(resolve => setTimeout(resolve, 2000));

await testVerificationEmail();
console.log('\nWaiting 2 seconds...');
await new Promise(resolve => setTimeout(resolve, 2000));

await testPasswordResetEmail();
console.log('\nAll email tests completed!'); 