export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        const config = {
            'required': 'Обязательное поле.',
            'invalidNumber' : 'Только цифры',
            'invalidCreditCard': 'Недопустимый номер кредитной карты.',
            'invalidEmailAddress': 'Неверный адрес электронной почты.',
            'invalidPhoneValidator' : 'Номер телефона в формате 7xxxxxxxxxx.',
            'invalidPassword': 'Неверный пароль. Пароль должен содержать не менее 8 символов и содержать цифры.',
            'minlength': validatorValue ? `Минимальная длина ${validatorValue.requiredLength}.` : 'Недостаточно символов.'
        };

        if (validatorName === 'minLength') {
            validatorName = 'minlength';
        }

        return config[validatorName];
    }

    static creditCardValidator(control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
            return null;
        } else {
            return { 'invalidCreditCard': true };
        }
    }

    static emailValidator(control) {
        // RFC 2822 compliant regex
        if (control.value.match(/[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])/)) {
            return null;
        } else {
            return { 'invalidEmailAddress': true };
        }
    }

    static passwordValidator(control) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        // if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,100}$/)) {
        if (control.value.match(/^(?=.*[0-9]).{8,100}$/)) {
            return null;
        } else {
            return { 'invalidPassword': true };
        }
    }

    static numberValidator(control) {
        if (control.value.match(/^\d+$/)) {
            return null;
        } else {
            return { 'invalidNumber': true };
        }
    }


    static phoneValidator(control) {
        // +79261234567
        // 89261234567
        // 79261234567
        // +7 926 123 45 67
        // 8(926)123-45-67
        // 123-45-67
        // 9261234567
        // 79261234567
        // (495)1234567
        // (495) 123 45 67
        // 89261234567
        // 8-926-123-45-67
        // 8 927 1234 234
        // 8 927 12 12 888
        // 8 927 12 555 12
        // 8 927 123 8 123
        if (control.value.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/)) {
            return null;
        } else {
            return { 'invalidPhoneValidator': true };
        }
    }
}
