import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from 'src/app/interface/auth.model';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { IonContent, IonTitle, IonRow, IonCol, IonButtons, IonButton, IonIcon, IonCardContent, IonList, IonChip, IonLabel, IonInput, IonAlert, IonImg,  } from '@ionic/angular/standalone';
import { ToastComponent } from '../toast/toast.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports:[
    IonContent, IonTitle, IonRow, IonCol, IonButtons, IonButton, IonIcon, IonCardContent, IonList, IonChip, IonLabel, IonInput, IonAlert, IonImg, ToastComponent, ReactiveFormsModule, CommonModule
]
})
export class LoginComponent  implements OnInit {

// Global variables
mail = false;
hide = true;
loading = signal<boolean>(false)
logForm!: FormGroup;
alertButtons!: any;
alertInputs!: any[];
toastType: string =''
toastTitle: string = ''; 
toastMessage: string = '';
showToast: boolean = false;

constructor(private authService:AuthService, private router:Router, private alertController: AlertController,
  private toastController: ToastController,) {

 }

 ngOnInit() {
  this.initializeForm();
  this.alertButtons = [
    { text: 'Cancel' },
    {
      text: 'Reset',
      handler: (data: any) => {
        this.resetPassword(data.email);
      }
    },
  ];
  
  // Alert input configuration for password reset
  this.alertInputs = [
    { name: 'email', placeholder: 'Email Address', type: 'email' },
  ];
}  

initializeForm(){
  // Initialize login form
  this.logForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
}

// Toggle between email and username login modes
changeLogintype() {
  this.mail = !this.mail;
  const usernameControl = this.logForm.get('username');
  if (this.mail) {
    usernameControl?.setValidators([Validators.required, Validators.email]);
  } else {
    usernameControl?.setValidators([Validators.required]);
  }
  usernameControl?.updateValueAndValidity();
}

// Login Function
async login(form: FormGroup){
  this.loading.set(true);
  if (form.valid) {
    const payload: LoginRequest = this.logForm.value;
    try {
      const result = await this.authService.login(payload).toPromise();
  
      if (result) {
        form.reset()
        // console.log('Login successful:', result);
        this.presentToast(`Welcome back ${payload.username}`, '', 'top')
      } else {
        // console.error('Login result is undefined');
        this.handleAuthError({ status: 401, error: { detail: 'Unknown error'}});
        this.loading.set(false);
      }
    } catch (error) {
      // console.error('Login error:', error);
      this.handleAuthError(error);
      this.loading.set(false);
    }
  }
}

// Displays an alert message
async presentAlert(msg: string) {
  const alert = await this.alertController.create({
    header: 'Notification',
    message: msg,
    buttons: ['OK'],
    mode: 'ios',
  });
  await alert.present();
}

// Displays a toast message
private async presentToast(message: string, color: string, position: any) {
  const toast = await this.toastController.create({
    message,
    duration: 2000,
    color ,
    position ,
    buttons: [
      { icon: 'trash-bin', role: 'cancel' }
    ]  
  });
  await toast.present();
} 

// Handles authentication-related errors and shows a toast message for FastAPI
handleAuthError(error: any) {
  let errorMessage = 'An error occurred. Please try again.';

  if (error.status === 401) {
    errorMessage = 'Invalid credentials. Please check your username and password.';
  } else if (error.status === 404) {
    errorMessage = 'User not found. Please check your username or email.';
  } else if (error.status === 422) {
    // FastAPI often returns 'detail' as an array of error objects
    if (Array.isArray(error.error?.detail)) {
      const details = error.error.detail.map((d: any) => d.msg).join(', ');
      errorMessage = `Validation error: ${details}`;
    } else {
      errorMessage = 'There was an error with the form submission. Please review your entries.';
    }
  } else if (error.status === 403) {
    errorMessage = 'You do not have permission to perform this action.';
  }

  // Correct parameter order for showToastMessage
  this.showToastMessage('warning', 'Authentication Error', errorMessage);
}

showToastMessage(type: 'success' | 'error' | 'warning', title: string, message: string) {
  this.toastType = type;
  this.toastTitle = title;
  this.toastMessage = message;
  this.showToast = true;

  // Hide toast after 3 seconds
  setTimeout(() => {
    this.showToast = false;
  }, 5000);
}
// Password reset function
async resetPassword(email: string) {
  try {
    // this.authService.resetPassword(email);
    this.presentAlert(`Password reset email sent to ${email}`);
  } catch (error) {
    this.handleAuthError(error);
  }
}

togglePasswordVisibility() {
  this.hide = !this.hide;
}

signUp() {
  this.router.navigate(['/home']).then(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  });
}

}
