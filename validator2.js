function Validator(formSelector,options) {

    //Gán giá trị mặc định cho tham số ES5
    if(!options) {
        options = {};
    }

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            } else {
                element = element.parentElement
            }
        }
    }

    var formRules = {};

    /**
     * Quy ước tạo rule :
     * -Nếu có lổi thì return 'error message'
    **/
    var validatorRule = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui long nhập ít nhất ${min} kí tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui long nhập tối đa ${min} kí tự`
            }
        }
    }

    //Lấy ra form element trong DOM theo `formSelector`
    var formEmlement = document.querySelector(formSelector);

    //Chỉ xử lý khi có element trong DOM
    if (formEmlement) {

        var inputs = formEmlement.querySelectorAll('[name] [rules]');
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {

                var isRuleHasValue = rule.includes(':')
                var ruleInfo

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRule[rule]

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = ruleFunc
                }
            }
            //Lắng nghe sự kiện để validate (blur,change,...)

            input.onblur = handleValidate;
            input.oninput = handleClearError;

        }

        //Hàm thực hiện validate
        function handleValidate(event) {
            var rules =formRules[event.target.name]
            var errMessage;

            rule.find(function(rule) {
                errMessage=rule(event.target.value);
                return errMessage;
            })

            //Nếu có lỗi thì hiện thi message ra UI
            if(errMessage) {
                var formGroup = getParent(event.target,'.form-group' )
                if(formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage =formGroup.querySelector('.form-message')
                    if(formMessage) {
                        formMessage.innerText = errMessage;
                    }
                }
            }
            return !errMessage;
        }

        //Hàm clear message
        function handleClearError(event) {
            var formGroup = getParent(event.target,'.form-group' )
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage =formGroup.querySelector('.form-message')
                if(formMessage) {
                    formMessage.innerText = '';
                }

            }
        }
        
    }

    //Xử lí hành vi submit form
    formEmlement.onSubmit=function(event) {
        event.preventDefault();

        var inputs = formEmlement.querySelectorAll('[name] [rules]');
        var isValid =true;

        for(var input of inputs) {
            if(!handleValidate({ target :input })) {
                isValid =false
            }
        }

        //Khi không có lỗi thì submit form
        if (isValid) {
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
}