import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage {
// Define the plans
plans = [
  {
    id: 1,
    name: 'Free',
    type: 'Free',
    access: 'For small businesses and startups',
    yearlyPrice: 'Ksh 0 /year',
    monthlyPrice: 'Ksh 0 /month',
    features: ['1-2 Products', '100 SKUs', 'Basic reporting', 'Community support']
  },
  {
    id: 2,
    name: 'Standard',
    type: 'Standard',
    access: 'For small to medium businesses',
    yearlyPrice: 'Ksh 49 /year',
    monthlyPrice: 'Ksh 5 /month',
    features: ['Up to 5 Products', '1,000 SKUs', 'Barcode scanning', 'Standard reporting', 'Email support']
  },
  {
    id: 3,
    name: 'Professional',
    type: 'Professional',
    access: 'For growing businesses',
    yearlyPrice: 'Ksh 199 /year',
    monthlyPrice: 'Ksh 19 /month',
    features: ['Unlimited SKUs & Products', 'Advanced analytics', 'E-commerce integrations', 'Workflow automation', 'Chat support']
  },
  {
    id: 4,
    name: 'Business',
    type: 'Business',
    access: 'For teams and larger operations',
    yearlyPrice: 'Ksh 499 /year',
    monthlyPrice: 'Ksh 49 /month',
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

// Filter plans into two categories
businessAndEnterprisePlans = this.plans.filter(plan => plan.type === 'Business' || plan.type === 'Enterprise');
otherPlans = this.plans.filter(plan => plan.type !== 'Business' && plan.type !== 'Enterprise');

constructor(private router: Router) { 
}

ngOnInit() {
}

billingPeriod: string = 'yearly';

purchasePlan(planId: number) {
  // console.log(`Purchasing plan with ID: Ksh {planId} and Ksh {this.billingPeriod} billing.`);
  this.router.navigate(['/home/register'], { queryParams: { planId } });
}

contactCompany() {
  // our newsletter
  console.log('Contacting company for enterprise solutions.');
}

getStarted(){
document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
}

freeTrial(){
this.purchasePlan(1)
}
}
