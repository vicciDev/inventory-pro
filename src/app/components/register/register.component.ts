import { Component, OnInit } from '@angular/core';
import { ToastComponent } from '../toast/toast.component';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonicModule, LoadingController, AlertController, ToastController, NavController  } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { ValidationService } from 'src/app/services/validation.service';
import { IonContent, IonTitle, IonRow, IonCol, IonButtons, IonButton, IonIcon, IonCardHeader, IonCardSubtitle, IonCardContent, IonList, IonItem, IonChip, IonLabel, IonPopover, IonSelectOption, IonInput } from '@ionic/angular/standalone';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],  
  imports: [CommonModule, ReactiveFormsModule, ToastComponent, IonContent, IonTitle, IonContent, IonRow, IonCol, IonButtons, IonButton, IonIcon, IonCardHeader, IonCardSubtitle, IonCardContent, IonList, IonItem, IonChip, IonLabel, IonPopover, IonSelectOption, IonInput]
})
export class RegisterComponent  implements OnInit {
  currentStep: number = 1;
  company_id:any
  selectedPlan:any
  hide = true;
  showToast: boolean = false;
  isPopoverOpen: boolean = false;
  form!: FormGroup;
  compForm!: FormGroup;
  OwnerForm!: FormGroup;
  subscriptionForm!:FormGroup
  toastType: string =''
  toastTitle: string = ''; 
  toastMessage: string = '';
  
  constructor(private navCtrl: NavController,private authService:AuthService, private loadingController: LoadingController,private fb: FormBuilder, private alertController: AlertController, private toastController: ToastController, private router: Router,private route: ActivatedRoute, private subscription: SubscriptionService, public validationService: ValidationService, private coProfile:ProfileService) { }

  plans = [
    {
      id: 1,
      name: 'Free',
      type: 'Free',
      access: 'For small businesses and startups',
      yearlyPrice: 0,
      monthlyPrice: 0,
      features: ['1-2 locations', '100 SKUs', 'Basic reporting', 'Community support']
    },
    {
      id: 2,
      name: 'Standard',
      type: 'Standard',
      access: 'For small to medium businesses',
      yearlyPrice: 49,
      monthlyPrice: 5,
      features: ['Up to 5 locations', '1,000 SKUs', 'Barcode scanning', 'Standard reporting', 'Email support']
    },
    {
      id: 3,
      name: 'Professional',
      type: 'Professional',
      access: 'For growing businesses',
      yearlyPrice: 199,
      monthlyPrice: 19,
      features: ['Unlimited SKUs & locations', 'Advanced analytics', 'E-commerce integrations', 'Workflow automation', 'Chat support']
    },
    {
      id: 4,
      name: 'Business',
      type: 'Business',
      access: 'For teams and larger operations',
      yearlyPrice: 499,
      monthlyPrice: 49,
      features: ['Multi-team support', 'Custom workflows', 'Collaboration tools', 'Priority support']
    },
    {
      id: 5,
      name: 'Enterprise',
      type: 'Enterprise',
      access: 'For large-scale organizations',
      yearlyPrice: 'Custom',
      monthlyPrice: 'Custom',
      features: ['ERP integrations', 'AI-driven demand planning', '24/7 dedicated support', 'SLA-backed uptime']
    }
  ];

  ngOnInit() {
    this.initForms()
    this.route.queryParams.subscribe(params => {
      const planId = +params['planId'];
      if (!planId) {
        this.goBack()
        return;
      }
      this.selectedPlan = this.plans.find(plan => plan.id === planId);

      if (!this.selectedPlan) {
        this.goBack();
      }
    });
  }
  
  initForms(){
    // Initialize the company form (Step 1)
    this.form = this.fb.group({
      companyName: ['', [Validators.required, Validators.maxLength(50)]], 
      phone: ['', [Validators.required,  Validators.pattern(/^\+?\d{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  
    this.OwnerForm = new FormGroup({
      fullName: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      tel_no: new FormControl('', [Validators.required,  Validators.pattern(/^\+?\d{10,15}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), this.matchValidator('password')]),
      role: new FormControl('user', [Validators.required]) ,
      avatar: new FormControl('',[]),
    });

    this.subscriptionForm = new FormGroup({
      transaction_code: new FormControl('', [Validators.required,  Validators.minLength(8),  Validators.maxLength(10)])
    })
  }

  async registerCompany(form: FormGroup) {
    if (form.invalid) {
      this.showToastMessage('error', 'Registration Failed', 'Please fill all required fields.');
      return;
    }

    const payload = {
      name: form.value.companyName,
      phone: form.value.phone,
      email: form.value.email,
    };

    const loading = await this.createLoading();
    await loading.present();

    this.authService.createCo(payload).subscribe({
      next: async (response) => {
        await loading.dismiss();

        if (response && response.id) {
          this.company_id = response.id;
          this.subscribe(); // call your subscription method
        } else {
          this.showToastMessage('error', 'Registration Error', 'Registration failed. Please try again.');
        }
      },
      error: async (error) => {
        await loading.dismiss();

        if (error.status === 400) {
          this.showToastMessage('warning', 'Company Registration Error', error.message);
        } else {
          this.showToastMessage('warning', 'Company Registration Error', error.message || 'Unexpected error occurred.');
        }
      }
    });
  }

  async registerUserWithRole(form: FormGroup, role: string) {
    if (form.invalid) {
      this.showToastMessage('warning', 'Invalid Input', 'Please fill all required fields.');
      return;
    }

    const payload = {
      ...form.value,
      company_id: this.company_id,
      role: role,
    };

    const loading = await this.createLoading();
    await loading.present();

    this.authService.register(payload).subscribe({
      next: async (response) => {
        await loading.dismiss();

        if (response) {
          this.resetForm(form);

          this.presentToast(
            `User registered successfully!`,
            'success',
            'top'
          );

          this.router.navigate(['/home/login']);
        } else {
          this.showToastMessage('warning', 'Registration Failed', 'Please try again.');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.showToastMessage('error', 'Registration Error', error.message || 'An unexpected error occurred.');
      }
    });
  }

  async subscribe() {
    if (!this.company_id) {
      this.showToastMessage('error', 'Subscription Error', 'Company ID is missing. Please register first.');
      return;
    }

    if (!this.selectedPlan || !this.selectedPlan.id) {
      this.showToastMessage('error', 'Subscription Error', 'Please select a valid subscription plan.');
      return;
    }

    const payload = {
      company_id: this.company_id,
      tier_id: this.selectedPlan.id,
    };

    const loading = await this.createLoading();
    await loading.present();

    this.subscription.subscribe(payload).subscribe({
      next: async (response) => {
        await loading.dismiss(); 

        if (response && response.tier_id) {
          this.showToastMessage('success', 'Successful Registration & Subscription', 'Company registered successfully!');
          this.currentStep++;
        } else {
          this.showToastMessage('error', 'Subscription Error', 'Subscription failed. Please try again.');
        }
      },
      error: async (error) => {
        await loading.dismiss(); 
        this.showToastMessage('error', 'Subscription Error', error.message || 'An unexpected error occurred.');
      }
    });
  }

  async deleteCo(){
    if (!this.company_id) {
      console.warn('No company ID found. Skipping deletion.');
      this.goBack()
      return;
    }
    this.coProfile.deleteCo(this.company_id).subscribe({
      next: () => {
        this.form.reset();
        this.showToastMessage('', 'Company Deleted', 'The company has been removed due to subscription failure.');
        this.company_id = null;
      },
      error: (err) => {
        console.error('Error deleting company:', err);
      }
    })
  }
  
  // form Wizrd
  async nextStep() {
    if (this.currentStep === 1) {
      if (this.form.valid) {
        await this.registerCompany(this.form); // Wait for API response
        this.form.reset
      } else {
        alert('Please fill all required fields.');
      }
    } else if (this.currentStep === 2) {
      if (this.OwnerForm.valid) {
        // Register the owner
        await this.registerUserWithRole(this.OwnerForm, 'admin'); this.OwnerForm.reset
      } else {
        alert('Please fill all required fields.');
      }
    } else if (this.currentStep === 3) {
      if (this.OwnerForm.valid) {
        // Register the user with the selected role
        await this.registerUserWithRole(this.OwnerForm, this.OwnerForm.get('role')?.value); 
        this.OwnerForm.reset()
      }else {
        alert('Please fill all required fields.');
      }
    }
  }  
  
  previousStep() {
    if (this.currentStep > 1) this.currentStep--;
  }
 
  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return (this.form.get('companyName')?.valid ?? false) && 
               (this.form.get('location')?.valid ?? false) &&
               (this.form.get('email')?.valid ?? false) &&
               (this.form.get('phone')?.valid ?? false);
        case 2:
          return (this.form.get('firstName')?.valid ?? false) && 
          (this.form.get('lastName')?.valid ?? false);
      default:
        return true;
    }
  }

  private async createLoading() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      spinner: 'crescent',
      backdropDismiss: false,
      keyboardClose: true,
      cssClass: 'custom-loading',
    });
  
    return loading;
  }
  
  resetForm(form: FormGroup) {
    form.reset();
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
    
  showToastMessage(type: 'success' | 'error' | 'warning' | '', title: string, message: string) {
    this.toastType = type;
    this.toastTitle = title;
    this.toastMessage = message;
    this.showToast = true;

    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 6000);
  }

  // Handles authentication-related errors and shows a toast message for FastAPI
  handleAuthError(error: any) {
    let errorMessage = 'An error occurred. Please try again.';
    
    // Check the error status to provide specific messages
    if (error.status === 401) {
      // Handle Unauthorized error (invalid credentials)
      errorMessage = 'Invalid credentials. Please check your username and password.';
    } else if (error.status === 404) {
      // Handle Not Found error (user not found)
      errorMessage = 'User not found. Please check your username or email.';
    } else if (error.status === 422) {
      // Handle Unprocessable Entity error (invalid input or validation failure)
      if (error.error?.detail?.includes('username') || error.error?.detail?.includes('email')) {
        errorMessage = 'The username or email is already in use. Please choose a different one.';
      } else if (error.error?.detail?.includes('password')) {
        errorMessage = 'Password does not meet the required criteria. Please try again.';
      } else {
        errorMessage = 'There was an error with the form submission. Please review your entries.';
      }
    } else if (error.status === 403) {
      // Handle Forbidden error (role-based access control issue)
      errorMessage = 'You do not have permission to perform this action.';
    }
  
    // Show the error message using your Toast or Alert service
    this.presentToast(errorMessage, 'danger', 'top');
  }
  
  matchValidator(fieldName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const fieldValue = control.parent.get(fieldName)?.value;
      return control.value === fieldValue ? null : { mismatch: true };
    };
  }

  togglePasswordVisibility() {
    this.hide = !this.hide;
  }
  
  goBack() {
    this.navCtrl.back();
  }
}
