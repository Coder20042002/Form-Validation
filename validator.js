//Đối tượng Validator
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            } else {
                element = element.parentElement
            }
        }
    }

    var selectorRules = {}

    //Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        var errMessage

        //Lấy ra các rules của selector 
        var rules = selectorRules[rule.selector]


        //Lặp qua từng rule và kiểm tra
        for (var i = 0; i < rules.length; i++) {
            errMessage = rules[i](inputElement.value)
            switch (inputElement.type) {
                case 'radio':
                    errMessage = rules[i](
                        formEmlement.querySelector(rule.selector + ':checked')
                    )
                    break
                case 'checkbox':
                    if(!input.matches(':checked')) {
                        values[input.name]=''
                        return value
                    }

                    if(!Array.isArray(values[input.name])) {
                        values[input.name]=[]
                    }

                    values[input.name].push(input.value)
                    break
                case 'file':
                    values[input.name]=input.file
                    break    
                    
                default:
                    errMessage = rules[i](inputElement.value)

            }
            //Nếu có lỗi thì dừng 
            if (errMessage) break;
        }

        if (errMessage) {
            errElement.innerText = errMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
        return !errMessage
    }




    //Lấy element của form cần validate
    var formEmlement = document.querySelector(options.form)
    if (formEmlement) {

        //Khi sunmit form
        formEmlement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true

            //Thực hiện lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElements = document.querySelectorAll(rule.selector)
                var isValid = validate(inputElement, rule)

                if (!isValid) {
                    isFormValid = false
                }
            })



            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formEmlement.querySelectorAll('[name]:not([disabled])')

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                values[input.name]=formEmlement.querySelector('input[name"'+input.name+'"]:checked').value
                                break
                            default:
                                values=[input.name]=input.value
                        }
                        values[input.name] = input.value
                        return values
                    }, {})

                    options.onSubmit(formValues)
                }
            } else {
                formEmlement.submit()
            }

        }

        //Lặp qua mổi rule và xử lý (lắng  nghe sự kiện blur ,input)
        options.rules.forEach(function (rule) {


            //Lưu lại các rule cho mỏi input
            selectorRules[rule.selector] = rule.test

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {

                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = document.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function (inputElement) {
                //Xủ lý trường hợp blur ra ngoài
                if (inputElement) {
                    inputElement.onblur = function () {
                        validate(inputElement, rule)
                    }
                }

                //Xử lý mỗi khi ng dùng nhập vào input
                inputElement.oninput = function () {
                    validate(inputElement, rule)

                }
            })

        })
    }
}

//Định nghĩa các rule
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value,) {
            return value.trim() ? undefined : message || 'Vui long nhập lại'
        }

    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là Email'
        }

    }
}

Validator.isPassword = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }

    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}