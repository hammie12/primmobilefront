"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mail_1 = __importDefault(require("@sendgrid/mail"));
// Configure SendGrid
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
function testWelcomeEmail() {
    return __awaiter(this, void 0, void 0, function () {
        var msg, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    msg = {
                        to: 'hamedbakayoko048@gmail.com',
                        from: process.env.SENDGRID_FROM_EMAIL,
                        templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID,
                        dynamicTemplateData: {
                            first_name: 'Hamed',
                            app_url: 'https://prim.app'
                        },
                    };
                    return [4 /*yield*/, mail_1.default.send(msg)];
                case 1:
                    response = _a.sent();
                    console.log('Welcome email sent successfully:', response);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error sending welcome email:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function testVerificationEmail() {
    return __awaiter(this, void 0, void 0, function () {
        var msg, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    msg = {
                        to: 'hamedbakayoko048@gmail.com',
                        from: process.env.SENDGRID_FROM_EMAIL,
                        templateId: process.env.SENDGRID_VERIFICATION_TEMPLATE_ID,
                        dynamicTemplateData: {
                            first_name: 'Hamed',
                            verification_code: '123456'
                        },
                    };
                    return [4 /*yield*/, mail_1.default.send(msg)];
                case 1:
                    response = _a.sent();
                    console.log('Verification email sent successfully:', response);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error sending verification email:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function testPasswordResetEmail() {
    return __awaiter(this, void 0, void 0, function () {
        var msg, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    msg = {
                        to: 'hamedbakayoko048@gmail.com',
                        from: process.env.SENDGRID_FROM_EMAIL,
                        templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
                        dynamicTemplateData: {
                            first_name: 'Hamed',
                            reset_code: '789012'
                        },
                    };
                    return [4 /*yield*/, mail_1.default.send(msg)];
                case 1:
                    response = _a.sent();
                    console.log('Password reset email sent successfully:', response);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error sending password reset email:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Test all emails
function testAllEmails() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting email tests...');
                    console.log('\nTesting Welcome Email:');
                    return [4 /*yield*/, testWelcomeEmail()];
                case 1:
                    _a.sent();
                    // Wait 2 seconds between sends to avoid rate limiting
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 2:
                    // Wait 2 seconds between sends to avoid rate limiting
                    _a.sent();
                    console.log('\nTesting Verification Email:');
                    return [4 /*yield*/, testVerificationEmail()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 4:
                    _a.sent();
                    console.log('\nTesting Password Reset Email:');
                    return [4 /*yield*/, testPasswordResetEmail()];
                case 5:
                    _a.sent();
                    console.log('\nAll email tests completed!');
                    return [2 /*return*/];
            }
        });
    });
}
// Run the tests
testAllEmails();
