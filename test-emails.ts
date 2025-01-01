import sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function testWelcomeEmail() {
    try {
        const msg = {
            to: 'hamedbakayoko048@gmail.com',
            from: process.env.SENDGRID_FROM_EMAIL!,
            templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID,
            dynamicTemplateData: {
                first_name: 'Hamed',
                app_url: 'https://prim.app'
            },
        };
        
        const response = await sgMail.send(msg);
        console.log('Welcome email sent successfully:', response);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}

async function testVerificationEmail() {
    try {
        const msg = {
            to: 'hamedbakayoko048@gmail.com',
            from: process.env.SENDGRID_FROM_EMAIL!,
            templateId: process.env.SENDGRID_VERIFICATION_TEMPLATE_ID,
            dynamicTemplateData: {
                first_name: 'Hamed',
                verification_code: '123456'
            },
        };
        
        const response = await sgMail.send(msg);
        console.log('Verification email sent successfully:', response);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}

async function testPasswordResetEmail() {
    try {
        const msg = {
            to: 'hamedbakayoko048@gmail.com',
            from: process.env.SENDGRID_FROM_EMAIL!,
            templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
            dynamicTemplateData: {
                first_name: 'Hamed',
                reset_code: '789012'
            },
        };
        
        const response = await sgMail.send(msg);
        console.log('Password reset email sent successfully:', response);
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
}

// Test all emails
async function testAllEmails() {
    console.log('Starting email tests...');
    
    console.log('\nTesting Welcome Email:');
    await testWelcomeEmail();
    
    // Wait 2 seconds between sends to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\nTesting Verification Email:');
    await testVerificationEmail();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\nTesting Password Reset Email:');
    await testPasswordResetEmail();
    
    console.log('\nAll email tests completed!');
}

// Run the tests
testAllEmails(); 