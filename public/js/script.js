// Enable Bootstrap validation feedback for forms that need it
(function () {
  'use strict';

  // Find every form that should use custom validation styling
  var forms = document.querySelectorAll('.needs-validation');

  // Prevent submission when the form fields are invalid and show validation feedback
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      'submit',
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      },
      false
    );
  });
})();