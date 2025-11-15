import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],

  // Standalone: Esto garantiza que FormsModule sea reconocido.
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    IonicModule,
    RouterModule,
  ]
})
export class ReportesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
