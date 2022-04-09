(function(){
    'use strict'

    //fetch all the forms that we need to apply custom bootstrap validation styles to...
    const forms = document.querySelectorAll('.validated-form');

    //loop over the above forms and prevent submission if validation fails
    Array.from(forms) //convert forms into an array
        .forEach(function(form){
            form.addEventListener("submit", function(event){
                if(!form.checkValidity()){
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add("was-validated")
            }, false)
        })
})()


//this one line JS code will run bs-custom-file-input (which is imported thru CDN in boilerplate ejs file)
bsCustomFileInput.init();
