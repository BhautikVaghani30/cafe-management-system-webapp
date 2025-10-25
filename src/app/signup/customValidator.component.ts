import { AbstractControl, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value;

    const minLengthRegex = /.{8,}/;
    const letterRegex = /[a-zA-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    
    const hasMinLength = minLengthRegex.test(value);
    const hasLetter = letterRegex.test(value);
    const hasNumber = numberRegex.test(value);
    const hasSpecialChar = specialCharRegex.test(value);

    // Return validation errors if any requirement is not met
    return !hasMinLength || !hasLetter || !hasNumber || !hasSpecialChar
      ? { strongPassword: true }
      : null;
  };
}