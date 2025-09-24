import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomModalComponent } from '../components/custom-modal/custom-modal.component';
import { catchError, of, timeout } from 'rxjs';
import { SuppliersService } from '../services/suppliers.service';
import { Router, RouterLink } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalController, IonicModule } from '@ionic/angular';
import { SearchFilterComponent } from "../components/search-filter/search-filter.component";

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.page.html',
  styleUrls: ['./suppliers.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SearchFilterComponent, IonicModule, RouterLink]
})
export class SuppliersPage implements OnInit {

  @ViewChild(DatatableComponent) table!: DatatableComponent;
  ColumnMode = ColumnMode;
  loadingIndicator!: boolean;
  rows: any[] = [];
  userData:any[] = []
  isLoading = signal(false);

  constructor(private modalCtrl: ModalController, private router: Router, private team:SuppliersService) { }

  ngOnInit() {
    this.getTeam()
  }

  getTeam(){
    this.isLoading.set(true)
    const apiTimeout = 30000; 
    this.team.getSuppliers().pipe(
      timeout(apiTimeout),
      catchError((error) => {
        // console.error('Error or timeout occurred:', error);
        // this.showAlert('Tmeout Error', 'Error or timeout occurred. Please try again later.', ['OK'], 'danger');
        return of([]); 
      })
    ).subscribe({
      next: (data:any) => {
        this.userData = data
        // console.log(`User data:}`, this.userData)
        this.isLoading.set(false)
      },
      error: (error) => {
        this.isLoading.set(false)
        // this.showAlert('Error', 'Unable to load stock data. Please try again later.', ['OK'], 'danger');
      }
    })
  }
  
  teams = [
    { name: 'Ryan Samuel', role: 'FINANCIAL EXAMINER', image: 'assets/images/bg_2.jpg', email:'myemail@mil.kom' },
    { name: 'Jordan Michael', role: 'FRONT END DEVELOPER', image: 'assets/images/bg_3.jpg', email:'myemail@mil.kom' }
  ];
  
  async openModal() {
    const modal = await this.modalCtrl.create({
      component: CustomModalComponent,
      componentProps: {
        title: 'remove User',
        content: 'Are you sure you want to remove user?',
        icon: 'person-remove-sharp',
        backdropDismiss: false,
        button: {
          text: 'Confirm',
          handler: async (modalRef: HTMLIonModalElement) => {
            console.log('Action confirmed!');
            await this.modalCtrl.dismiss();
          }
        }
      },
      cssClass: 'custom-modal',
      backdropDismiss: false, 
    });
  
    await modal.present();
  }

  handleImageError(event: any) {
    event.target.src = '../../assets/images/user.jpg';  
  }

  async updateDetails(userId: any) {
    try {
      this.router.navigate(['/userEdit'], { queryParams: { userId: userId } });
    } catch (error) {
      // this.showAlert('Error', 'Failed to fetch items. Please try again.', ['OK'], 'danger');
    }
  }
}
