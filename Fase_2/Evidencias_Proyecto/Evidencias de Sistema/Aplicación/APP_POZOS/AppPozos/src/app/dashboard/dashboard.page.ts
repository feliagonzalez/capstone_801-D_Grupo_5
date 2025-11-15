import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// 1. IMPORTA 'Map' DE LEAFLET
import { Map, latLng, tileLayer, marker, icon } from 'leaflet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],

  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    LeafletModule
  ]
})
export class DashboardPage implements OnInit {

  
  private map!: Map;


  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 18, 
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        keepBuffer: 10
      })
    ],
    zoom: 13,
    center: latLng(-33.59822, -70.71881),
    fadeAnimation: true,
  };

  
  layers = [
    marker([-33.59822, -70.71881], {
      icon: icon({
         iconSize: [ 25, 41 ],
         iconAnchor: [ 13, 41 ],
         iconUrl: 'assets/marker-icon.png',
         shadowUrl: 'assets/marker-shadow.png'
      })
    })
  ];

  constructor() {} 

  ngOnInit() {
  }

  
  onMapReady(map: Map) {
    this.map = map;
  }

  
  ionViewDidEnter() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize(); 
      }, 500);
    }
  }
}