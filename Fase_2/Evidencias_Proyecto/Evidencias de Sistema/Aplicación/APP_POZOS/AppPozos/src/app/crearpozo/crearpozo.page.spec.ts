import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearpozoPage } from './crearpozo.page';

describe('CrearpozoPage', () => {
  let component: CrearpozoPage;
  let fixture: ComponentFixture<CrearpozoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearpozoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
