import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { UserService } from '../services/user.service';
import { GlobalConstants } from '../shared/global-constants';
import { strongPasswordValidator } from '../signup/customValidator.component';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  password = true;
  confirmPassword = true;
  signupForm!: FormGroup;
  responseMessage: any;
  otpVisible: boolean = false;

  remainingTime: number = 60;
  timerActive: boolean = false;
  otp: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackbarService: SnackbarService,
    public dialogRef: MatDialogRef<SignupComponent>,
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    // Initialize the form
    this.signupForm = this.formBuilder.group({
      otp: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
    this.signupForm = this.formBuilder.group({
      name: [
        null,
        [Validators.required, Validators.pattern(GlobalConstants.nameRegex)],
      ],
      email: [
        null,
        [Validators.required, Validators.pattern(GlobalConstants.emailegex)],
      ],
      contactNumber: [
        null,
        [
          Validators.required,
          Validators.pattern(GlobalConstants.contactNumberRegex),
        ],
      ],
      password: [
        null,
        [
          Validators.required,
          Validators.pattern(GlobalConstants.passwordregex),
          strongPasswordValidator(), // Assign the custom validator here
        ],
      ],
      otp: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      confirmPassword: [null, [Validators.required]],
    });
  }

  // Toggle visibility of OTP field
  toggleOtpVisibility() {
    this.otpVisible = !this.otpVisible;
  }

  // Ensure that the password and confirmPassword matches
  validateSubmit() {
    if (
      this.signupForm.controls['password'].value !=
        this.signupForm.controls['confirmPassword'].value &&
      this.signupForm.controls['otp'].value == ''
    ) {
      return true;
    } else {
      return false;
    }
  }

  handleSubmit() {
    this.ngxService.start();
    const formData = this.signupForm.value;
    const data = {
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      password: formData.password,
    };

    if (!this.otpVisible) {
     

      // If OTP is not visible, send the pre-OTP
      this.preOtpSend(data);
      this.startTimer();
    } else {
      // If OTP is visible, proceed with the signup
      this.signUpWithOtp(data);
    }
  }
  startTimer() {
    this.otpVisible = false;
    if (!this.otpVisible) {
      this.timerActive = true;
      this.remainingTime = 60;

      const timerInterval = setInterval(() => {
        this.remainingTime--;

        if (this.remainingTime == 0) {
          clearInterval(timerInterval);
          this.signupForm.get('otp')?.setValue(null);
        }
      }, 1000);
    }
  }

  resendOTP() {
    this.ngxService.start();
    const formData = this.signupForm.value;
    const data = {  
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      password: formData.password,
    };
    this.otp = null;
    this.preOtpSend(data);
  }

  preOtpSend(data: any) {
    const email = this.signupForm.controls.email.value;
    this.userService.getOtp(email).subscribe(
      (response: any) => {
        this.otp = response.message;
        this.ngxService.stop();
        this.otpVisible = true;
      },
      (error: any) => {
        this.ngxService.stop();
        console.error('Error occurred while sending pre-OTP:', error);
        this.snackbarService.openSnackBar(
          'Error occurred while sending OTP',
          GlobalConstants.error
        );
      }
    );
  }

  signUpWithOtp(data: any) {

    const enteredOtp = this.signupForm.controls.otp.value;
      if (this.remainingTime > 0 && this.otp == enteredOtp) {
        const formData = this.signupForm.value;
        const data = {
          name: formData.name,
          email: formData.email,
          contactNumber: formData.contactNumber,
          password: formData.password,
          otp: formData.otp,
        };

        this.userService.signup(data).subscribe(
          (response: any) => {
            this.ngxService.stop();
            this.dialogRef.close();
            this.responseMessage = response?.message;
            this.snackbarService.openSnackBar(this.responseMessage, '');
  
            
          },
          (error: any) => {
            this.ngxService.stop();
            if (error.error?.message) {
              this.responseMessage = error.error?.message;
            } else {
              this.responseMessage = GlobalConstants.genericError;
            }
            this.snackbarService.openSnackBar(
              this.responseMessage,
              GlobalConstants.error
            );
          }
        );
      } else {
        this.ngxService.stop();
        this.snackbarService.openSnackBar(
          GlobalConstants.invalidOTP,
          GlobalConstants.error
        );
      }
  }
 
}

